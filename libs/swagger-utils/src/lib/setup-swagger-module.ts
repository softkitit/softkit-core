import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { SwaggerConfig } from './config/swagger';

/**
 * we can have a multiple swagger setups also, one public and private for example
 * */
export function setupSwagger(
  c: SwaggerConfig,
  app: INestApplication,
  appPrefix?: string,
) {
  if (!c.enabled) {
    return;
  }

  const options = new DocumentBuilder()
    .setTitle(c.title)
    .setDescription(c.description)
    .setVersion(c.version)
    .setContact(c.contactName, c.contactUrl, c.contactEmail)
    .addBearerAuth();

  for (const server of c?.servers || []) {
    options.addServer(server.url, server.description);
  }

  const document = SwaggerModule.createDocument(app, options.build());

  const swaggerPath = appPrefix
    ? `/${appPrefix}/${c.swaggerPath}`.replaceAll('//', '/')
    : c.swaggerPath;

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  return document;
}
