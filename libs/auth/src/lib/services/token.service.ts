import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../config/auth';
import { JwtPayload, JwtRefreshPayload } from '../vo/payload';
import { GeneralUnauthorizedException } from '@saas-buildkit/exceptions';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
  ) {}

  async signTokens(jwtPayload: JwtPayload) {
    this.logger.log(`Generating tokens for user: ${jwtPayload.email}}`);

    const [{ accessToken }, { refreshToken }] = await Promise.all([
      this.signAccessToken(jwtPayload),
      this.signRefreshToken({
        sub: jwtPayload.sub,
        tenantId: jwtPayload.tenantId,
      }),
    ]);

    await this.checkTokenLength(accessToken);
    await this.checkTokenLength(refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signRefreshToken(jwtPayload: JwtRefreshPayload) {
    return {
      refreshToken: await this.jwtService.signAsync(jwtPayload, {
        secret: this.authConfig.refreshTokenSecret,
        expiresIn: this.authConfig.refreshTokenExpirationTime,
      }),
    };
  }

  async signAccessToken(jwtPayload: JwtPayload) {
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.authConfig.accessTokenSecret,
      expiresIn: this.authConfig.accessTokenExpirationTime,
    });

    return {
      accessToken,
    };
  }

  async verifyAccessToken(
    token: string,
  ): Promise<JwtPayload & { iat: number; exp: number }> {
    return this.verifyToken(token, this.authConfig.accessTokenSecret);
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<JwtRefreshPayload & { iat: number; exp: number }> {
    return this.verifyToken(token, this.authConfig.refreshTokenSecret);
  }

  private verifyToken(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, {
        secret,
      });
    } catch (error) {
      this.logger.error(`Error while trying to verify a token`, error);

      throw new GeneralUnauthorizedException(error);
    }
  }

  private async checkTokenLength(token: string) {
    if (Buffer.byteLength(token, 'utf8') > 7168) {
      this.logger.error(
        `Token length is greater than 7kb, length: ${token.length}. This shouldn't happen in production and may become a big issue.`,
      );
    }
  }
}
