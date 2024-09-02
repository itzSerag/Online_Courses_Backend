import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { log } from 'console';

@Injectable()
export class EmailService {
  private AWS_SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };

  private AWS_SES = new AWS.SES(this.AWS_SES_CONFIG);

  constructor(private configService: ConfigService) {
    this.AWS_SES = new AWS.SES(this.AWS_SES_CONFIG);
  }

  async sendEmail(to: string, otp: string) {
    const params = {
      Source: 'seragmahmoud62@gmail.com',
      Destination: {
        ToAddresses: [to],
      },

      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html>
              <head>
                <style>
                  .container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  }
                  .content {
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
                  }
                  .content h1 {
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                  }
                  .content p {
                    color: #666;
                    font-size: 16px;
                  }
                  .content .otp {
                    color: #333;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 20px;
                  }
                </style>
                ;
              </head>
              <body>
                <div class="container">
                  <div class="content">
                    <h1>Hi there!</h1>
                    <p>Your OTP is:</p>
                    <p class="otp">${otp}</p>

                    <p>Thanks</p>

                  </div>
                </div>
              </body>
            </html>`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Your OTP',
        },
      },
    };

    return new Promise((resolve, reject) => {
      this.AWS_SES.sendEmail(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
