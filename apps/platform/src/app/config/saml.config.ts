import { Allow, IsBoolean, IsString } from 'class-validator';

export class SamlConfig {
  @IsString()
  issuer!: string;

  @IsBoolean()
  wantAssertionsSigned!: boolean;

  @IsString()
  @Allow()
  frontendUrl?: string;

  @IsString()
  callbackUrl!: string;
}
