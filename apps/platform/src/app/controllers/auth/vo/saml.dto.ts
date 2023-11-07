import { IsUrlLocalized, IsUUIDLocalized } from '@softkit/validation';
import { Expose } from 'class-transformer';

export class InitiateSamlLoginRequest {
  @Expose()
  @IsUrlLocalized()
  redirectUrl!: string;

  @Expose()
  @IsUUIDLocalized()
  samlConfigurationId!: string;
}

export class GenerateMetadataRequest {
  @IsUUIDLocalized()
  samlConfigurationId!: string;

  @IsUUIDLocalized()
  tenantId!: string;
}
