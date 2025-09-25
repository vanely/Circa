import nodemailer from 'nodemailer';

// Add missing environment variable to config
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_FROM?: string;
      EMAIL_PROVIDER?: string;
      EMAIL_USER?: string;
      EMAIL_PASSWORD?: string;
      EMAIL_HOST?: string;
      EMAIL_PORT?: string;
    }
  }
}

class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
      // In development, use a test account
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email', // Replace with actual Ethereal account if needed
          pass: 'ethereal.pass',
        },
      });
    } else {
      // In production, use configured email provider
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async sendMagicLink(email: string, token: string, origin: string): Promise<void> {
    const magicLink = `${origin}/auth/verify?token=${token}`;
    
    const message = {
      from: process.env.EMAIL_FROM || 'no-reply@circa.app',
      to: email,
      subject: 'Log in to Circa',
      text: `Click this link to log in to Circa: ${magicLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Log in to Circa</h2>
          <p>Click the button below to log in to your Circa account:</p>
          <div style="margin: 30px 0;">
            <a 
              href="${magicLink}" 
              style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"
            >
              Log in to Circa
            </a>
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${magicLink}</p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this link, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(message);
      
      // Log message URL in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send magic link email');
    }
  }

  async sendEventInvitation(
    email: string, 
    eventTitle: string, 
    hostName: string,
    eventDate: string,
    eventUrl: string,
    origin: string
  ): Promise<void> {
    const message = {
      from: process.env.EMAIL_FROM || 'no-reply@circa.app',
      to: email,
      subject: `You're invited to ${eventTitle}`,
      text: `${hostName} has invited you to ${eventTitle} on ${eventDate}. View event: ${eventUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>${hostName} has invited you to:</p>
          <h3>${eventTitle}</h3>
          <p><strong>When:</strong> ${eventDate}</p>
          <div style="margin: 30px 0;">
            <a 
              href="${eventUrl}" 
              style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"
            >
              View Event Details
            </a>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(message);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();
