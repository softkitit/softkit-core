import { MailgunConfig } from '../../../config';

export class MailgunMockConfig extends MailgunConfig {
  override username = 'api';
  override domain = 'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org';
  override defaultFromEmail = 'noreply@example.com';
  override defaultBccList = ['first@gmail.com', 'second@gmail.com'];
}
