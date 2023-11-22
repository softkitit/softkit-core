import { Injectable } from '@nestjs/common';
import { MailgunConfig } from '../../../config';

@Injectable()
export class MailgunMockConfig extends MailgunConfig {
  override domain = 'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org';
  override defaultFromEmail = 'noreply@example.com';
  override defaultBccList = ['first@gmail.com', 'second@gmail.com'];
}
