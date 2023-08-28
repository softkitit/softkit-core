import { UserClsStore } from '@saas-buildkit/auth';

export interface UserRequestClsStore extends UserClsStore {
  reqId: string;
}
