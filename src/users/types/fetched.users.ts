// src/types/types.ts
import { Prisma } from '@prisma/client';

// export type UserWithoutPassword = Omit<Prisma.UserCreateInput, 'password'>;

export type UserWithId = Prisma.UserCreateInput & { id: number; otp?: string };

export type UserWithoutPassword = Omit<UserWithId, 'password'>;
