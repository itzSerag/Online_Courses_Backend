import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) { }

  async createOtp(email: string, otp: string): Promise<void> {
    await this.prisma.oTP.upsert({
      where: { email },
      update: { otp },
      create: { email, otp },
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = await this.prisma.oTP.findUnique({
      where: { email },
    });

    if (!record) return false;
    return record.otp === otp;
  }

  async deleteOtp(email: string): Promise<void> {
    try {
      await this.prisma.oTP.delete({
        where: { email },
      });
    } catch (error) {
      // If already deleted or not found, ignore
    }
  }

  async getOtp(email: string): Promise<string> {
    const record = await this.prisma.oTP.findUnique({
      where: { email },
    });

    if (!record) throw new NotFoundException('OTP not found');
    return record.otp;
  }
}
