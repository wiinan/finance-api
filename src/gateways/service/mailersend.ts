import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { MailsendDtoParams } from 'src/dtos/mailsend.dto';

@Injectable()
export class MailerSendService {
  constructor(private readonly httpModule: HttpService) {}

  public async sendEmail({
    email,
    subject,
    html,
    text,
  }: MailsendDtoParams): Promise<void> {
    const url = process.env.SEND_MAIL_URL || '';
    const token = process.env.SEND_MAIL_TOKEN || '';
    const data = {
      from: { email: process.env.SEND_MAIL_PROVIDER || '' },
      to: [{ email }],
      subject,
      text,
      html,
    };

    await this.httpModule.axiosRef.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  public mountHtmlAuthCode(code: string): string {
    return `
      <div>
        <p>O codigo para acesso a conta:</p>
        <string>${code}</string>
      </div>
    `;
  }
}
