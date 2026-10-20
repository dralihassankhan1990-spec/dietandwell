import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import { ContactInquiry, InquiryStatus } from '../entities';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactInquiry)
    private inquiryRepository: Repository<ContactInquiry>,
    private configService: ConfigService,
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<ContactInquiry> {
    const inquiry = this.inquiryRepository.create(createInquiryDto);
    const saved = await this.inquiryRepository.save(inquiry);
    // Email notification is best-effort and must NEVER fail the form.
    await this.sendNotificationEmail(saved);
    return saved;
  }

  async findAll(page = 1, limit = 20) {
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (page - 1) * limit;
    const [inquiries, total] = await this.inquiryRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      replyAvailable: !!this.configService.get<string>('RESEND_API_KEY'),
    };
  }

  async markAsRead(id: string): Promise<ContactInquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Contact inquiry not found');
    }
    if (inquiry.status === InquiryStatus.NEW) inquiry.status = InquiryStatus.READ;
    return this.inquiryRepository.save(inquiry);
  }

  async reply(id: string, message: string): Promise<ContactInquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException('Contact inquiry not found');
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new ServiceUnavailableException('Email is not configured. Set RESEND_API_KEY and a verified FROM_EMAIL on the server.');
    const resend = new Resend(apiKey);
    try {
      const result = await resend.emails.send({
        from: this.configService.get<string>('FROM_EMAIL', 'noreply@dietandwell.com'),
        to: inquiry.email,
        subject: 'Re: Your DietAndWell enquiry',
        text: message.trim(),
      });
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      this.logger.warn(`Contact reply failed: ${(error as Error).message}`);
      throw new ServiceUnavailableException('Email provider did not accept the reply. Your message has not been marked as sent.');
    }
    inquiry.status = InquiryStatus.REPLIED;
    // Preserve existing notes and keep a durable sent-message history without a schema change.
    inquiry.notes = [inquiry.notes, `[Reply accepted by email provider · ${new Date().toISOString()}]\n${message.trim()}`].filter(Boolean).join('\n\n');
    return this.inquiryRepository.save(inquiry);
  }

  /**
   * Sends the admin notification email via Resend ONLY when RESEND_API_KEY
   * is set. Otherwise logs and returns — the form still succeeds.
   */
  private async sendNotificationEmail(inquiry: ContactInquiry): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not set — contact notification email skipped (inquiry still saved).',
      );
      return;
    }
    const to =
      this.configService.get<string>('CONTACT_EMAIL') ||
      this.configService.get<string>('ADMIN_EMAIL') ||
      'contact@dietandwell.com';
    try {
      const resend = new Resend(apiKey);
      const from = this.configService.get<string>('FROM_EMAIL', 'noreply@dietandwell.com');
      const result = await resend.emails.send({
        from,
        to,
        subject: `New contact inquiry from ${inquiry.name}`,
        html: `<p><strong>Name:</strong> ${this.escapeHtml(inquiry.name)}</p>
<p><strong>Email:</strong> ${this.escapeHtml(inquiry.email)}</p>
<p><strong>Phone:</strong> ${this.escapeHtml(inquiry.phone || '-')}</p>
<p><strong>Message:</strong></p><p>${this.escapeHtml(inquiry.message)}</p>`,
      });
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      this.logger.warn(`Failed to send contact notification email: ${(error as Error).message}`);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
