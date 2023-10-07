import { IJwtPayload, UserClsStore } from '@softkit/auth';

export interface UserRequestClsStore<T extends IJwtPayload>
  extends UserClsStore<T> {
  reqId: string;
}
