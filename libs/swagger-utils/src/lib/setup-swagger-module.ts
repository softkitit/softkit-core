import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { SwaggerConfig } from './config/swagger';
import * as fs from 'node:fs';

/**
 * we can have a multiple swagger setups also, one public and private for example
 * */
export function setupSwagger(c: SwaggerConfig, app: INestApplication) {
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

  if (c.docsOutputPath) {
    fs.writeFileSync(c.docsOutputPath, JSON.stringify(document, undefined, 2));
  }

  SwaggerModule.setup(c.swaggerPath, app, document);

  return document;
}
