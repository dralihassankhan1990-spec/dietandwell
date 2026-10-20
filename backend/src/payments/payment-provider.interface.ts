/**
 * Common interface every payment provider implements.
 *
 * Flow: initiatePayment() builds the provider request and returns the URL
 * the customer is redirected to -> provider sends them back to our
 * return/callback URL -> verifyCallback() validates the provider's
 * signature and tells us whether the payment really succeeded.
 */

export interface InitiatePaymentInput {
  /** Our internal order id (digital order, cart order, ...). */
  orderId: string;
  /** Amount in PKR (minor units as sent to the provider are handled inside). */
  amountPkr: number;
  /** Customer contact details for the provider's form pre-fill. */
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Where the provider should send the customer back afterwards. */
  returnUrl: string;
}

export interface InitiatePaymentResult {
  /** Redirect the customer here to pay. */
  redirectUrl: string;
  /** Provider's transaction reference, if one is issued at initiation. */
  providerReference?: string;
}

export interface VerifyCallbackResult {
  /** Did the provider confirm a successful payment? */
  verified: boolean;
  /** Our order id echoed back by the provider (may be undefined when verification fails). */
  orderId?: string;
  /** Amount the provider says was paid, in PKR. */
  amountPkr?: number;
  /** Provider's own transaction id. */
  providerTransactionId?: string;
  /** Human-readable reason when verified === false. */
  reason?: string;
}

export interface PaymentProvider {
  readonly providerName: string;
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verifyCallback(
    payload: Record<string, unknown>,
  ): Promise<VerifyCallbackResult>;
}
