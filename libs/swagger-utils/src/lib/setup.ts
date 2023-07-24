import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import SwaggerConfig from './config/swagger';

/**
 * we can have a multiple swagger setups also, one public and private for example
 * */
export function setupSwagger(c: SwaggerConfig, app: INestApplication) {
  let options = new DocumentBuilder()
    .setTitle(c.title)
    .setDescription(c.description)
    .setVersion(c.version)
    .setContact(c.contactName, c.contactUrl, c.contactEmail)
    .addBearerAuth();

  for (const server of c?.servers || []) {
    options = options.addServer(server.url, server.description);
  }

  const document = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup(c.swaggerPath, app, document);
}
