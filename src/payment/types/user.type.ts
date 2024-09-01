

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: Address;
}

type Address = {
  apartment: string;
  floor: string;
  building: string;
  street: string;
  city: string;
  country: string;
  state: string;
  zip_code: string;
};
