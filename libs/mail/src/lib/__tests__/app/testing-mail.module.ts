import { Module } from '@nestjs/common';
import { MailgunMailModule } from '../../mail.module';
import { MailService } from './mail/custom-mail.service';

@Module({
  imports: [
    MailgunMailModule.forRoot({
      username: 'api',
      key: '',
      domain: 'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org',
      defaultFromEmail: 'noreply@example.com',
      defaultBccList: ['first@gmail.com', 'second@gmail.com'],
    }),
  ],
  providers: [MailService],
})
export class TestingMailModule {}
