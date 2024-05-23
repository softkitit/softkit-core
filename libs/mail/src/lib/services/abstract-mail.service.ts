import { Logger } from '@nestjs/common';
import { SendEmailResult, SendEmailDto } from './mailgun/vo';

export abstract class AbstractMailService<TemplateIdType> {
  protected logger: Logger = new Logger(AbstractMailService.name);

  abstract sendEmail(emailData: SendEmailDto): Promise<SendEmailResult>;

  abstract sendTemplateEmail(
    templateId: TemplateIdType,
    emailData: SendEmailDto,
    templateVariables?: object,
  ): Promise<SendEmailResult>;
}
