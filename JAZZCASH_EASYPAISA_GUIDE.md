# JazzCash & Easypaisa Payments — Setup Guide (Non-Technical)

This guide explains how to turn on real online payments on the DietAndWell
website. The website's code is already prepared: there are two payment
"stubs" (JazzCash and Easypaisa) that currently refuse payments with the
message "not configured yet". Once you get your merchant credentials from
each provider and a developer fills them into the server's `.env` file,
the stubs can be completed and payments will work.

You do NOT need to write any code to follow this guide — but the final
implementation step needs a developer.

---

## Part 1 — Getting JazzCash merchant credentials

1. Go to the JazzCash merchant portal: **https://www.jazzcash.com.pk** and
   look for "Become a Merchant" / "Merchant Signup" (or contact JazzCash
   business sales directly — search "JazzCash merchant account").
2. Register your business. You will typically be asked for:
   - Business name and NTN / registration documents
   - Owner CNIC
   - Business bank account details (for settlements)
   - Website URL (dietandwell.com)
3. After approval, JazzCash issues **sandbox (test)** credentials first and
   then **production** credentials. You need:
   - **Merchant ID**
   - **Password** (API password, not the portal login)
   - **Secure hash / integrity salt** (used to sign requests)
   - The **transaction POST URL** (different for sandbox vs production)
   - The **return URL** on YOUR website where customers come back after
     paying (your developer will set this, e.g.
     `https://dietandwell.com/payment/jazzcash/callback`)
4. Keep these secret — they are the keys to your money. Never share them
   in chat screenshots or email threads.

## Part 2 — Getting Easypaisa merchant credentials

1. Easypaisa business onboarding is done through **Telenor Bank /
   Easypaisa merchant services**: search "Easypaisa merchant account" or
   visit **https://www.easypaisa.com.pk** and find the merchant / business
   section.
2. Registration asks for the same kind of documents as JazzCash (business
   proof, owner CNIC, settlement bank account).
3. After approval you receive (names vary slightly by integration type):
   - **Store ID**
   - **Hash key / secret** (for signing requests)
   - **Merchant account number**
   - The API endpoint URLs (sandbox + production)
4. Keep these secret as well.

## Part 3 — The exact `.env` keys the code will read

Give these to your developer. They go into the backend server's `.env`
file (never committed to git, never shared publicly):

```env
# --- JazzCash ---
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_SECURE_HASH=
JAZZCASH_RETURN_URL=https://dietandwell.com/payment/jazzcash/callback
JAZZCASH_TRANSACTION_URL=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/   # sandbox; production URL differs
JAZZCASH_SANDBOX=true

# --- Easypaisa ---
EASYPaisa_STORE_ID=
EASYPaisa_HASH_KEY=
EASYPaisa_MERCHANT_ACCOUNT=
EASYPaisa_RETURN_URL=https://dietandwell.com/payment/easypaisa/callback
EASYPaisa_API_URL=https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction   # sandbox; production URL differs
EASYPaisa_SANDBOX=true
```

(These key names are also documented in `backend/.env.example`.)

## Part 4 — What the developer implements (code sketch)

The stubs live in `backend/src/payments/`:

- `payment-provider.interface.ts` — the `PaymentProvider` contract both
  providers follow (`initiatePayment()` / `verifyCallback()`).
- `jazzcash.service.ts` — `JazzCashService`
- `easypaisa.service.ts` — `EasypaisaService`

The flow for each provider is the same:

```
1. INITIATE (server -> provider)
   Customer clicks Pay -> backend calls initiatePayment({ orderId, amountPkr, ... })
   -> server builds the provider's signed request (hash with the secure hash key)
   -> returns redirectUrl -> frontend sends the customer there.

2. CUSTOMER PAYS on the provider's page (JazzCash/Easypaisa handle the money).

3. CALLBACK / IPN VERIFY (provider -> server)
   Provider posts the result to our RETURN_URL (or a server-to-server IPN URL).
   -> backend calls verifyCallback(payload)
   -> re-compute the signature from the payload + our secret hash key
   -> ONLY if the signature matches AND the provider says "success":
        mark the digital order / cart order as paid (and grant the download).
   -> If the signature does NOT match: reject it (never trust an unsigned callback).
```

Sketch of `initiatePayment` for JazzCash (developer fills in the real fields):

```ts
async initiatePayment(input: InitiatePaymentInput) {
  const cfg = this.configService; // reads JAZZCASH_* from .env
  const payload = {
    pp_MerchantID: cfg.get('JAZZCASH_MERCHANT_ID'),
    pp_TxnRefNo: `DW-${input.orderId}-${Date.now()}`,
    pp_Amount: Math.round(input.amountPkr * 100), // paisa
    pp_ReturnURL: cfg.get('JAZZCASH_RETURN_URL'),
    // ... other required JazzCash fields (see their integration doc)
  };
  payload.pp_SecureHash = sign(payload, cfg.get('JAZZCASH_SECURE_HASH'));
  // JazzCash uses a form POST to their transaction URL:
  return { redirectUrl: buildAutoSubmitForm(cfg.get('JAZZCASH_TRANSACTION_URL'), payload) };
}
```

And `verifyCallback` for either provider follows the same shape:

```ts
async verifyCallback(payload: Record<string, unknown>) {
  const expected = sign(payload, SECRET_FROM_ENV); // same algorithm as initiate
  if (expected !== payload.pp_SecureHash /* provider's field name */) {
    return { verified: false, reason: 'signature mismatch' };
  }
  const success = providerSaysSuccess(payload); // e.g. response code '000'
  return { verified: success, orderId: extractOrderId(payload), ... };
}
```

## Part 5 — Testing checklist (before going live)

1. Set `JAZZCASH_SANDBOX=true` / `EASYPaisa_SANDBOX=true` and use the test
   credentials — never test with real money.
2. Place a test order for a digital product, pay with the provider's test
   wallet/card, and confirm:
   - the callback reaches the server,
   - the signature verifies,
   - the order status flips to paid/granted,
   - the customer can download the file.
3. Test a FAILED payment too (wrong PIN / cancelled) — the order must stay
   unpaid and no file may be downloadable.
4. Only then switch to production credentials and set `*_SANDBOX=false`.

---

**Current state:** both provider classes exist as stubs. Calling either
method returns HTTP **501** with the message
"<Provider> is not configured yet — see JAZZCASH_EASYPAISA_GUIDE.md".
No payment endpoints are exposed publicly until a developer completes the
stubs above.
