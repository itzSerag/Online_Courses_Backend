// src/types/types.ts
import { Prisma } from '@prisma/client';

// export type UserWithoutPassword = Omit<Prisma.UserCreateInput, 'password'>;

export type UserWithId = Prisma.UserCreateInput & { id: number };

export type UserWithoutPassword = Omit<UserWithId, 'password'>;
