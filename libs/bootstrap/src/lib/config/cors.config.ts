import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BooleanType } from '@softkit/validation';

export class CorsConfig {
  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  origin?: string[];

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  methods?: string[];

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  allowedHeaders?: string[];

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  exposedHeaders?: string[];

  @IsBoolean()
  @BooleanType
  @IsOptional()
  credentials?: boolean;

  @IsOptional()
  @IsNumber()
  maxAge?: number;

  @IsBoolean()
  @BooleanType
  @IsOptional()
  preflightContinue?: boolean;

  @IsOptional()
  @IsNumber()
  optionsSuccessStatus?: number;
}
