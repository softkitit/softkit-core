import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Allow,
  IsBoolean,
} from 'class-validator';
import { BooleanTypeTransform } from '@saas-buildkit/validation';

export class SwaggerConfig {
  @IsString()
  title!: string;

  @BooleanTypeTransform
  @IsBoolean()
  enabled = false;

  @IsString()
  swaggerPath!: string;

  @IsString()
  @IsOptional()
  docsOutputPath!: string;

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

export class Server {
  @IsString()
  url!: string;

  @IsString()
  description!: string;
}
