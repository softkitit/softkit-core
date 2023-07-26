import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from '../vo/constants';

export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
