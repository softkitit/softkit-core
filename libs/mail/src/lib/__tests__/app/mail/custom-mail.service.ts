import { Injectable } from '@nestjs/common';
import { AbstractMailService } from '../../../services';
import { EmailTypes } from './types/email.types';
import { SendEmailDto, SendEmailResult } from '../../../services/vo';
import { EmailDataParams } from './types/email-params.dto';

@Injectable()
export class MailService {
  constructor(private mailService: AbstractMailService<EmailTypes>) {}

  public sendTemplateEmail(
    templateId: EmailTypes,
    emailData: SendEmailDto,
    templateVariables: EmailDataParams<EmailTypes>,
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
