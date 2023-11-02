import {
  BaseSignUpByEmailRequest,
  SignUpByEmailResponse,
} from '../../../controllers/auth/vo/sign-up.dto';

export abstract class AbstractSignupService<
  T extends BaseSignUpByEmailRequest,
> {
  public abstract signUp(createUserDto: T): Promise<SignUpByEmailResponse>;
}
