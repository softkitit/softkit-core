import { UserClsStore } from '@softkit/auth';

export interface UserRequestClsStore extends UserClsStore {
  reqId: string;
}
