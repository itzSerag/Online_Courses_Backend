import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async createLesson(data: {
    title: string;
    content: string;
    order: number;
    courseId: number;
  }) {
    return this.prisma.lesson.create({
      data,
    });
  }

  async getLessonById(id: number) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  async updateLesson(
    id: number,
    data: {
      title?: string;
      content?: string;
      order?: number;
    },
  ) {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async deleteLesson(id: number) {
    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
