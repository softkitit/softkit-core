import {
  IsArrayLocalized,
  IsEmailLocalized,
  IsStringLocalized,
} from '@softkit/validation';
import { ArrayMaxSize, IsOptional } from 'class-validator';

export class GeneralConfig {
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
}
