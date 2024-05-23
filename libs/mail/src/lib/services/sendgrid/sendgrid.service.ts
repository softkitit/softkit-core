import { Inject, Injectable } from '@nestjs/common';
import { SENDGRID_CLIENT_TOKEN, SENDGRID_CONFIG_TOKEN } from '../../constants';
import {
  EmailDataType,
  MessageContentDto,
  SendEmailDto,
  SendEmailResult,
} from '../mailgun/vo';
import { MailService } from '@sendgrid/mail';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { AttachmentData } from '@sendgrid/helpers/classes/attachment';
import { EmailData } from '@sendgrid/helpers/classes/email-address';
import { AtLeastOneKeyPresent } from 'mailgun.js';
import { AbstractMailService } from '../abstract-mail.service';
import { SendgridConfig } from '../../config';

@Injectable()
export class SendgridService extends AbstractMailService<string> {
  constructor(
    @Inject(SENDGRID_CLIENT_TOKEN) private sendgrid: MailService,
    @Inject(SENDGRID_CONFIG_TOKEN) private config: SendgridConfig,
  ) {
    super();
  }

  // eslint-disable-next-line complexity
  override async sendEmail(emailData: EmailDataType) {
    const fromAddress = emailData.from ?? this.config.defaultFromEmail;
    const fromName = emailData.userFullName ?? this.config.defaultFromName;
    const bcc = emailData.bcc ?? this.config.defaultBccList;

    const { attachment, cc, html, subject, to, text, ...rest } = emailData;

    if (html || text) {
      const content = (
        html ? { html } : { text }
      ) as AtLeastOneKeyPresent<MessageContentDto>;

      // todo update attachments
      const attachments = attachment?.map((item): AttachmentData => {
        if (typeof item.data !== 'string') {
          this.logger.warn('Attachments must be string.');
        }

        return {
          content: Buffer.from(item.data as string).toString('base64'),
          filename: item.filename,
        };
      });

      const response = await this.sendgrid.send({
        from: {
          email: fromAddress,
          name: fromName,
        },
        subject,
        bcc: this.transformToSendgridEmailData(bcc ?? []),
        cc: this.transformToSendgridEmailData(cc ?? []),
        to: this.transformToSendgridEmailData(to),
        attachments,
        ...content,
        ...rest,
      });

      return {
        status: response[0].statusCode,
      } as SendEmailResult;
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
    if (emailData.subject) {
      this.logger.error(
        { templateId },
        "Subject won't be set. Use subject in the sendgrid UI for template emails.",
      );
    }

    const fromAddress = emailData.from ?? this.config.defaultFromEmail;
    const bcc = emailData.bcc ?? this.config.defaultBccList;
    const fromName = emailData.userFullName ?? this.config.defaultFromName;

    const { attachment, cc, to, ...rest } = emailData;

    // todo update attachments
    const attachments = attachment?.map((item): AttachmentData => {
      if (typeof item.data !== 'string') {
        this.logger.warn('Attachments must be string.');
      }

      return {
        content: item.data as string,
        filename: item.filename,
      };
    });

    const response = await this.sendgrid.send({
      from: {
        email: fromAddress,
        name: fromName,
      },
      bcc: this.transformToSendgridEmailData(bcc ?? []),
      cc: this.transformToSendgridEmailData(cc ?? []),
      to: this.transformToSendgridEmailData(to),
      attachments,
      templateId,
      dynamicTemplateData: emailTemplateParams,
      ...rest,
    });

    return {
      status: response[0].statusCode,
    } as SendEmailResult;
  }

  private transformToSendgridEmailData(email: string | string[]) {
    return Array.isArray(email)
      ? email.map((email): EmailData => {
          return {
            email,
          };
        })
      : ({
          email: email,
        } as EmailData);
  }
}
