import { Type } from '@nestjs/common';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { MixedList } from 'typeorm';
import { TypeOrmConfigService } from '../config/typeorm-config.service';

export interface SetupTypeormOptions {
  optionsFactory?: Type<TypeOrmOptionsFactory>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  migrations?: MixedList<Function>;
}

export const DEFAULT_SETUP_TYPEORM_OPTIONS: SetupTypeormOptions = {
  optionsFactory: TypeOrmConfigService,
  migrations: [],
};
