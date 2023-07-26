import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SAMLConfiguration, Tenant } from '../../entities';

@Injectable()
export class SamlConfigurationSeedService {
  constructor(
    @InjectRepository(SAMLConfiguration)
    private repository: Repository<SAMLConfiguration>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}
  private readonly logger = new Logger(SamlConfigurationSeedService.name);

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      const tenants = await this.tenantRepository.find({
        take: 2,
      });

      if (tenants.length === 1) {
        const tenant = tenants[0];

        const samlConfig = await this.repository.save(
          this.repository.create({
            tenantId: tenant.id,
            enabled: true,
            entryPoint: 'https://samltest.id/idp/profile/SAML2/Redirect/SSO',
            certificate: `MIIDEjCCAfqgAwIBAgIVAMECQ1tjghafm5OxWDh9hwZfxthWMA0GCSqGSIb3DQEBCwUAMBYxFDASBgNVBAMMC3NhbWx0ZXN0LmlkMB4XDTE4MDgyNDIxMTQwOVoXDTM4MDgyNDIxMTQwOVowFjEUMBIGA1UEAwwLc2FtbHRlc3QuaWQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0Z4QX1NFKs71ufbQwoQoW7qkNAJRIANGA4iM0ThYghul3pC+FwrGv37aTxWXfA1UG9njKbbDreiDAZKngCgyjxj0uJ4lArgkr4AOEjj5zXA81uGHARfUBctvQcsZpBIxDOvUUImAl+3NqLgMGF2fktxMG7kX3GEVNc1klbN3dfYsaw5dUrw25DheL9np7G/+28GwHPvLb4aptOiONbCaVvh9UMHEA9F7c0zfF/cL5fOpdVa54wTI0u12CsFKt78h6lEGG5jUs/qX9clZncJM7EFkN3imPPy+0HC8nspXiH/MZW8o2cqWRkrw3MzBZW3Ojk5nQj40V6NUbjb7kfejzAgMBAAGjVzBVMB0GA1UdDgQWBBQT6Y9J3Tw/hOGc8PNV7JEE4k2ZNTA0BgNVHREELTArggtzYW1sdGVzdC5pZIYcaHR0cHM6Ly9zYW1sdGVzdC5pZC9zYW1sL2lkcDANBgkqhkiG9w0BAQsFAAOCAQEASk3guKfTkVhEaIVvxEPNR2w3vWt3fwmwJCccW98XXLWgNbu3YaMb2RSn7Th4p3h+mfyk2don6au7Uyzc1Jd39RNv80TG5iQoxfCgphy1FYmmdaSfO8wvDtHTTNiLArAxOYtzfYbzb5QrNNH/gQEN8RJaEf/g/1GTw9x/103dSMK0RXtl+fRs2nblD1JJKSQ3AdhxK/weP3aUPtLxVVJ9wMOQOfcy02l+hHMb6uAjsPOpOVKqi3M8XmcUZOpx4swtgGdeoSpeRyrtMvRwdcciNBp9UZome44qZAYH1iqrpmmjsfI9pJItsgWu3kXPjhSfj1AJGR1l9JGvJrHki1iHTA==`,
          }),
        );

        this.logger.log(
          `SAML configuration created for tenant ${tenant.tenantName} with id ${samlConfig.id}`,
        );
      } else {
        this.logger.warn(
          `SAML configuration not created. Expected 1 tenant, found ${tenants.length} tenants`,
        );
      }
    }
  }
}
