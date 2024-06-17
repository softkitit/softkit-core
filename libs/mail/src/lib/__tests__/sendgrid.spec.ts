import { AbstractMailService, SendEmailDto } from '../services';
import { EmailTypes } from './app/mail/types/email.types';
import { Test } from '@nestjs/testing';
import { SENDGRID_CLIENT_TOKEN } from '../constants';
import { GeneralInternalServerException } from '@softkit/exceptions';
import { Readable } from 'node:stream';
import { toBase64 } from '../utils/type-convertor';

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
  const stringForConversion: string = 'Test was successful';
  const resultStringAfterConversion: string = 'VGVzdCB3YXMgc3VjY2Vzc2Z1bA==';
  let sendEmailSpy: jest.SpyInstance;

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
    sendEmailSpy = jest.spyOn(mockSendgridClient, 'send');
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

  it('should send template email without template variables and return status 200', async () => {
    const templateId = 'test';
    const payload = {
      from: 'from@gmail.com',
      to: 'example@gmail.com',
      text: 'Test was successful',
    };
    const result = await mailService.sendTemplateEmail(templateId, payload);

    expect(result.status).toBe(202);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        from: payload.from,
        templateId: templateId,
        text: payload.text,
        to: [
          {
            email: payload.to,
          },
        ],
      }),
    );
  });

  it.each([
    { text: 'Test was successful' },
    { html: '<h1>Test was successful</h1>' },
  ])(
    'should send emails with default fields and return status 200',
    async (additionalPayloadData: object) => {
      const attachment = {
        filename: 'test.txt',
        data: 'Test was successful',
      };

      const payload: SendEmailDto = {
        subject: 'TEST',
        from: 'from@gmail.com',
        to: 'example@gmail.com',
        ...additionalPayloadData,
      };

      const result = await mailService.sendEmail({
        ...payload,
        attachment: [attachment],
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...payload,
          to: [
            {
              email: payload.to,
            },
          ],
          attachments: [
            {
              content: 'VGVzdCB3YXMgc3VjY2Vzc2Z1bA==',
              filename: attachment.filename,
            },
          ],
        }),
      );

      expect(result.status).toBe(202);
    },
  );

  it('should fail if neither html nor text fields are provided', async () => {
    const payload = {
      subject: 'TEST',
      to: 'example@gmail.com',
    };

    try {
      await mailService.sendEmail(payload);
      throw new Error(
        'should not be here, seems like sendEmail method did not throw an error',
      );
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(GeneralInternalServerException);
    }
  });

  it('should send template email with variables and string type of attachments and return status 200', async () => {
    const attachment = {
      filename: 'test.pdf',
      data: 'Test was successful',
    };

    const payload = {
      to: 'example@gmail.com',
      from: 'from@gmail.com',
    };

    const result = await mailService.sendTemplateEmail(
      EmailTypes.LOGIN_EMAIL,
      {
        ...payload,
        attachment: [attachment],
      },
      {
        userName: 'joe',
      },
    );

    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...payload,
        to: [
          {
            email: payload.to,
          },
        ],
        attachments: [
          {
            content: 'VGVzdCB3YXMgc3VjY2Vzc2Z1bA==',
            filename: attachment.filename,
          },
        ],
      }),
    );

    expect(result.status).toBe(202);
  });

  it('should convert string to base64', async () => {
    const result = await toBase64(stringForConversion);

    expect(result).toBe(resultStringAfterConversion);
  });

  it('should convert buffer to base64', async () => {
    const result = await toBase64(Buffer.from(stringForConversion));

    expect(result).toBe(resultStringAfterConversion);
  });

  it('should convert Uint8Array to base64', async () => {
    const result = await toBase64(
      new Uint8Array(Buffer.from(stringForConversion)),
    );

    expect(result).toBe(resultStringAfterConversion);
  });

  it('should convert Readable to base64', async () => {
    const result = await toBase64(Readable.from(stringForConversion));

    expect(result).toBe(resultStringAfterConversion);
  });

  it('should fail convert to base64 if wrong type', async () => {
    try {
      // @ts-ignore
      await toBase64(4_324_324);
      throw new Error(
        'should not be here, seems like sendEmail method did not throw an error',
      );
    } catch (error: any) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(TypeError);
    }
  });

  it('should fail convert to base64 when convert readable', async () => {
    const readableStream = new Readable({
      read() {
        this.push('Test was not successful!');
        this.emit('error', new Error('Stream convert to base64 error.'));
        this.push(null);
      },
    });

    try {
      await toBase64(readableStream);
      throw new Error(
        'should not be here, seems like sendEmail method did not throw an error',
      );
    } catch (error: any) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toBeInstanceOf(Error);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error.message).toBe('Stream convert to base64 error.');
    }
  });
});
