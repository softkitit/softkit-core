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
import { BooleanType, IntegerType } from '@softkit/validation';

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
  applicationName!: string;

  @IsString()
  host = 'localhost';

  @IsInt()
  @Min(0)
  @Max(65_535)
  @IntegerType
  port = 5432;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsString()
  database!: string;

  @IsBoolean()
  @BooleanType
  synchronize = false;

  @IsBoolean()
  @BooleanType
  logNotifications: boolean = true;

  @IsBoolean()
  @BooleanType
  migrationsRun = false;

  @IsBoolean()
  @BooleanType
  dropSchema!: false;

  @IsBoolean()
  @BooleanType
  keepConnectionAlive!: true;

  @IsBoolean()
  @BooleanType
  logging!: boolean;

  @IsBoolean()
  @BooleanType
  autoLoadEntities = true;

  @Type(/* istanbul ignore next */ () => DbExtraSettings)
  @ValidateNested()
  extra: DbExtraSettings = new DbExtraSettings();

  @Allow()
  namingStrategy: SnakeNamingStrategy = new SnakeNamingStrategy();

  @IsBoolean()
  @BooleanType
  runSeeds: boolean = false;
}
