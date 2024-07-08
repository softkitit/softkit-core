import {
  IsEmailLocalized,
  IsNumberLocalized,
  IsStringLocalized,
} from '@softkit/validation';
import { IsFQDN, IsOptional } from 'class-validator';
import { GeneralConfig } from '../general.config';

export class MailgunConfig extends GeneralConfig {
  @IsStringLocalized()
  @IsFQDN()
  domain!: string;

  @IsStringLocalized()
  @IsEmailLocalized()
  defaultFromEmail!: string;

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
