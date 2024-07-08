import { Inject, Injectable } from '@nestjs/common';
import { AbstractMailService } from '../abstract-mail.service';
import type { IMailgunClient } from 'mailgun.js/Interfaces/MailgunClient';
import { MAILGUN_CLIENT_TOKEN, MAILGUN_CONFIG_TOKEN } from '../../constants';
import {
  EmailDataType,
  MessageContentDto,
  SendEmailDto,
  SendEmailResult,
} from './vo';
import { MailgunConfig } from '../../config';
import { GeneralInternalServerException } from '@softkit/exceptions';
import type { AtLeastOneKeyPresent } from 'mailgun.js';

@Injectable()
export class MailgunService extends AbstractMailService<string> {
  constructor(
    @Inject(MAILGUN_CLIENT_TOKEN) private mailgun: IMailgunClient,
    @Inject(MAILGUN_CONFIG_TOKEN) private config: MailgunConfig,
  ) {
    super();
  }

  override async sendEmail(emailData: EmailDataType) {
    const fromAddress = emailData.from ?? this.config.defaultFromEmail;
    const bcc = emailData.bcc ?? this.config.defaultBccList;

    const { attachment, cc, html, subject, text, ...rest } = emailData;

    if (html || text) {
      const content = (
        html ? { html } : { text }
      ) as AtLeastOneKeyPresent<MessageContentDto>;

      return this.mailgun.messages.create(this.config.domain, {
        from: fromAddress,
        bcc,
        name: emailData.userFullName,
        attachment,
        cc,
        subject,
        ...content,
        ...rest,
      });
    } else {
      throw new GeneralInternalServerException(
        undefined,
        `Looks like a developer mistake either html or text must be provided. Take a look now.`,
      );
    }
  }

  override async sendTemplateEmail(
    templateId: string,
    emailData: SendEmailDto,
    emailTemplateParams?: object,
  ): Promise<SendEmailResult> {
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
      this.logger.log(
        `sendTemplateEmail: 'emailTemplateParams' is undefined or null. The email will be sent without template variables.`,
      );
    }

    const fromAddress = emailData.from ?? this.config.defaultFromEmail;
    const bcc = emailData.bcc ?? this.config.defaultBccList;

    const { attachment, cc, subject, ...rest } = emailData;

    return this.mailgun.messages.create(this.config.domain, {
      from: fromAddress,
      name: emailData.userFullName,
      attachment,
      cc,
      bcc,
      subject,
      template: templateId,
      ...rest,
      ...templateVariables,
    });
  }
}
