import { setSeederFactory } from 'typeorm-extension';
import { Tenant } from '../entities';

export const tenantSeederFactory = setSeederFactory(Tenant, () => {
  const tenant = new Tenant();
  tenant.tenantName = 'Softkit';
  tenant.tenantUrl = 'localhost:9999';
  tenant.version = 0;

  return tenant;
});
