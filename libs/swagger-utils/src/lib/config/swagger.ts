import { Allow, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export default class SwaggerConfig {
  @IsString()
  title!: string;

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

export class Server {
  @IsString()
  url!: string;

  @IsString()
  description!: string;
}
