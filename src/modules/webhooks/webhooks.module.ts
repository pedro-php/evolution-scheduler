import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { OpenaiModule } from '../openai/openai.module';
import { InstancesModule } from '../instances/instances.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService],
  imports: [OpenaiModule, InstancesModule, UsersModule]
})
export class WebhooksModule {}
