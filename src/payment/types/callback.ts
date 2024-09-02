export interface paymentCallback {
    type: string;
    obj: Obj;
    issuer_bank?: null;
    transaction_processed_callback_responses: string;
  }
  export interface Obj {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: Order;
    created_at: string;
    transaction_processed_callback_responses?: (null)[] | null;
    currency: string;
    source_data: SourceData;
    api_source: string;
    terminal_id?: null;
    merchant_commission: number;
    installment?: null;
    discount_details?: (null)[] | null;
    is_void: boolean;
    is_refund: boolean;
    data: Data;
    is_hidden: boolean;
    payment_key_claims: PaymentKeyClaims;
    error_occured: boolean;
    is_live: boolean;
    other_endpoint_reference?: null;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    merchant_staff_tag?: null;
    updated_at: string;
    is_settled: boolean;
    bill_balanced: boolean;
    is_bill: boolean;
    owner: number;
    parent_transaction?: null;
  }
  export interface Order {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: Merchant;
    collector?: null;
    amount_cents: number;
    shipping_data: ShippingData;
    currency: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    merchant_order_id?: null;
    wallet_notification?: null;
    paid_amount_cents: number;
    notify_user_with_email: boolean;
    items?: (null)[] | null;
    order_url: string;
    commission_fees: number;
    delivery_fees_cents: number;
    delivery_vat_cents: number;
    payment_method: string;
    merchant_staff_tag?: null;
    api_source: string;
    data: DataOrExtra;
  }
  export interface Merchant {
    id: number;
    created_at: string;
    phones?: (string)[] | null;
    company_emails?: (string)[] | null;
    company_name: string;
    state: string;
    country: string;
    city: string;
    postal_code: string;
    street: string;
  }
  export interface ShippingData {
    id: number;
    first_name: string;
    last_name: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
    city: string;
    state: string;
    country: string;
    email: string;
    phone_number: string;
    postal_code: string;
    extra_description: string;
    shipping_method: string;
    order_id: number;
    order: number;
  }
  export interface DataOrExtra {
  }
  export interface SourceData {
    pan: string;
    type: string;
    tenure?: null;
    sub_type: string;
  }
  export interface Data {
    gateway_integration_pk: number;
    klass: string;
    created_at: string;
    amount: number;
    currency: string;
    migs_order: MigsOrder;
    merchant: string;
    migs_result: string;
    migs_transaction: MigsTransaction;
    txn_response_code: string;
    acq_response_code: string;
    message: string;
    merchant_txn_ref: string;
    order_info: string;
    receipt_no: string;
    transaction_no: string;
    batch_no: number;
    authorize_id: string;
    card_type: string;
    card_num: string;
    secure_hash: string;
    avs_result_code: string;
    avs_acq_response_code: string;
    captured_amount: number;
    authorised_amount: number;
    refunded_amount: number;
    acs_eci: string;
  }
  export interface MigsOrder {
    acceptPartialAmount: boolean;
    amount: number;
    authenticationStatus: string;
    chargeback: Chargeback;
    creationTime: string;
    currency: string;
    description: string;
    id: string;
    lastUpdatedTime: string;
    merchantAmount: number;
    merchantCategoryCode: string;
    merchantCurrency: string;
    status: string;
    totalAuthorizedAmount: number;
    totalCapturedAmount: number;
    totalRefundedAmount: number;
  }
  export interface Chargeback {
    amount: number;
    currency: string;
  }
  export interface MigsTransaction {
    acquirer: Acquirer;
    amount: number;
    authenticationStatus: string;
    authorizationCode: string;
    currency: string;
    id: string;
    receipt: string;
    source: string;
    stan: string;
    terminal: string;
    type: string;
  }
  export interface Acquirer {
    batch: number;
    date: string;
    id: string;
    merchantId: string;
    settlementDate: string;
    timeZone: string;
    transactionId: string;
  }
  export interface PaymentKeyClaims {
    extra: DataOrExtra;
    user_id: number;
    currency: string;
    order_id: number;
    amount_cents: number;
    billing_data: BillingData;
    redirect_url: string;
    integration_id: number;
    lock_order_when_paid: boolean;
    next_payment_intention: string;
    single_payment_attempt: boolean;
  }
  export interface BillingData {
    city: string;
    email: string;
    floor: string;
    state: string;
    street: string;
    country: string;
    building: string;
    apartment: string;
    last_name: string;
    first_name: string;
    postal_code: string;
    phone_number: string;
    extra_description: string;
  }
  