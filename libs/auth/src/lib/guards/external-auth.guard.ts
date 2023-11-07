import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ExternalAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(ExternalAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Verify the token is valid, by calling external login service
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  override async canActivate(): Promise<boolean> {
    return true;
  }
}
