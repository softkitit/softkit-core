import {
  Allow,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  BooleanType,
  IntegerType,
  ValidateNestedProperty,
} from '@softkit/validation';
import { NamingStrategyInterface } from 'typeorm/naming-strategy/NamingStrategyInterface';

class DbSSLExtraConfig {
  @IsBoolean()
  @BooleanType
  @IsOptional()
  rejectUnauthorized?: boolean;

  @IsString()
  @IsOptional()
  ca?: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  cert?: string;
}

class DbExtraSettings {
  @IsInt()
  max = 100;

  @ValidateNestedProperty({ required: false, classType: DbSSLExtraConfig })
  ssl?: DbSSLExtraConfig;
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
  ssl: boolean = false;

  @IsBoolean()
  @BooleanType
  logging!: boolean;

  @IsBoolean()
  @BooleanType
  autoLoadEntities = true;

  @ValidateNestedProperty({ required: false, classType: DbExtraSettings })
  extra: DbExtraSettings = new DbExtraSettings();

  @Allow()
  namingStrategy: NamingStrategyInterface = new SnakeNamingStrategy();

  @IsBoolean()
  @BooleanType
  runSeeds: boolean = false;

  @IsBoolean()
  @BooleanType
  verboseRetryLog: boolean = false;

  @IsString()
  @IsOptional()
  migrationsTableName?: string;

  @IsEnum(['all', 'none', 'each'])
  @IsOptional()
  migrationsTransactionMode?: 'all' | 'none' | 'each';

  @IsString()
  @IsOptional()
  metadataTableName?: string;

  @IsEnum(['advanced-console', 'simple-console', 'file', 'debug'])
  @IsOptional()
  logger?: 'advanced-console' | 'simple-console' | 'file' | 'debug';

  @IsOptional()
  @IsNumber()
  maxQueryExecutionTime?: number = 5000;

  @IsOptional()
  @Min(1)
  @IsNumber()
  poolSize?: number = 30;
}
