import { AccessTokenPayload } from './token-payload';
import { UserClsStore } from '@softkit/auth';

export interface ClsStore extends UserClsStore<AccessTokenPayload> {}
