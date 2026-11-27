import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

export async function iniciar() {
  for (const nombre of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'CLAVE_REGISTRO']) {
    if (!process.env[nombre] || process.env[nombre]!.startsWith('CAMBIAR_')) {
      throw new Error(`Falta configurar ${nombre}. Ejecuta npm run configurar o revisa tu archivo .env.`);
    }
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: false,
  }));
  const config = new DocumentBuilder()
    .setTitle('API del cine')
    .setDescription('Consulta la cartelera y prueba las operaciones para administrar salas, películas, funciones, clientes y boletos.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Usa el access_token de /auth/login' })
    .build();
  const documento = SwaggerModule.createDocument(app, config);
  // Cada ruta se sirve desde esta aplicación, incluido el cliente de Scalar.
  const http = app.getHttpAdapter().getInstance();
  http.get('/práctica-api.json', (_req, res) => res.json(documento));
  http.get('/docs/scalar.js', (_req, res) => res.sendFile(require.resolve('@scalar/api-reference/browser/standalone.js')));
  http.get('/docs', (_req, res) => res.sendFile(resolve(__dirname, '../public/scalar.html')));
  http.get('/', (_req, res) => res.redirect('/docs'));
  const puerto = Number(process.env.PORT ?? 3000);
  await app.listen(puerto);
  console.log(`La documentación de la API está en ${await app.getUrl()}/docs`);
  return app;
}
if (require.main === module) iniciar().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
