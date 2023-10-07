import { Injectable } from '@nestjs/common';
import { AuthConfig } from '../../../lib/config/auth';

@Injectable()
export class AuthConfigMock extends AuthConfig {
  override accessTokenSecret =
    'dsNVS7Fdsjb2ZSVI6F3tL8b9T1f9gsUg7XGwWoXC+ZoJ9QZytDZOmr7cZ5FQcNYYT67J6i4K5iKmtyDVZvg1Drb1AEP7enUBf//kMgdy+zMieoYalr12TJmIPjxZgGjom7qUJQRNOTAxz4hyJGdKCbghwxNSEp8GL2arGvPanUbujJd2ExG+ZRkuk89GL9X2WNBTqNV5ItDLtBz8NJhTb48tz+fClJNiGbQzK301gnIeNhIXxFMO6yFWycJB8LFzzWBx4J3kl0pHYfjLbfY4/7amWMLWowj23xKoQSBOkoqFHSDHxPotxK5BVyrLqFsA9FrDROyGcmD2Y2ctryWY8A==';
  override accessTokenExpirationTime = '15m';
  override refreshTokenSecret =
    'asNVS7Fdsjb2ZSVI6F3tL8b9T1f9gsUg7XGwWoXC+ZoJ9QZytDZOmr7cZ5FQcNYYT67J6i4K5iKmtyDVZvg1Drb1AEP7enUBf//kMgdy+zMieoYalr12TJmIPjxZgGjom7qUJQRNOTAxz4hyJGdKCbghwxNSEp8GL2arGvPanUbujJd2ExG+ZRkuk89GL9X2WNBTqNV5ItDLtBz8NJhTb48tz+fClJNiGbQzK301gnIeNhIXxFMO6yFWycJB8LFzzWBx4J3kl0pHYfjLbfY4/7amWMLWowj23xKoQSBOkoqFHSDHxPotxK5BVyrLqFsA9FrDROyGcmD2Y2ctryWY8A==';
  override refreshTokenExpirationTime = '30d';
}
