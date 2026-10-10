import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from '../entities';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {}

  async findAll() {
    return this.metricRepository.find({
      order: {
        sortOrder: 'ASC',
      },
    });
  }
}
