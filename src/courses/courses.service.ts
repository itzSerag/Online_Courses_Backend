import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(data: {
    title: string;
    description: string;
    price: number;
    categoryId: number;
    coverImage?: string;
  }) {
    return this.prisma.course.create({
      data,
    });
  }

  async getAllCourses() {
    return this.prisma.course.findMany({
      include: { category: true },
    });
  }

  async getCourseById(id: number) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { category: true, lessons: true },
    });
  }

  async updateCourse(
    id: number,
    data: {
      title?: string;
      description?: string;
      price?: number;
      categoryId?: number;
      coverImage?: string;
    },
  ) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async deleteCourse(id: number) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
