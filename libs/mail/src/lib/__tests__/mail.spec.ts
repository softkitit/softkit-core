import { Test } from '@nestjs/testing';
import { AbstractMailService, AttachmentFile, SendEmailDto } from '../services';
import { MAILGUN_CLIENT_TOKEN } from '../constants';
import { MailgunConfig } from '../config';
import { MailgunMockConfig } from './app/config/config.mock';
import { MailService } from './app/mail/custom-mail.service';
import { EmailTypes } from './app/mail/types/email.types';
import { GeneralBadRequestException } from '@softkit/exceptions';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

const mockMailgunClient = {
  messages: {
    create: jest.fn().mockImplementation(async () => {
      return {
        status: 200,
        id: 'test_id',
      };
    }),
  },
};

describe('mail e2e test', () => {
  let mailService: AbstractMailService<string>;
  let typedMailService: MailService;
  let sendEmailSpy: jest.SpyInstance;

  beforeAll(async () => {
    const { TestingMailModule } = require('./app/testing-mail.module');

    const module = await Test.createTestingModule({
      imports: [TestingMailModule],
    })
      .overrideProvider(MAILGUN_CLIENT_TOKEN)
      .useValue(mockMailgunClient)
      .overrideProvider(MailgunConfig)
      .useClass(MailgunMockConfig)
      .compile();

    mailService = module.get<AbstractMailService<string>>(AbstractMailService);
    typedMailService = module.get<MailService>(MailService);
    sendEmailSpy = jest.spyOn(mockMailgunClient.messages, 'create');
  }, 120_000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send emails with default fields and return status 200', async () => {
    const attachment = {
      filename: 'test.txt',
      data: 'test attachment',
    };

    const payload: SendEmailDto = {
      subject: 'TEST',
      to: 'example@gmail.com',
      text: 'Test was successful',
      attachment: [attachment],
      'o:testmode': 'yes',
    };

    const result = await mailService.sendEmail(payload);

    const transformedDto = plainToClass(SendEmailDto, payload);

    const errors = await validate(transformedDto);

    expect(errors.length).toBe(0);
    expect(transformedDto?.attachment?.[0]).toBeInstanceOf(AttachmentFile);
    expect(transformedDto?.attachment?.[0].filename).toBe('test.txt');
    expect(sendEmailSpy).toHaveBeenCalledWith(
      'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org',
      expect.objectContaining({
        from: 'noreply@example.com',
        ...payload,
      }),
    );

    expect(result.status).toBe(200);
    expect(result.id).toBeDefined();

    const templatePayload = {
      subject: 'TEST',
      to: ['example@gmail.com'],
      text: 'Test was successful',
      bcc: ['example@gmail.com', 'noexample@gmail.com'],
      'o:testmode': 'yes',
    };
    const sendTemplateEmailResult = await mailService.sendTemplateEmail(
      'test',
      templatePayload,
      {
        title: 'test title',
      },
    );

    expect(sendEmailSpy).toHaveBeenCalledWith(
      'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org',
      expect.objectContaining({
        from: 'noreply@example.com',
        ...templatePayload,
      }),
    );
    expect(sendTemplateEmailResult.status).toBe(200);
    expect(sendTemplateEmailResult.id).toBeDefined();
  });

  it('should send email using typed client', async () => {
    const result = await typedMailService.sendTemplateEmail(
      EmailTypes.SIGNUP_EMAIL,
      {
        from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
        subject: 'TEST',
        to: ['allromsok@gmail.com'],
        text: 'Test was successful',
        'o:testmode': 'yes',
      },
      {
        title: 'test title',
      },
    );

    expect(result.status).toBe(200);
    expect(result.id).toBeDefined();
  });

  it('should send template email without template variables and return status 200', async () => {
    const payload = {
      from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
      subject: 'TEST',
      to: 'example@gmail.com',
      text: 'Test was successful',
      'o:testmode': 'yes',
    };
    const result = await mailService.sendTemplateEmail('test', payload);

    expect(sendEmailSpy).toHaveBeenCalledWith(
      'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org',
      expect.objectContaining(payload),
    );
    expect(result.status).toBe(200);
    expect(result.id).toBeDefined();
  });

  it('should fail if neither html nor text fields are provided', async () => {
    const payload = {
      from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
      subject: 'TEST',
      to: 'example@gmail.com',
      'o:testmode': 'yes',
    };

    await expect(
      mailService.sendTemplateEmail('test', payload),
    ).rejects.toThrow(GeneralBadRequestException);
    expect(sendEmailSpy).not.toHaveBeenCalled();
  });

  it('should fail if both html and template fields are provided', async () => {
    const payload = {
      from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
      subject: 'TEST',
      to: 'example@gmail.com',
      'o:testmode': 'yes',
      html: '<p>Test HTML content</p>',
    };

    await expect(
      mailService.sendTemplateEmail('test', payload),
    ).rejects.toThrow(GeneralBadRequestException);

    expect(sendEmailSpy).not.toHaveBeenCalled();
  });

  it('should send template email with template params and return status 200', async () => {
    const payload = {
      from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
      subject: 'TEST',
      to: ['example@gmail.com'],
      text: 'Test was successful',
      'o:testmode': 'yes',
    };
    const firstEmailResult = await mailService.sendTemplateEmail(
      'test',
      payload,
      {
        title: 'test title',
      },
    );

    expect(sendEmailSpy).toHaveBeenCalledWith(
      'sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org',
      expect.objectContaining(payload),
    );
    expect(firstEmailResult.status).toBe(200);
    expect(firstEmailResult.id).toBeDefined();

    const secondEmailResult = await mailService.sendTemplateEmail(
      'test',
      {
        from: 'Excited User <mailgun@sandboxea47440175b84daf8586d18c5d5e1f0a.mailgun.org>',
        subject: 'TEST',
        to: ['example@gmail.com'],
        text: 'Test was successful',
        'o:testmode': 'yes',
      },
      {
        title: {
          value: 'key',
        },
      },
    );

    expect(secondEmailResult.status).toBe(200);
    expect(secondEmailResult.id).toBeDefined();
  });
});
