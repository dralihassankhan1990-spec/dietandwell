import { Module } from '@nestjs/common';
import { JazzCashService } from './jazzcash.service';
import { EasypaisaService } from './easypaisa.service';

@Module({
  providers: [JazzCashService, EasypaisaService],
  exports: [JazzCashService, EasypaisaService],
})
export class PaymentsModule {}
