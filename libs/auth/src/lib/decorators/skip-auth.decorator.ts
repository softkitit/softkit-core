import { SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from "@saas-buildkit/auth";

export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
