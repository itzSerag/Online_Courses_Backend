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

  async createUser(data: { email: string; password: string; name: string }) {
    return this.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return this.user.findUnique({ where: { email } });
  }

  async createCourse(data: {
    title: string;
    description: string;
    price: number;
    categoryId: number;
    coverImage?: string;
  }) {
    return this.course.create({ data });
  }

  async getAllCourses() {
    return this.course.findMany({ include: { category: true } });
  }

  async getCourseById(id: number) {
    return this.course.findUnique({
      where: { id },
      include: { category: true, lessons: true },
    });
  }

  async createCategory(name: string) {
    return this.category.create({ data: { name } });
  }

  async getAllCategories() {
    return this.category.findMany();
  }

  async createLesson(data: {
    title: string;
    content: string;
    order: number;
    courseId: number;
  }) {
    return this.lesson.create({ data });
  }

  async createSubscription(userId: number, courseId: number, endDate: Date) {
    return this.subscription.create({
      data: { userId, courseId, endDate },
    });
  }

  async getUserSubscriptions(userId: number) {
    return this.subscription.findMany({
      where: { userId },
      include: { course: true },
    });
  }

  async createPayment(
    userId: number,
    amount: number,
    status: 'PENDING' | 'COMPLETED' | 'FAILED',
  ) {
    return this.payment.create({
      data: { userId, amount, status },
    });
  }

  async getUserPayments(userId: number) {
    return this.payment.findMany({ where: { userId } });
  }
}
