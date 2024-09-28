import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../config/auth';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  PayloadSigned,
} from '../vo/payload';
import { GeneralUnauthorizedException } from '@softkit/exceptions';

@Injectable()
export class TokenService<
  ACCESS_TOKEN_TYPE extends IAccessTokenPayload = IAccessTokenPayload,
  REFRESH_TOKEN_TYPE extends IRefreshTokenPayload = IRefreshTokenPayload,
> {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
  ) {}

  async signTokens({
    accessTokenPayload,
    refreshTokenPayload,
  }: {
    accessTokenPayload: ACCESS_TOKEN_TYPE;
    refreshTokenPayload: REFRESH_TOKEN_TYPE;
  }) {
    this.logger.log(`Generating tokens for user: ${accessTokenPayload.email}}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(accessTokenPayload),
      this.signRefreshToken(refreshTokenPayload),
    ]);

    await this.checkTokenLength(accessToken);
    await this.checkTokenLength(refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  private async signRefreshToken(jwtPayload: REFRESH_TOKEN_TYPE) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.authConfig.refreshTokenSecret,
      expiresIn: this.authConfig.refreshTokenExpirationTime,
    });
  }

  async signAccessToken(jwtPayload: ACCESS_TOKEN_TYPE) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.authConfig.accessTokenSecret,
      expiresIn: this.authConfig.accessTokenExpirationTime,
    });
  }

  async verifyAccessToken(
    token: string,
  ): Promise<IAccessTokenPayload & PayloadSigned> {
    return this.verifyToken(token, this.authConfig.accessTokenSecret);
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<IRefreshTokenPayload & PayloadSigned> {
    return this.verifyToken(token, this.authConfig.refreshTokenSecret);
  }

  private verifyToken(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, {
        secret,
      });
    } catch (error) {
      throw new GeneralUnauthorizedException(undefined, error);
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
