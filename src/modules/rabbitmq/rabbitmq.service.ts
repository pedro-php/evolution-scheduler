import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);

  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  async onModuleInit() {
   const host = process.env.RABBITMQ_HOST || "localhost";
    const port = Number(process.env.RABBITMQ_PORT) || 5672;
    const username = process.env.RABBITMQ_DEFAULT_USER || "rabbit";
    const password = process.env.RABBITMQ_DEFAULT_PASS || "rabbit";

    this.connection = await amqp.connect({
      protocol: "amqp",
      hostname: host,
      port,
      username,
      password,
    });

    this.channel = await this.connection.createChannel();

    this.logger.log(
      `RabbitMQ connected to ${host}:${port}`,
    );
  }

  async assertQueue(queue: string) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });
  }

  async publish<T>(
    queue: string,
    payload: T,
  ) {
    await this.assertQueue(queue);

    const buffer = Buffer.from(JSON.stringify(payload));

    this.channel.sendToQueue(queue, buffer, {
      persistent: true,
      contentType: "application/json",
    });
  }

  async consume<T>(
    queue: string,
    handler: (payload: T) => Promise<void>,
  ) {
    await this.assertQueue(queue);

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as T;
        await handler(payload);
        this.channel.ack(msg);
      } catch (err) {
        this.logger.error(err);
        this.channel.nack(msg, false, false); // dead-letter ready
      }
    });
  }
}
