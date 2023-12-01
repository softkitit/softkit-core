import {
  IsArrayLocalized,
  IsEmailLocalized,
  IsNumberLocalized,
  IsStringLocalized,
} from '@softkit/validation';
import { ArrayMaxSize, IsFQDN, IsOptional } from 'class-validator';

export class MailgunConfig {
  @IsStringLocalized()
  @IsFQDN()
  domain!: string;

  @IsStringLocalized()
  @IsEmailLocalized()
  defaultFromEmail!: string;

  @IsArrayLocalized()
  @IsStringLocalized({ each: true })
  @ArrayMaxSize(100)
  @IsEmailLocalized({
    emailValidationOptions: { each: true },
    maxLengthValidationOptions: {
      each: true,
    },
  })
  @IsOptional()
  defaultBccList?: string[];

  @IsStringLocalized()
  username!: string;

  @IsStringLocalized()
  key!: string;

  @IsStringLocalized()
  @IsOptional()
  url?: string;

  @IsStringLocalized()
  @IsOptional()
  verificationPublicKey?: string;

  @IsNumberLocalized()
  @IsOptional()
  timeout?: number;
}
