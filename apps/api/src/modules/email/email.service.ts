import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private from: string;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.from = this.configService.get('EMAIL_FROM') || 'Vox <noreply@example.com>';
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }

  async sendResults(email: string, sessionId: string): Promise<void> {
    const resultsUrl = `${this.frontendUrl}/results/${sessionId}`;

    if (!this.resend) {
      console.log(`[DEV] Would send email to ${email} with link: ${resultsUrl}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'Ваши результаты анализа совместимости готовы 💫',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E91E63; margin-bottom: 10px;">Vox</h1>
            <p style="color: #666; font-size: 14px;">Анализ голосовой совместимости</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #E91E63 0%, #2196F3 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 15px 0;">Ваш анализ готов! 🎉</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">
              Мы проанализировали голосовые записи и подготовили подробный отчёт о вашей совместимости.
            </p>
            <a href="${resultsUrl}" style="display: inline-block; background: white; color: #E91E63; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Посмотреть результаты
            </a>
          </div>
          
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Что вы узнаете:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 14px;">
              <li>Комфорт и интерес для каждого из вас</li>
              <li>Сравнение по 8 параметрам речи</li>
              <li>Персональные рекомендации</li>
            </ul>
          </div>
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Ссылка действительна в течение 30 дней.<br>
            Если вы не запрашивали этот анализ, просто проигнорируйте это письмо.
          </p>
        </body>
        </html>
      `,
    });
  }
}

