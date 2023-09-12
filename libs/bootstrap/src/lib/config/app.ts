import { Allow, IsInt, IsString, Max, Min } from 'class-validator';

export class AppConfig {
  @IsInt()
  @Min(0)
  @Max(65_535)
  port!: number;

  @IsString()
  @Allow()
  prefix?: string;
}
