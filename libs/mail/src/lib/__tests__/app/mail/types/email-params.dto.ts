import { EmailTypes } from './email.types';

export class SignUpTemplateParams {
  title!: string;
}

class WelcomeTemplateParams {
  firstName!: string;
  lastName!: string;
}

class LoginTemplateParams {
  userName!: string;
}

export type EmailDataParams<T extends EmailTypes> =
  T extends EmailTypes.SIGNUP_EMAIL
    ? SignUpTemplateParams
    : T extends EmailTypes.WELCOME
    ? WelcomeTemplateParams
    : T extends EmailTypes.LOGIN_EMAIL
    ? LoginTemplateParams
    : T extends EmailTypes.CHANGE_PASSWORD
    ? never
    : never;
