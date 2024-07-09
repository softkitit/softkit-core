import {
  IsString,
  IsBoolean,
  IsEmail,
  IsUrl,
  Allow,
  IsOptional,
} from 'class-validator';
import { BooleanType } from '@softkit/validation';
import { Server } from 'node:http';

export class SwaggerConfig {
  @IsString()
  title!: string;

  @BooleanType
  @IsBoolean()
  enabled = false;

  @IsString()
  swaggerPath!: string;

  @IsString()
  description!: string;

  @IsString()
  version!: string;

  @IsString()
  contactName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsUrl()
  contactUrl!: string;

  @Allow()
  @IsOptional()
  servers?: Server[];
}
