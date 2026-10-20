import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities';

/** Keys the public endpoint is allowed to reveal. */
export const PUBLIC_SETTING_KEYS = ['bank_account_details', 'support_phone', 'support_email'];

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /** Public snapshot: whitelisted keys only, returned as a plain object. */
  async getPublic(): Promise<Record<string, string>> {
    const rows = await this.settingRepository.find({
      where: PUBLIC_SETTING_KEYS.map((key) => ({ key })),
    });
    const out: Record<string, string> = {};
    for (const row of rows) {
      out[row.key] = row.value;
    }
    return out;
  }

  async getAll(): Promise<Array<{ key: string; value: string }>> {
    const rows = await this.settingRepository.find({ order: { key: 'ASC' } });
    return rows.map((r) => ({ key: r.key, value: r.value }));
  }

  /** Upsert a setting. */
  async upsert(key: string, value: string): Promise<{ key: string; value: string }> {
    const k = String(key ?? '').trim();
    if (!k) {
      throw new BadRequestException('key is required');
    }
    if (typeof value !== 'string') {
      throw new BadRequestException('value must be a string');
    }
    let row = await this.settingRepository.findOne({ where: { key: k } });
    if (!row) {
      row = this.settingRepository.create({ key: k, value });
    } else {
      row.value = value;
    }
    const saved = await this.settingRepository.save(row);
    return { key: saved.key, value: saved.value };
  }
}
