import { IsEmailLocalized, IsStringLocalized } from '@softkit/validation';
import { IsOptional } from 'class-validator';
import { GeneralConfig } from '../general.config';

export class SendgridConfig extends GeneralConfig {
  @IsStringLocalized()
  apiKey!: string;

  @IsStringLocalized()
  @IsEmailLocalized()
  defaultFromEmail!: string;

  @IsStringLocalized()
  @IsOptional()
  defaultFromName?: string;
}
