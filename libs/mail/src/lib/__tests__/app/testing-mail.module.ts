import { Module } from '@nestjs/common';
import { MailgunMailModule } from '../../mail.module';
import { MailgunMockConfig } from './config/config.mock';
import { MailgunConfig } from '../../config';
import { MailService } from './mail/custom-mail.service';

@Module({
  imports: [
    MailgunMailModule.forRoot({
      username: 'api',
      key: '',
      domain: 'domain',
      defaultFromEmail: 'default',
    }),
  ],
  providers: [
    MailService,
    {
      useClass: MailgunMockConfig,
      provide: MailgunConfig,
    },
  ],
})
export class TestingMailModule {}
