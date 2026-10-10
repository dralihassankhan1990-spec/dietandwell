import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInquiry, InquiryStatus } from '../entities';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactInquiry)
    private inquiryRepository: Repository<ContactInquiry>,
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<ContactInquiry> {
    const inquiry = this.inquiryRepository.create(createInquiryDto);
    return this.inquiryRepository.save(inquiry);
  }

  async findAll(page = 1, limit = 20) {
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
    };
  }

  async markAsRead(id: string): Promise<ContactInquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (inquiry) {
      inquiry.status = InquiryStatus.READ;
      return this.inquiryRepository.save(inquiry);
    }
    return inquiry;
  }
}
