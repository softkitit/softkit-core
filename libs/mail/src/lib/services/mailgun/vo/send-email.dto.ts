import { ArrayMaxSize, IsOptional } from 'class-validator';
import { MessageContentDto } from './message-content.dto';
import { Readable } from 'node:stream';
import {
  IsArrayLocalized,
  IsEmailLocalized,
  IsStringLocalized,
  MaxLengthLocalized,
  ValidateNestedProperty,
} from '@softkit/validation';
import type { AtLeastOneKeyPresent } from 'mailgun.js';

export class AttachmentFile {
  @IsStringLocalized()
  filename!: string;

  data!: string | Buffer | Readable | Uint8Array;
}

export class SendEmailDto {
  @IsStringLocalized()
  @IsEmailLocalized()
  @IsOptional()
  from?: string;

  @IsStringLocalized()
  @IsOptional()
  userFullName?: string;

  @IsArrayLocalized()
  @IsStringLocalized({ each: true })
  @MaxLengthLocalized(320, { each: true })
  @ArrayMaxSize(100)
  @IsEmailLocalized({
    emailValidationOptions: { each: true },
    maxLengthValidationOptions: {
      each: true,
    },
  })
  @IsOptional()
  cc?: string[];

  @IsArrayLocalized()
  @IsStringLocalized({ each: true })
  @MaxLengthLocalized(320, { each: true })
  @ArrayMaxSize(100)
  @IsEmailLocalized({
    emailValidationOptions: { each: true },
    maxLengthValidationOptions: {
      each: true,
    },
  })
  @IsOptional()
  bcc?: string[];

  @IsStringLocalized({ each: true })
  @MaxLengthLocalized(320, { each: true })
  @IsEmailLocalized({
    emailValidationOptions: { each: true },
    maxLengthValidationOptions: {
      each: true,
    },
  })
  to!: string | string[];

  @IsStringLocalized()
  @IsOptional()
  subject?: string;

  /**
   * **Important:** You must use `multipart/form-data` encoding when sending attachments.
   */
  @IsArrayLocalized()
  @ValidateNestedProperty({
    classType: AttachmentFile,
    required: false,
    validationOptions: { each: true },
  })
  attachment?: AttachmentFile[];

  /**
   * This type definition allows the passing of various Mailgun-specific parameters
   * The Mailgun API expects dynamic parameters with specific prefixes, such as:
   * - 'o:' for options (e.g., 'o:testmode' to enable test mode)
   * - 'v:' for custom JSON data (e.g., 'v:my-var' for custom variables)
   * - 'h:' for custom headers (e.g., 'h:X-My-Header' for custom MIME headers)
   */
  [key: string]: unknown;
}

export interface SendEmailResult {
  id?: string;
  message?: string;
  status: number;
  details?: string;
}

export type EmailDataType = SendEmailDto &
  AtLeastOneKeyPresent<MessageContentDto>;
