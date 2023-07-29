import { IsBoolean, IsString } from 'class-validator';

export class SamlConfig {
  @IsString()
  issuer!: string;

  @IsBoolean()
  wantAssertionsSigned!: boolean;

  @IsString()
  callbackUrl!: string;
}
