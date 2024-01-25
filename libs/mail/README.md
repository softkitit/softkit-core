# Mailgun Mail Module

The Mailgun Mail Module is a comprehensive solution for integrating Mailgun's email functionality into NestJS applications. It provides a seamless way to send emails using Mailgun with minimal setup and configuration.

## Features

- Easy integration with Mailgun's email services in NestJS projects
- Supports sending text, HTML, and template-based emails
- Allows dynamic configuration for Mailgun, including support for asynchronous setup
- Abstracts Mailgun client setup and provides a clean, service-based API for sending emails

## Installation

```bash
yarn add @softkit/mail
```

### For mailgun install mailgun.js

```bash
yarn add mailgun.js@^9.3.0
```

## Usage

### Import MailgunMailModule

```typescript
import { Module } from '@nestjs/common';
import { MailgunMailModule } from '@softkit/mailgun-mail-module';

@Module({
  imports: [
    MailgunMailModule.forRoot({
      username: 'api',
      key: 'YOUR_API_KEY',
      domain: 'YOUR_DOMAIN',
      defaultFromEmail: 'noreply@example.com',
    }),
  ],
})
export class YourAppModule {}
```

### Asynchronous Configuration

If you need to configure the module asynchronously, for example, to inject some config:

```typescript
@Module({
  imports: [
    MailgunMailModule.forRootAsync({
      useFactory: async (config: SomeMailConfig) => {
        return config;
      },
      inject: [SomeMailConfig],
    }),
  ],
})
export class YourAppModule {}
```

### Add default configuration in your root config class

```typescript
import { MailgunConfig } from '@softkit/mail';

export class RootConfig {
  @Type(() => MailgunConfig)
  @ValidateNested()
  public readonly mailgun!: MailgunConfig;
}
```

### .env.yaml file

```yaml
mailgun:
  domain: 'YOUR_DOMAIN'
  key: 'YOUR_API_KEY'
  username: 'api'
  defaultFromEmail: 'noreply@example.com'
  defaultBccList:
    - 'first@gmail.com'
    - 'second@gmail.com'
```


## Using native mailgun client (available in DI) in case if you need some customizations

```typescript
   @Inject(MAILGUN_CLIENT_TOKEN) private mailgun: IMailgunClient
```

## Enhancing Your Application with a Custom Typed Email Service
Enhance your NestJS application with a type-safe and versatile email service.
### Quick Setup Guide

#### Step 1: Define Email Types

Start by creating an enumeration of the different types of emails your application will handle.
```typescript 
// email.types.ts
export enum EmailTypes {
  SIGNUP_EMAIL = 'SIGNUP_TEMPLATE',
  WELCOME = 'WELCOME_TEMPLATE',
}
```
#### Step 2: Specify Email Parameters
For each email type, define specific parameters to ensure that every email contains the right information.
```typescript
// email-params.dto.ts
export class SignUpEmailParams {
  username: string;
  // Additional signup-specific parameters
}

export class WelcomeEmailParams {
  firstName: string;
  // Additional welcome-specific parameters
}

export type EmailDataParams<T extends EmailTypes> = 
  T extends EmailTypes.SIGNUP_EMAIL ? SignUpEmailParams :
  T extends EmailTypes.WELCOME ? WelcomeEmailParams :
  never;
```
#### Step 3: Create the Mail Service
Implement a mail service that uses these types, providing methods for sending various email types.
```typescript
import { Injectable } from '@nestjs/common';
import { AbstractMailService } from './abstract-mail.service';
import { EmailTypes } from './types/email.types';
import { SendEmailDto, SendEmailResult } from './vo';
import { EmailDataParams } from './types/email-params.dto';

@Injectable()
export class MailService {
  constructor(private mailService: AbstractMailService<EmailTypes>) {}

  public sendTemplateEmail<T extends EmailTypes>(
    templateId: T,
    emailData: SendEmailDto,
    templateVariables: EmailDataParams<T>,
  ): Promise<SendEmailResult> {
    return this.mailService.sendTemplateEmail(
      templateId,
      emailData,
      templateVariables,
    );
  }

  public sendEmail(emailData: SendEmailDto): Promise<SendEmailResult> {
    return this.mailService.sendEmail(emailData);
  }
}
```
