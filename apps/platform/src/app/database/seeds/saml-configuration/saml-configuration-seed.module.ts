import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SAMLConfiguration, Tenant } from '../../entities';
import { SamlConfigurationSeedService } from './saml-configuration-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([SAMLConfiguration, Tenant])],
  providers: [SamlConfigurationSeedService],
  exports: [SamlConfigurationSeedService],
})
export class SamlConfigurationSeedModule {}
