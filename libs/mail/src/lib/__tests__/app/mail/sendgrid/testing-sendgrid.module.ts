import { Module } from '@nestjs/common';
import { SendgridMailModule } from '../../../../modules';
import { MailService } from '../custom-mail.service';

@Module({
  imports: [
    SendgridMailModule.forRoot({
      apiKey: '',
      defaultFromEmail: 'noreply@example.com',
      defaultBccList: ['first@gmail.com', 'second@gmail.com'],
      dataResidency: 'global',
    }),
  ],
  providers: [MailService],
})
export class TestingSendgridModule {}
