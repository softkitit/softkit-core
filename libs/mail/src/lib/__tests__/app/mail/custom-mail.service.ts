import { Injectable } from '@nestjs/common';
import { AbstractMailService } from '../../../services';
import { SendEmailDto, SendEmailResult } from '../../../services/mailgun/vo';
import { EmailDataParams } from './types/email-params.dto';
import { EmailTypes } from './types/email.types';

@Injectable()
export class MailService {
  constructor(private mailService: AbstractMailService<EmailTypes>) {}

  public sendTemplateEmail<T extends EmailTypes>(
    templateId: T,
    emailData: SendEmailDto,
    templateVariables: EmailDataParams<T>,
  ): Promise<SendEmailResult> {
    return this.mailService.sendTemplateEmail(
      templateId,
      emailData,
      templateVariables,
    );
  }

  public sendEmail(emailData: SendEmailDto): Promise<SendEmailResult> {
    return this.mailService.sendEmail(emailData);
  }
}
