import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from '../../services';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}
}
