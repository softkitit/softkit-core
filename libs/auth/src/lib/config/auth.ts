import { IsOptional, IsString } from 'class-validator';

export class AuthConfig {
  @IsString()
  accessTokenSecret!: string;

  @IsString()
  accessTokenExpirationTime!: string;

  @IsString()
  refreshTokenSecret!: string;

  @IsString()
  refreshTokenExpirationTime!: string;

  @IsString()
  authHeaderName = 'authorization';

  @IsString()
  @IsOptional()
  headerTenantId = 'x-tenant-id';
}
