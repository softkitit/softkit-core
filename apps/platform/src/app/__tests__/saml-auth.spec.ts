import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AuthService,
  SamlConfigurationService,
  SamlService,
  TenantService,
} from '../services';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { SAMLConfiguration, Tenant } from '../database/entities';
import { HttpStatus } from '@nestjs/common';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { successSignupDto } from './generators/signup';
import { SignUpByEmailWithTenantCreationRequest } from '../controllers/auth/vo/sign-up.dto';
import { InitiateSamlLoginRequest } from '../controllers/auth/vo/saml.dto';
import { AuthConfig } from '@softkit/auth';

describe('saml auth e2e test', () => {
  let app: NestFastifyApplication;
  let db: StartedDb;
  let firstUserSignupDto: SignUpByEmailWithTenantCreationRequest;
  let secondUserSignupDto: SignUpByEmailWithTenantCreationRequest;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    const { PlatformAppModule } = require('../platform-app.module');

    firstUserSignupDto = successSignupDto();
    secondUserSignupDto = successSignupDto();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('saml auth', () => {
    let samlConfigurationService: SamlConfigurationService;
    let tenantService: TenantService;
    let samlConfiguration: SAMLConfiguration;
    let tenantWithSamlConfiguration: Tenant;
    let tenantWithoutSamlConfiguration: Tenant;
    let samlService: SamlService;
    let authConfig: AuthConfig;
    const samlResponse =
      // eslint-disable-next-line max-len
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNhbWwycDpSZXNwb25zZSBEZXN0aW5hdGlvbj0iaHR0cDovL2xvY2FsaG9zdDo5OTk5L2FwaS9wbGF0Zm9ybS92MS9hdXRoL3Nzby9zYW1sL2FjIiBJRD0iXzEwODYwNmQyOWY3MTNmZDcyNzQ3YTk4ZTkxM2EyNjcxIiBJblJlc3BvbnNlVG89Il9kNzQ5ODRmZWQ5NjRjYzVlYjRiZiIgSXNzdWVJbnN0YW50PSIyMDIzLTA3LTA3VDAwOjEzOjUwLjgzOFoiIFZlcnNpb249IjIuMCIgeG1sbnM6c2FtbDJwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPjxzYW1sMjpJc3N1ZXIgeG1sbnM6c2FtbDI9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPmh0dHBzOi8vc2FtbHRlc3QuaWQvc2FtbC9pZHA8L3NhbWwyOklzc3Vlcj48ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIj48ZHM6U2lnbmVkSW5mbz48ZHM6Q2Fub25pY2FsaXphdGlvbk1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjxkczpTaWduYXR1cmVNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNyc2Etc2hhMjU2Ii8+PGRzOlJlZmVyZW5jZSBVUkk9IiNfMTA4NjA2ZDI5ZjcxM2ZkNzI3NDdhOThlOTEzYTI2NzEiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjZW52ZWxvcGVkLXNpZ25hdHVyZSIvPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIFByZWZpeExpc3Q9InhzZCIgeG1sbnM6ZWM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3JtPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPklqdFlEYnZJM3B5THY2TW13N2k4SUx5YlNod2Y5ckdwSUl6dUtyWVk5TGM9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlPlUvcXhRajhJV2VaM0ljVlVJRDd2M01ORWxMMExSTk5vNUFQanpQYmVMWXZ4ZERxT05ScDNLZmNtQzlTM1FIWE5mR3Q2dFhsUUV5RzRKV0JEZWZKTHZ5SjhjMkhSTHZZcnlZYnVtWC9UK1ZGRmFiSXBtd2tSTmQxS3JJU0xPT0VFejluM1psei8wWkVKK3hlVDVLYlZjNW5wZ2dVeEd6QnpqaTkwS3AybTc2MEpsdUhaTXJoMUYvbTh3VWJ0NVpqQnBpcVBDenhvVDBJb2JPYVJlNGlHMTU3RmpWcDRNMjBFM2RPOG9BVFRDSUkvZXIyTVdqQ2RMdlVVTjBiTDFMTXo4cnZGZVI5SGE1eCtRSHIvbUtFY1ZaeWs4enZkWmNzWkhxRUNka0RXcXY4RmVhNkN4ZTR0VWFyK29VcVVMMGkyRHNuVGNMckVOMEJRWTA2TDlHVHdJdz09PC9kczpTaWduYXR1cmVWYWx1ZT48ZHM6S2V5SW5mbz48ZHM6WDUwOURhdGE+PGRzOlg1MDlDZXJ0aWZpY2F0ZT5NSUlERWpDQ0FmcWdBd0lCQWdJVkFNRUNRMXRqZ2hhZm01T3hXRGg5aHdaZnh0aFdNQTBHQ1NxR1NJYjNEUUVCQ3dVQU1CWXhGREFTCkJnTlZCQU1NQzNOaGJXeDBaWE4wTG1sa01CNFhEVEU0TURneU5ESXhNVFF3T1ZvWERUTTRNRGd5TkRJeE1UUXdPVm93RmpFVU1CSUcKQTFVRUF3d0xjMkZ0YkhSbGMzUXVhV1F3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQzBaNFFYMU5GSwpzNzF1ZmJRd29Rb1c3cWtOQUpSSUFOR0E0aU0wVGhZZ2h1bDNwQytGd3JHdjM3YVR4V1hmQTFVRzluaktiYkRyZWlEQVpLbmdDZ3lqCnhqMHVKNGxBcmdrcjRBT0VqajV6WEE4MXVHSEFSZlVCY3R2UWNzWnBCSXhET3ZVVUltQWwrM05xTGdNR0YyZmt0eE1HN2tYM0dFVk4KYzFrbGJOM2RmWXNhdzVkVXJ3MjVEaGVMOW5wN0cvKzI4R3dIUHZMYjRhcHRPaU9OYkNhVnZoOVVNSEVBOUY3YzB6ZkYvY0w1Zk9wZApWYTU0d1RJMHUxMkNzRkt0NzhoNmxFR0c1alVzL3FYOWNsWm5jSk03RUZrTjNpbVBQeSswSEM4bnNwWGlIL01aVzhvMmNxV1JrcnczCk16QlpXM09qazVuUWo0MFY2TlViamI3a2ZlanpBZ01CQUFHalZ6QlZNQjBHQTFVZERnUVdCQlFUNlk5SjNUdy9oT0djOFBOVjdKRUUKNGsyWk5UQTBCZ05WSFJFRUxUQXJnZ3R6WVcxc2RHVnpkQzVwWklZY2FIUjBjSE02THk5ellXMXNkR1Z6ZEM1cFpDOXpZVzFzTDJsawpjREFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBU2szZ3VLZlRrVmhFYUlWdnhFUE5SMnczdld0M2Z3bXdKQ2NjVzk4WFhMV2dOYnUzCllhTWIyUlNuN1RoNHAzaCttZnlrMmRvbjZhdTdVeXpjMUpkMzlSTnY4MFRHNWlRb3hmQ2dwaHkxRlltbWRhU2ZPOHd2RHRIVFROaUwKQXJBeE9ZdHpmWWJ6YjVRck5OSC9nUUVOOFJKYUVmL2cvMUdUdzl4LzEwM2RTTUswUlh0bCtmUnMybmJsRDFKSktTUTNBZGh4Sy93ZQpQM2FVUHRMeFZWSjl3TU9RT2ZjeTAybCtoSE1iNnVBanNQT3BPVktxaTNNOFhtY1VaT3B4NHN3dGdHZGVvU3BlUnlydE12UndkY2NpCk5CcDlVWm9tZTQ0cVpBWUgxaXFycG1tanNmSTlwSkl0c2dXdTNrWFBqaFNmajFBSkdSMWw5Skd2SnJIa2kxaUhUQT09PC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PC9kczpTaWduYXR1cmU+PHNhbWwycDpTdGF0dXM+PHNhbWwycDpTdGF0dXNDb2RlIFZhbHVlPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6c3RhdHVzOlN1Y2Nlc3MiLz48L3NhbWwycDpTdGF0dXM+PHNhbWwyOkFzc2VydGlvbiBJRD0iXzE5NTY4Zjg2ZTNkNWY4YjQ4OTViZDVmNmJjMWFkYzRmIiBJc3N1ZUluc3RhbnQ9IjIwMjMtMDctMDdUMDA6MTM6NTAuODM4WiIgVmVyc2lvbj0iMi4wIiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSI+PHNhbWwyOklzc3Vlcj5odHRwczovL3NhbWx0ZXN0LmlkL3NhbWwvaWRwPC9zYW1sMjpJc3N1ZXI+PGRzOlNpZ25hdHVyZSB4bWxuczpkcz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyI+PGRzOlNpZ25lZEluZm8+PGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48ZHM6U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjcnNhLXNoYTI1NiIvPjxkczpSZWZlcmVuY2UgVVJJPSIjXzE5NTY4Zjg2ZTNkNWY4YjQ4OTViZDVmNmJjMWFkYzRmIj48ZHM6VHJhbnNmb3Jtcz48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIj48ZWM6SW5jbHVzaXZlTmFtZXNwYWNlcyBQcmVmaXhMaXN0PSJ4c2QiIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48L2RzOlRyYW5zZm9ybT48L2RzOlRyYW5zZm9ybXM+PGRzOkRpZ2VzdE1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZW5jI3NoYTI1NiIvPjxkczpEaWdlc3RWYWx1ZT5va2lEMnp2Y0M0U3hVaHBQemtqSStQcS93cmlMRmRXQXFWdHozWUpXU29BPTwvZHM6RGlnZXN0VmFsdWU+PC9kczpSZWZlcmVuY2U+PC9kczpTaWduZWRJbmZvPjxkczpTaWduYXR1cmVWYWx1ZT5iRlJLSFllV2FWOHRWT3B0QjZDUGRIdlJ3eVNKZGxXNXdGSFQ4akNQZWt2dFdBVStBTHBKRWtvRHZEL3MzUGQvL0NmWDdxZnBaejI0SWNmMVNPdVZORUNUWDMxQjF6Zy9hYk10dGtaRTI2OHJDY3pCSmQwQ2h1UEFqYUhNMDk0aGx1dlpac3F2UEpRamYxcm51TjRBQUlydXNZY2k1MTVpZ09DZm1uYlRWa2JGNUphT0t5RmZIUWl6VFAwU29OSWVsYytPRVB0WDFjRjNzYjQvT3pWVHgyRDFpc00weDNjclQ0L0NrYkVXNEdESjgvMFAwM2NLQy92N1llSEVvam5LV0hnRnJNWnNqRmQ2bm04NGNmVzcwOXNBUVFHL0l3UFJ6YUlvbGt6emZYK0lSSjVJOTcwWEdmUEs3bXBKendrbTlUbTFmMU1PQzJEYjFyNUR2cTZTdkE9PTwvZHM6U2lnbmF0dXJlVmFsdWU+PGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJREVqQ0NBZnFnQXdJQkFnSVZBTUVDUTF0amdoYWZtNU94V0RoOWh3WmZ4dGhXTUEwR0NTcUdTSWIzRFFFQkN3VUFNQll4RkRBUwpCZ05WQkFNTUMzTmhiV3gwWlhOMExtbGtNQjRYRFRFNE1EZ3lOREl4TVRRd09Wb1hEVE00TURneU5ESXhNVFF3T1Zvd0ZqRVVNQklHCkExVUVBd3dMYzJGdGJIUmxjM1F1YVdRd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUMwWjRRWDFORksKczcxdWZiUXdvUW9XN3FrTkFKUklBTkdBNGlNMFRoWWdodWwzcEMrRndyR3YzN2FUeFdYZkExVUc5bmpLYmJEcmVpREFaS25nQ2d5agp4ajB1SjRsQXJna3I0QU9Famo1elhBODF1R0hBUmZVQmN0dlFjc1pwQkl4RE92VVVJbUFsKzNOcUxnTUdGMmZrdHhNRzdrWDNHRVZOCmMxa2xiTjNkZllzYXc1ZFVydzI1RGhlTDlucDdHLysyOEd3SFB2TGI0YXB0T2lPTmJDYVZ2aDlVTUhFQTlGN2MwemZGL2NMNWZPcGQKVmE1NHdUSTB1MTJDc0ZLdDc4aDZsRUdHNWpVcy9xWDljbFpuY0pNN0VGa04zaW1QUHkrMEhDOG5zcFhpSC9NWlc4bzJjcVdSa3J3MwpNekJaVzNPams1blFqNDBWNk5VYmpiN2tmZWp6QWdNQkFBR2pWekJWTUIwR0ExVWREZ1FXQkJRVDZZOUozVHcvaE9HYzhQTlY3SkVFCjRrMlpOVEEwQmdOVkhSRUVMVEFyZ2d0ellXMXNkR1Z6ZEM1cFpJWWNhSFIwY0hNNkx5OXpZVzFzZEdWemRDNXBaQzl6WVcxc0wybGsKY0RBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQVNrM2d1S2ZUa1ZoRWFJVnZ4RVBOUjJ3M3ZXdDNmd213SkNjY1c5OFhYTFdnTmJ1MwpZYU1iMlJTbjdUaDRwM2grbWZ5azJkb242YXU3VXl6YzFKZDM5Uk52ODBURzVpUW94ZkNncGh5MUZZbW1kYVNmTzh3dkR0SFRUTmlMCkFyQXhPWXR6ZlliemI1UXJOTkgvZ1FFTjhSSmFFZi9nLzFHVHc5eC8xMDNkU01LMFJYdGwrZlJzMm5ibEQxSkpLU1EzQWRoeEsvd2UKUDNhVVB0THhWVko5d01PUU9mY3kwMmwraEhNYjZ1QWpzUE9wT1ZLcWkzTThYbWNVWk9weDRzd3RnR2Rlb1NwZVJ5cnRNdlJ3ZGNjaQpOQnA5VVpvbWU0NHFaQVlIMWlxcnBtbWpzZkk5cEpJdHNnV3Uza1hQamhTZmoxQUpHUjFsOUpHdkpySGtpMWlIVEE9PTwvZHM6WDUwOUNlcnRpZmljYXRlPjwvZHM6WDUwOURhdGE+PC9kczpLZXlJbmZvPjwvZHM6U2lnbmF0dXJlPjxzYW1sMjpTdWJqZWN0PjxzYW1sMjpOYW1lSUQgRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoxLjE6bmFtZWlkLWZvcm1hdDplbWFpbEFkZHJlc3MiIE5hbWVRdWFsaWZpZXI9Imh0dHBzOi8vc2FtbHRlc3QuaWQvc2FtbC9pZHAiIFNQTmFtZVF1YWxpZmllcj0ic2stYm9pbGVycGxhdGUiIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5yc2FuY2hlekBzYW1sdGVzdC5pZDwvc2FtbDI6TmFtZUlEPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uIE1ldGhvZD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmNtOmJlYXJlciI+PHNhbWwyOlN1YmplY3RDb25maXJtYXRpb25EYXRhIEFkZHJlc3M9IjE0My41OC4xNDMuODgiIEluUmVzcG9uc2VUbz0iX2Q3NDk4NGZlZDk2NGNjNWViNGJmIiBOb3RPbk9yQWZ0ZXI9IjIwMjMtMDctMDdUMDA6MTg6NTAuODQyWiIgUmVjaXBpZW50PSJodHRwOi8vbG9jYWxob3N0Ojk5OTkvYXBpL3BsYXRmb3JtL3YxL2F1dGgvc3NvL3NhbWwvYWMiLz48L3NhbWwyOlN1YmplY3RDb25maXJtYXRpb24+PC9zYW1sMjpTdWJqZWN0PjxzYW1sMjpDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAyMy0wNy0wN1QwMDoxMzo1MC44MzhaIiBOb3RPbk9yQWZ0ZXI9IjIwMjMtMDctMDdUMDA6MTg6NTAuODM4WiI+PHNhbWwyOkF1ZGllbmNlUmVzdHJpY3Rpb24+PHNhbWwyOkF1ZGllbmNlPnNrLWJvaWxlcnBsYXRlPC9zYW1sMjpBdWRpZW5jZT48L3NhbWwyOkF1ZGllbmNlUmVzdHJpY3Rpb24+PC9zYW1sMjpDb25kaXRpb25zPjxzYW1sMjpBdXRoblN0YXRlbWVudCBBdXRobkluc3RhbnQ9IjIwMjMtMDctMDdUMDA6MTM6NTAuODMzWiIgU2Vzc2lvbkluZGV4PSJfOTMzMDIwOGYzYzg2NDlkNGQyZDRlYjA2Yzc0YTcyN2MiPjxzYW1sMjpTdWJqZWN0TG9jYWxpdHkgQWRkcmVzcz0iMTQzLjU4LjE0My44OCIvPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBGcmllbmRseU5hbWU9ImVkdVBlcnNvbkVudGl0bGVtZW50IiBOYW1lPSJ1cm46b2lkOjEuMy42LjEuNC4xLjU5MjMuMS4xLjEuNyIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDp1cmkiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZT51cm46bWFjZTpkaXI6ZW50aXRsZW1lbnQ6Y29tbW9uLWxpYi10ZXJtczwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBGcmllbmRseU5hbWU9InVpZCIgTmFtZT0idXJuOm9pZDowLjkuMjM0Mi4xOTIwMDMwMC4xMDAuMS4xIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPnJpY2s8L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6YXR0cmlidXRlOnN1YmplY3QtaWQiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6dXJpIj48c2FtbDI6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzZDpzdHJpbmciPnJzYW5jaGV6QHNhbWx0ZXN0LmlkPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIEZyaWVuZGx5TmFtZT0idGVsZXBob25lTnVtYmVyIiBOYW1lPSJ1cm46b2lkOjIuNS40LjIwIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPisxLTU1NS01NTUtNTUxNTwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBGcmllbmRseU5hbWU9InJvbGUiIE5hbWU9Imh0dHBzOi8vc2FtbHRlc3QuaWQvYXR0cmlidXRlcy9yb2xlIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj5tYW5hZ2VyQFNhbWx0ZXN0LmlkPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIEZyaWVuZGx5TmFtZT0ibWFpbCIgTmFtZT0idXJuOm9pZDowLjkuMjM0Mi4xOTIwMDMwMC4xMDAuMS4zIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPnJzYW5jaGV6QHNhbWx0ZXN0LmlkPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIEZyaWVuZGx5TmFtZT0ic24iIE5hbWU9InVybjpvaWQ6Mi41LjQuNCIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDp1cmkiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZT5TYW5jaGV6PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIEZyaWVuZGx5TmFtZT0iZGlzcGxheU5hbWUiIE5hbWU9InVybjpvaWQ6Mi4xNi44NDAuMS4xMTM3MzAuMy4xLjI0MSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDp1cmkiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZT5SaWNrIFNhbmNoZXo8L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgRnJpZW5kbHlOYW1lPSJnaXZlbk5hbWUiIE5hbWU9InVybjpvaWQ6Mi41LjQuNDIiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6dXJpIj48c2FtbDI6QXR0cmlidXRlVmFsdWU+Umljazwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PC9zYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PC9zYW1sMjpBc3NlcnRpb24+PC9zYW1sMnA6UmVzcG9uc2U+';

    function mockSuccessSamlStrategyCall(userEmail = faker.internet.email()) {
      jest
        .spyOn(samlService, 'login')
        .mockImplementation(async (samlLoginRequest, req, res, replyData) => {
          // @ts-ignore
          const strategy = await samlService.createStrategy(
            samlLoginRequest.samlConfigurationId,
            req,
            res,
            replyData,
          );

          await strategy.success(
            {
              email: userEmail,
              [AuthService.LAST_NAME_SAML_ATTR]: faker.person.lastName(),
              attributes: {
                [AuthService.FIRST_NAME_SAML_ATTR]: faker.person.firstName(),
              },
            },
            null,
          );
        });
    }

    beforeEach(async () => {
      const firstSignUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: firstUserSignupDto,
      });

      if (firstSignUpResponse.statusCode !== 201) {
        throw new Error('Failed to create first user');
      }

      const secondSignUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: secondUserSignupDto,
      });

      if (secondSignUpResponse.statusCode !== 201) {
        throw new Error('Failed to create second user');
      }

      samlConfigurationService = app.get(SamlConfigurationService);
      tenantService = app.get(TenantService);
      samlService = app.get(SamlService);
      authConfig = app.get(AuthConfig);

      tenantWithSamlConfiguration = await tenantService.findOne({
        where: {
          tenantFriendlyIdentifier: firstUserSignupDto.companyIdentifier,
        },
      });
      tenantWithoutSamlConfiguration = await tenantService.findOne({
        where: {
          tenantFriendlyIdentifier: secondUserSignupDto.companyIdentifier,
        },
      });

      samlConfiguration = await samlConfigurationService.createOrUpdateEntity({
        tenantId: tenantWithSamlConfiguration.id,
        enabled: true,
        entryPoint: 'https://samltest.id/idp/profile/SAML2/Redirect/SSO',
        // eslint-disable-next-line max-len
        certificate: `MIIDEjCCAfqgAwIBAgIVAMECQ1tjghafm5OxWDh9hwZfxthWMA0GCSqGSIb3DQEBCwUAMBYxFDASBgNVBAMMC3NhbWx0ZXN0LmlkMB4XDTE4MDgyNDIxMTQwOVoXDTM4MDgyNDIxMTQwOVowFjEUMBIGA1UEAwwLc2FtbHRlc3QuaWQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0Z4QX1NFKs71ufbQwoQoW7qkNAJRIANGA4iM0ThYghul3pC+FwrGv37aTxWXfA1UG9njKbbDreiDAZKngCgyjxj0uJ4lArgkr4AOEjj5zXA81uGHARfUBctvQcsZpBIxDOvUUImAl+3NqLgMGF2fktxMG7kX3GEVNc1klbN3dfYsaw5dUrw25DheL9np7G/+28GwHPvLb4aptOiONbCaVvh9UMHEA9F7c0zfF/cL5fOpdVa54wTI0u12CsFKt78h6lEGG5jUs/qX9clZncJM7EFkN3imPPy+0HC8nspXiH/MZW8o2cqWRkrw3MzBZW3Ojk5nQj40V6NUbjb7kfejzAgMBAAGjVzBVMB0GA1UdDgQWBBQT6Y9J3Tw/hOGc8PNV7JEE4k2ZNTA0BgNVHREELTArggtzYW1sdGVzdC5pZIYcaHR0cHM6Ly9zYW1sdGVzdC5pZC9zYW1sL2lkcDANBgkqhkiG9w0BAQsFAAOCAQEASk3guKfTkVhEaIVvxEPNR2w3vWt3fwmwJCccW98XXLWgNbu3YaMb2RSn7Th4p3h+mfyk2don6au7Uyzc1Jd39RNv80TG5iQoxfCgphy1FYmmdaSfO8wvDtHTTNiLArAxOYtzfYbzb5QrNNH/gQEN8RJaEf/g/1GTw9x/103dSMK0RXtl+fRs2nblD1JJKSQ3AdhxK/weP3aUPtLxVVJ9wMOQOfcy02l+hHMb6uAjsPOpOVKqi3M8XmcUZOpx4swtgGdeoSpeRyrtMvRwdcciNBp9UZome44qZAYH1iqrpmmjsfI9pJItsgWu3kXPjhSfj1AJGR1l9JGvJrHki1iHTA==`,
      } as SAMLConfiguration);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 500 if the token is expired', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        // eslint-disable-next-line max-len
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        } satisfies InitiateSamlLoginRequest,
      });

      expect(samlLoginResponse.statusCode).toBe(302);
      const redirectUrl = samlLoginResponse.headers.location;
      expect(redirectUrl).toContain(samlConfiguration.entryPoint);

      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      const samlCallbackResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/sso/saml/ac',
        headers: {
          host: `http://localhost:30000`,
        },
        payload: {
          SAMLResponse: samlResponse,
          RelayState: relayState,
        },
      });

      // the token is expired so we expect a 500
      expect(samlCallbackResponse.statusCode).toBe(500);
    });

    it('should return 404 on saml auth for not configured tenant', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        // eslint-disable-next-line max-len
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          [authConfig.headerTenantId]: tenantWithoutSamlConfiguration.id,
          host: `http://localhost:30000`,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        } satisfies InitiateSamlLoginRequest,
      });

      expect(samlLoginResponse.statusCode).toBe(404);
    });

    it('get a valid metadata for saml', async () => {
      const samlMetadataResponse = await app.inject({
        method: 'GET',
        url: `api/platform/v1/auth/saml/sso/metadata?samlConfigurationId=${samlConfiguration.id}&tenantId=${tenantWithSamlConfiguration.id}`,
        headers: {
          host: `http://localhost:30000`,
        },
      });

      expect(samlMetadataResponse.statusCode).toBe(200);
      expect(samlMetadataResponse.headers['content-type']).toBe(
        'application/xml',
      );
      expect(samlMetadataResponse.body).toContain('<?xml version="1.0"?>');
    });

    it('should successfully sign in 3 times in a row', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        } satisfies InitiateSamlLoginRequest,
      });

      expect(samlLoginResponse.statusCode).toBe(302);

      const redirectUrl = samlLoginResponse.headers.location;
      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      mockSuccessSamlStrategyCall();

      // multiple logins should behave the same way always
      for (let i = 0; i < 3; i++) {
        const samlCallbackResponse = await app.inject({
          method: 'POST',
          url: 'api/platform/v1/auth/sso/saml/ac',
          headers: {
            host: `http://localhost:30000`,
          },
          payload: {
            SAMLResponse: samlResponse,
            RelayState: relayState,
          },
        });

        expect(samlCallbackResponse.statusCode).toBe(301);

        const callbackRedirectUrl = new URL(
          samlCallbackResponse.headers.location!.toString(),
        );

        expect(
          callbackRedirectUrl.searchParams.get('jwt')?.length,
        ).toBeGreaterThan(1);
        expect(
          callbackRedirectUrl.searchParams.get('refresh')?.length,
        ).toBeGreaterThan(1);
      }
    });

    it('should sign in as owner through saml', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        // eslint-disable-next-line max-len
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        },
      });

      expect(samlLoginResponse.statusCode).toBe(302);

      const redirectUrl = samlLoginResponse.headers.location;
      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      mockSuccessSamlStrategyCall(firstUserSignupDto.email);

      // multiple logins should behave the same way always
      for (let i = 0; i < 2; i++) {
        const samlCallbackResponse = await app.inject({
          method: 'POST',
          url: 'api/platform/v1/auth/sso/saml/ac',
          headers: {
            host: `http://localhost:30000`,
            [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
          },
          payload: {
            SAMLResponse: samlResponse,
            RelayState: relayState,
          },
        });

        expect(samlCallbackResponse.statusCode).toBe(301);

        const callbackRedirectUrl = new URL(
          samlCallbackResponse.headers.location!.toString(),
        );

        expect(
          callbackRedirectUrl.searchParams.get('jwt')?.length,
        ).toBeGreaterThan(1);
        expect(
          callbackRedirectUrl.searchParams.get('refresh')?.length,
        ).toBeGreaterThan(1);
      }
    });

    it('should fail with 403 on saml sign in with no email in a profile provided', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        },
      });

      expect(samlLoginResponse.statusCode).toBe(302);

      const redirectUrl = samlLoginResponse.headers.location;
      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      mockSuccessSamlStrategyCall('');

      const samlCallbackResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/sso/saml/ac',
        headers: {
          host: `http://localhost:30000`,
        },
        payload: {
          SAMLResponse: samlResponse,
          RelayState: relayState,
        },
      });

      expect(samlCallbackResponse.statusCode).toBe(403);
    });

    it('should return 400 if SAML RelayState is invalid', async () => {
      // multiple logins should behave the same way always
      mockSuccessSamlStrategyCall();

      const samlCallbackResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/sso/saml/ac',
        headers: {
          host: `http://localhost:30000`,
        },
        payload: {
          SAMLResponse: samlResponse,
          // it's {} in base64
          RelayState: 'e30=',
        },
      });

      expect(samlCallbackResponse.statusCode).toBe(400);
    });

    it('should fail on rejected callback method test', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        },
      });

      expect(samlLoginResponse.statusCode).toBe(302);

      const redirectUrl = samlLoginResponse.headers.location;
      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      jest
        .spyOn(samlService, 'login')
        .mockImplementation(async (samlLoginRequest, req, res, replyData) => {
          // @ts-ignore
          const strategy = await samlService.createStrategy(
            samlLoginRequest.samlConfigurationId,
            req,
            res,
            replyData,
          );

          await strategy.fail(
            'some verbose challenge',
            HttpStatus.UNAUTHORIZED,
          );
        });

      // multiple logins should behave the same way always
      const samlCallbackResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/sso/saml/ac',
        headers: {
          host: `http://localhost:30000`,
        },
        payload: {
          SAMLResponse: samlResponse,
          RelayState: relayState,
        },
      });

      expect(samlCallbackResponse.statusCode).toBe(401);
    });

    it('should pass saml strategy on callback method', async () => {
      const samlLoginResponse = await app.inject({
        method: 'POST',
        url: `api/platform/v1/auth/sso/saml/login`,
        headers: {
          host: `http://localhost:30000`,
          [authConfig.headerTenantId]: tenantWithSamlConfiguration.id,
        },
        body: {
          redirectUrl: 'https://example.com/successfull-login',
          samlConfigurationId: samlConfiguration.id,
        },
      });

      expect(samlLoginResponse.statusCode).toBe(302);

      const redirectUrl = samlLoginResponse.headers.location;
      const url = new URL(redirectUrl?.toString()!);
      const relayState = url.searchParams.get('RelayState');

      jest
        .spyOn(samlService, 'login')
        .mockImplementation(async (samlLoginRequest, req, res, replyData) => {
          // @ts-ignore
          const strategy = await samlService.createStrategy(
            samlLoginRequest.samlConfigurationId,
            req,
            res,
            replyData,
          );

          await strategy.pass();
        });

      // multiple logins should behave the same way always
      const samlCallbackResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/sso/saml/ac',
        headers: {
          host: `http://localhost:30000`,
        },
        payload: {
          SAMLResponse: samlResponse,
          RelayState: relayState,
        },
      });

      expect(samlCallbackResponse.statusCode).toBe(500);
    });
  });
});
