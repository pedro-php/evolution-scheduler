export interface EvolutionInstance {
  id: string;
  name: string;

  connectionStatus: string;

  /** WhatsApp JID that owns this instance */
  ownerJid: string;

  profileName: string | null;
  profilePicUrl: string | null;

  integration: string;

  /** Sometimes null depending on integration */
  number: string | null;
  businessId: string | null;

  token: string;
  clientName: string;

  disconnectionReasonCode: number | null;
  disconnectionObject: string | null;
  disconnectionAt: string | null;

  createdAt: string;
  updatedAt: string;

  Chatwoot: unknown | null;
  Proxy: unknown | null;
  Rabbitmq: unknown | null;
  Nats: unknown | null;
  Sqs: unknown | null;
  Websocket: unknown | null;

  Setting: Record<string, unknown>;

  _count: Record<string, number>;
}
