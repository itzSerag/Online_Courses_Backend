// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return this.user.findUnique({ where: { email } });
  }
}
