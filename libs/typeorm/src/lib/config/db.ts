import { Type } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

class DbExtraSettings {
  @IsInt()
  max = 100;

  @IsBoolean()
  ssl = false;
}

export class DbConfig {
  @IsString()
  type!: string;

  @IsString()
  host = 'localhost';

  @IsInt()
  @Min(0)
  @Max(65_535)
  port = 5432;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsString()
  database!: string;

  @IsBoolean()
  synchronize = false;

  @IsBoolean()
  migrationsRun = false;

  @IsBoolean()
  dropSchema!: false;

  @IsBoolean()
  keepConnectionAlive!: true;

  @IsBoolean()
  logging!: boolean;

  @IsBoolean()
  autoLoadEntities = true;

  @Type(/* istanbul ignore next */ () => DbExtraSettings)
  @ValidateNested()
  extra: DbExtraSettings = new DbExtraSettings();

  @Allow()
  namingStrategy: SnakeNamingStrategy = new SnakeNamingStrategy();
}
