export interface Item {
  name: Level_Name;
  amount: number;
  description: string;
  quantity: number;
}

export interface BillingData {
  apartment: string;
  first_name: string;
  last_name: string;
  street: string;
  building: string;
  phone_number: string;
  city: string;
  country: string;
  email: string;
  floor: string;
  state: string;
}

export class PaymentRequest {
  amount: number;
  currency: string;
  payment_methods: number[];
  items: Item[];
  billing_data: BillingData;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
export enum Level_Name {
  LEVEL_A1 = 'LEVEL_A1',
  LEVEL_A2 = 'LEVEL_A2',
  LEVEL_B1 = 'LEVEL_B1',
  LEVEL_B2 = 'LEVEL_B2',
  LEVEL_C1 = 'LEVEL_C1',
  LEVEL_C2 = 'LEVEL_C2',
}
