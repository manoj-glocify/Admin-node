import nodemailer from 'nodemailer';
import { logger } from '../../../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  private async sendMail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: this.renderTemplate(options.template, options.context),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  private renderTemplate(template: string, context: Record<string, any>): string {
    // Simple template replacement
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      return context[key.trim()] || match;
    });
  }

  // User Registration Notification
  async sendUserRegistrationNotification(userEmail: string, firstName: string): Promise<void> {
    const template = `
      <h1>Welcome to {{appName}}!</h1>
      <p>Dear {{firstName}},</p>
      <p>Thank you for registering with {{appName}}. Your account has been successfully created.</p>
      <p>You can now login to your account using your email and password.</p>
      <p>Best regards,<br>{{appName}} Team</p>
    `;

    await this.sendMail({
      to: userEmail,
      subject: `Welcome to ${process.env.APP_NAME}`,
      template,
      context: {
        appName: process.env.APP_NAME,
        firstName,
      },
    });
  }

  // Admin Notification for New User
  async sendAdminNewUserNotification(adminEmail: string, userData: any): Promise<void> {
    const template = `
      <h1>New User Registration</h1>
      <p>A new user has registered:</p>
      <ul>
        <li>Name: {{firstName}} {{lastName}}</li>
        <li>Email: {{email}}</li>
        <li>Registration Date: {{registrationDate}}</li>
      </ul>
    `;

    await this.sendMail({
      to: adminEmail,
      subject: 'New User Registration Notification',
      template,
      context: {
        ...userData,
        registrationDate: new Date().toLocaleString(),
      },
    });
  }

  // Password Changed Notification
  async sendPasswordChangedNotification(userEmail: string, firstName: string): Promise<void> {
    const template = `
      <h1>Password Changed</h1>
      <p>Dear {{firstName}},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>Best regards,<br>{{appName}} Team</p>
    `;

    await this.sendMail({
      to: userEmail,
      subject: 'Password Changed Notification',
      template,
      context: {
        appName: process.env.APP_NAME,
        firstName,
      },
    });
  }

  // Password Reset Link
  async sendPasswordResetLink(userEmail: string, firstName: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const template = `
      <h1>Password Reset Request</h1>
      <p>Dear {{firstName}},</p>
      <p>You have requested to reset your password. Click the link below to reset your password:</p>
      <p><a href="{{resetLink}}">Reset Password</a></p>
      <p>This link will expire in {{resetExpiry}} hours.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>{{appName}} Team</p>
    `;

    await this.sendMail({
      to: userEmail,
      subject: 'Password Reset Request',
      template,
      context: {
        appName: process.env.APP_NAME,
        firstName,
        resetLink,
        resetExpiry: process.env.PASSWORD_RESET_EXPIRY || '24',
      },
    });
  }
}

export const emailService = new EmailService(); 