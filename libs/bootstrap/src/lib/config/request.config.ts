import { IsNotEmpty, IsString } from 'class-validator';

export class RequestConfig {
  @IsString()
  @IsNotEmpty()
  cookieSecret!: string;
}
