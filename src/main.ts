import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpMetricsInterceptor } from './common/interceptors/prometheus.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Agenda API")
    .setDescription("Authentication and reminders API")
    .setVersion("1.0")
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },'jwt')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  app.enableShutdownHooks();
  app.useGlobalInterceptors(app.get(HttpMetricsInterceptor));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
