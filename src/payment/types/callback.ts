export interface PaymentPostBodyCallback {
  type: string;
  obj: Obj;
  issuer_bank: null;
  transaction_processed_callback_responses: string;
  hmac?: string
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
  created_at: Date;
  transaction_processed_callback_responses: any[];
  currency: string;
  source_data: SourceData;
  api_source: string;
  terminal_id: null;
  merchant_commission: number;
  installment: null;
  discount_details: any[];
  is_void: boolean;
  is_refund: boolean;
  data: ObjData;
  is_hidden: boolean;
  payment_key_claims: PaymentKeyClaims;
  error_occured: boolean;
  is_live: boolean;
  other_endpoint_reference: null;
  refunded_amount_cents: number;
  source_id: number;
  is_captured: boolean;
  captured_amount: number;
  merchant_staff_tag: null;
  updated_at: Date;
  is_settled: boolean;
  bill_balanced: boolean;
  is_bill: boolean;
  owner: number;
  parent_transaction: null;
}

export interface ObjData {
  gateway_integration_pk: number;
  klass: string;
  created_at: Date;
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
  creationTime: Date;
  currency: string;
  description: string;
  id: string;
  lastUpdatedTime: Date;
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
  settlementDate: Date;
  timeZone: string;
  transactionId: string;
}

export interface Order {
  id: number;
  created_at: Date;
  delivery_needed: boolean;
  merchant: Merchant;
  collector: null;
  amount_cents: number;
  shipping_data: IngData;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: null;
  wallet_notification: null;
  paid_amount_cents: number;
  notify_user_with_email: boolean;
  items: any[];
  order_url: string;
  commission_fees: number;
  delivery_fees_cents: number;
  delivery_vat_cents: number;
  payment_method: string;
  merchant_staff_tag: null;
  api_source: string;
  data: ExtraClass;
}

export interface ExtraClass { }

export interface Merchant {
  id: number;
  created_at: Date;
  phones: string[];
  company_emails: string[];
  company_name: string;
  state: string;
  country: string;
  city: string;
  postal_code: string;
  street: string;
}

export interface IngData {
  id?: number;
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
  shipping_method?: string;
  order_id?: number;
  order?: number;
}

export interface PaymentKeyClaims {
  extra: ExtraClass;
  user_id: number;
  currency: string;
  order_id: number;
  amount_cents: number;
  billing_data: IngData;
  redirect_url: string;
  integration_id: number;
  lock_order_when_paid: boolean;
  next_payment_intention: string;
  single_payment_attempt: boolean;
}

export interface SourceData {
  pan: string;
  type: string;
  tenure: null;
  sub_type: string;
}
