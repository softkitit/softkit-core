import { AppConfig } from '@softkit/bootstrap';
import { Allow, IsString } from 'class-validator';

export class PlatformAppConfig extends AppConfig {
  @IsString()
  @Allow()
  frontendUrl?: string;
}
