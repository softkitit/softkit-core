import { AbstractMailService, SendEmailDto } from '../services';
import { EmailTypes } from './app/mail/types/email.types';
import { Test } from '@nestjs/testing';
import { SENDGRID_CLIENT_TOKEN } from '../constants';

const mockSendgridClient = {
  send: jest.fn().mockImplementation(async () => {
    return [
      {
        statusCode: 202,
      },
    ];
  }),
};

describe('mail e2e test', () => {
  let mailService: AbstractMailService<string>;

  beforeAll(async () => {
    const {
      TestingSendgridModule,
    } = require('./app/mail/sendgrid/testing-sendgrid.module');

    const module = await Test.createTestingModule({
      imports: [TestingSendgridModule],
    })
      .overrideProvider(SENDGRID_CLIENT_TOKEN)
      .useValue(mockSendgridClient)
      .compile();

    mailService = module.get<AbstractMailService<string>>(AbstractMailService);
  }, 120_000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send template email with template variables and return status 200', async () => {
    const result = await mailService.sendTemplateEmail(
      EmailTypes.LOGIN_EMAIL,
      {
        subject: 'test 123',
        to: 'example@gmail.com',
      },
      {
        userName: 'joe',
      },
    );

    expect(result.status).toBe(202);
  });

  it.each([
    { text: 'Test was successful' },
    { html: '<h1>Test was successful</h1>' },
  ])(
    'should send emails with default fields and return status 200',
    async (additionalPayloadData: object) => {
      const attachment = {
        filename: 'test.txt',
        data: 'test attachment',
      };

      const payload: SendEmailDto = {
        subject: 'TEST',
        to: 'example@gmail.com',
        ...additionalPayloadData,
        attachment: [attachment],
      };

      const result = await mailService.sendEmail(payload);

      expect(result.status).toBe(202);
    },
  );
});
