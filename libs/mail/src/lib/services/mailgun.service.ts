import { Injectable, Inject } from '@nestjs/common';
import { AbstractMailService } from './abstract-mail.service';
import { IMailgunClient } from 'mailgun.js/Interfaces/MailgunClient';
import { MAILGUN_CLIENT_TOKEN } from '../constants';
import { EmailDataType, SendEmailResult } from './vo';
import { MailgunConfig } from '../config';
import { GeneralBadRequestException } from '@softkit/exceptions';

@Injectable()
export class MailgunService extends AbstractMailService<string> {
  constructor(
    @Inject(MAILGUN_CLIENT_TOKEN) private mailgun: IMailgunClient,
    private config: MailgunConfig,
  ) {
    super();
  }

  override async sendEmail(emailData: EmailDataType) {
    this.verifyMessageContent(emailData);
    const fromAddress = emailData.from ?? this.config.defaultFromEmail;
    const bcc = emailData.bcc ?? this.config.defaultBccList;

    return this.mailgun.messages.create(this.config.domain, {
      from: fromAddress,
      bcc,
      name: emailData.userFullName,
      attachment: emailData.attachment,
      cc: emailData.cc,
      html: emailData.html,
      message: emailData.message,
      subject: emailData.subject,
      text: emailData.text,
      template: '',
      ...emailData,
    });
  }

  override async sendTemplateEmail(
    templateId: string,
    emailData: EmailDataType,
    emailTemplateParams?: object,
  ): Promise<SendEmailResult> {
    this.verifyMessageContent(emailData, templateId);
    const templateVariables: { [key: string]: unknown } = {};

    if (emailTemplateParams) {
      for (const [key, value] of Object.entries(emailTemplateParams)) {
        if (typeof value === 'object' || Array.isArray(value)) {
          templateVariables[`v:${key}`] = JSON.stringify(value);
        } else {
          templateVariables[`v:${key}`] = String(value);
        }
      }
    } else {
      this.logger.warn(
        `sendTemplateEmail: 'emailTemplateParams' is undefined or null. The email will be sent without template variables.`,
      );
    }

    const fromAddress = emailData.from ?? this.config.defaultFromEmail;

    return await this.mailgun.messages.create(this.config.domain, {
      from: fromAddress,
      name: emailData.userFullName,
      attachment: emailData.attachment,
      cc: emailData.cc,
      html: emailData.html,
      message: emailData.message,
      subject: emailData.subject,
      text: emailData.text,
      template: templateId,
      ...emailData,
      ...templateVariables,
    });
  }

  private verifyMessageContent(
    emailData: EmailDataType,
    templateId?: string,
  ): void {
    const errors = [];

    if (!emailData.text && !emailData.html) {
      errors.push({
        property: 'content',
        constraints: {
          isNotEmpty:
            'Either "text" or "HTML" content must be provided for the email.',
        },
      });
    }

    if (emailData.html && templateId) {
      errors.push({
        property: 'templateHtmlConflict',
        constraints: {
          isInvalid:
            'Only one of the parameters ‘html’ or ‘template’ is allowed.',
        },
      });
    }

    if (errors.length > 0) {
      throw new GeneralBadRequestException(
        errors,
        'Validation failed for the email data',
      );
    }
  }
}
