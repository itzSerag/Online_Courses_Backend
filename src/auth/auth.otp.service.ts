import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) { }

  async createOtp(email: string, otp: string) {
    return this.prisma.oTP.upsert({
      where: { email },
      update: { otp },
      create: { email, otp },
    });
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.oTP.findUnique({
      where: { email },
    });

    return otpRecord?.otp === otp;
  }

  async deleteOtp(email: string): Promise<void> {
    await this.prisma.oTP.deleteMany({
      where: { email },
    });
  }

  async getOtp(email: string): Promise<string> {
    const otpRecord = await this.prisma.oTP.findUnique({
      where: { email },
    });

    return otpRecord?.otp;
  }


}
