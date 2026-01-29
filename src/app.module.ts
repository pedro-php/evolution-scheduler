import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { UsersModule } from './modules/users/users.module';
import { EvolutionApiModule } from './modules/evolution-api/evolution-api.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ScheduledMessagesModule } from './modules/scheduled-messages/scheduled-messages.module';
import { ScheduleModule } from "@nestjs/schedule";
import { OpenaiModule } from './modules/openai/openai.module';
import { RedisModule } from './modules/redis/redis.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import { ConsumersModule } from './modules/consumers/consumers.module';
import { PrometheusModule } from './modules/prometheus/prometheus.module';
import { HttpMetricsInterceptor } from './common/interceptors/prometheus.interceptor';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, JwtModule, UsersModule, EvolutionApiModule, WebhooksModule, ScheduledMessagesModule, OpenaiModule, RedisModule, RabbitMQModule, ConsumersModule, PrometheusModule],
  controllers: [AppController],
  providers: [AppService, HttpMetricsInterceptor],
})
export class AppModule {}
