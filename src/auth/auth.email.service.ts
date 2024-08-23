import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';

@Injectable()
export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      SES: new AWS.SES({
        apiVersion: '2010-12-01',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      }),
    });
  }

  async sendEmail(to: string, subject: string) {
    return await this.transporter.sendMail({
      from: 'seragmahmoud62@gmail.com', // Replace with your verified SES email
      to,
      subject,
      html: '<h1> Hello </h1>',
    });
  }
}
