import { Inject, Injectable } from '@nestjs/common';
import { SENDGRID_CLIENT_TOKEN, SENDGRID_CONFIG_TOKEN } from '../../constants';
import {
  AttachmentFile,
  EmailDataType,
  MessageContentDto,
  SendEmailDto,
  SendEmailResult,
} from '../mailgun/vo';
import { GeneralInternalServerException } from '@softkit/exceptions';
import type { MailService } from '@sendgrid/mail';
import type { AttachmentData } from '@sendgrid/helpers/classes/attachment';
import type { EmailData } from '@sendgrid/helpers/classes/email-address';
import type { AtLeastOneKeyPresent } from 'mailgun.js';
import { AbstractMailService } from '../abstract-mail.service';
import { SendgridConfig } from '../../config';
import { toBase64 } from '../../utils/type-convertor';

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

      const attachments: AttachmentData[] =
        await this.transformAttachments(attachment);

      const response = await this.sendgrid.send({
        from: {
          email: fromAddress,
          name: fromName,
        },
        subject,
        bcc: this.transformToSendgridEmailData(bcc),
        cc: this.transformToSendgridEmailData(cc),
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

    const attachments: AttachmentData[] =
      await this.transformAttachments(attachment);

    const response = await this.sendgrid.send({
      from: {
        email: fromAddress,
        name: fromName,
      },
      bcc: this.transformToSendgridEmailData(bcc),
      cc: this.transformToSendgridEmailData(cc),
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

  private transformToSendgridEmailData(
    emails?: string | string[],
  ): EmailData[] {
    if (emails === undefined) {
      return [];
    }

    return (Array.isArray(emails) ? emails : [emails]).map(
      (email): EmailData => {
        return {
          email,
        };
      },
    );
  }

  private async transformAttachments(
    attachment: AttachmentFile[] | undefined,
  ): Promise<AttachmentData[]> {
    if (!attachment) {
      return [];
    }

    const attachments: AttachmentData[] = [];
    for (const item of attachment) {
      const content = await toBase64(item.data);
      attachments.push({
        content,
        filename: item.filename,
      });
    }

    return attachments;
  }
}
