import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get('EMAIL_USER');
    const pass = this.configService.get('EMAIL_PASSWORD');
    this.from = this.configService.get('EMAIL_FROM') || user || 'noreply@example.com';
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
      console.log('[Email] Gmail SMTP configured');
    } else {
      console.log('[Email] No credentials, running in dev mode');
    }
  }

  async sendResults(email: string, sessionId: string): Promise<void> {
    const resultsUrl = `${this.frontendUrl}/results/${sessionId}`;

    if (!this.transporter) {
      console.log(`[DEV] Would send email to ${email} with link: ${resultsUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Vox" <${this.from}>`,
        to: email,
        subject: 'Your Voice Compatibility Results Are Ready 💫',
        text: this.getEmailText(resultsUrl),
        html: this.getEmailHtml(resultsUrl),
      });

      console.log(`[Email] Sent results to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send:', error);
      throw error;
    }
  }

  private getEmailHtml(resultsUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="margin: 0; font-size: 36px;">
        <span style="color: #E91E63;">V</span><span style="color: #ffffff;">o</span><span style="color: #2196F3;">x</span>
      </h1>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 8px 0 0 0;">Voice Compatibility Analysis</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 24px;">Your Analysis is Ready!</h2>
      <p style="color: #666; margin: 0 0 30px 0; font-size: 16px;">
        We've analyzed the voice recordings and prepared a detailed compatibility report for you.
      </p>
      
      <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #E91E63 0%, #2196F3 100%); color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
        View Your Results
      </a>
    </div>
    
    <!-- What You'll Discover -->
    <div style="background: #f8f9fa; padding: 30px; border-top: 1px solid #eee;">
      <p style="margin: 0 0 15px 0; font-weight: 600; color: #1a1a2e;">What you'll discover:</p>
      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
        <li>Comfort and interest levels for each partner</li>
        <li>Comparison across 8 speech parameters</li>
        <li>Personalized recommendations for better communication</li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        This link is valid for 30 days.<br>
        If you didn't request this analysis, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getEmailText(resultsUrl: string): string {
    return `
Your Voice Compatibility Results Are Ready!

We've analyzed the voice recordings and prepared a detailed compatibility report for you.

View your results here: ${resultsUrl}

What you'll discover:
- Comfort and interest levels for each partner
- Comparison across 8 speech parameters
- Personalized recommendations for better communication

This link is valid for 30 days.
If you didn't request this analysis, please ignore this email.
    `.trim();
  }
}
