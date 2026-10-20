import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  PaymentProvider,
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyCallbackResult,
} from './payment-provider.interface';

/**
 * JazzCash payment provider.
 *
 * STUB — every method throws 501 until it is implemented with real
 * merchant credentials. See JAZZCASH_EASYPAISA_GUIDE.md at the project
 * root for the non-technical setup steps and the exact .env keys.
 */
@Injectable()
export class JazzCashService implements PaymentProvider {
  readonly providerName = 'JazzCash';

  async initiatePayment(_input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    throw new HttpException(
      'JazzCash is not configured yet — see JAZZCASH_EASYPAISA_GUIDE.md',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async verifyCallback(
    _payload: Record<string, unknown>,
  ): Promise<VerifyCallbackResult> {
    throw new HttpException(
      'JazzCash is not configured yet — see JAZZCASH_EASYPAISA_GUIDE.md',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
