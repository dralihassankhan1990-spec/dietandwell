import { DataSource } from 'typeorm';
import { Setting } from '../entities/setting.entity';

const DEFAULT_BANK_ACCOUNT_DETAILS = [
  '[PLACEHOLDER - REPLACE IN ADMIN SETTINGS]',
  'Bank transfer details have not been added yet.',
  'The site admin must replace this text with the real account title,',
  'account number / IBAN and bank name before customers can pay by bank transfer.',
].join('\n');

/**
 * Seeds the default bank_account_details setting with clearly-marked
 * placeholder text. Skip-if-exists: an admin-entered value is never
 * overwritten.
 */
export async function seedDefaultSettings(dataSource: DataSource) {
  const repo = dataSource.getRepository(Setting);
  const existing = await repo.findOne({ where: { key: 'bank_account_details' } });
  if (existing) {
    console.log('  Skipping bank_account_details (already set)');
    return;
  }
  await repo.save(
    repo.create({ key: 'bank_account_details', value: DEFAULT_BANK_ACCOUNT_DETAILS }),
  );
  console.log('  Created bank_account_details (placeholder - admin must replace)');
}
