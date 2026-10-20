import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from '../entities';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Subscriber)
    private subscriberRepository: Repository<Subscriber>,
  ) {}

  /**
   * Idempotent subscribe: re-subscribing an existing address returns success
   * without creating a duplicate row (email is unique in the DB).
   */
  async subscribe(subscribeDto: SubscribeDto) {
    const email = subscribeDto.email.toLowerCase().trim();
    const existing = await this.subscriberRepository.findOne({ where: { email } });
    if (existing) {
      return {
        success: true,
        message: 'You are already subscribed.',
        subscriber: existing,
      };
    }
    const subscriber = await this.subscriberRepository.save(
      this.subscriberRepository.create({ email }),
    );
    return {
      success: true,
      message: 'Subscribed successfully.',
      subscriber,
    };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [subscribers, total] = await this.subscriberRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { subscribers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async remove(id: string): Promise<void> {
    const result = await this.subscriberRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Subscriber not found');
    }
  }
}
