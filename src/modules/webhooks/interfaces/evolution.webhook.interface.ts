export interface EvolutionMessageUpsertPayload {
  event: string;
  instance: string;

  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };

    pushName?: string;

    status?: string;

    message?: {
      conversation?: string;

      messageContextInfo?: {
        messageSecret?: Record<string, number>;
      };
    };

    contextInfo?: {
      mentionedJid?: string[];
      groupMentions?: unknown[];
      ephemeralSettingTimestamp?: {
        low: number;
        high: number;
        unsigned: boolean;
      };
      disappearingMode?: {
        initiator: number;
      };
    };

    messageType?: string;
    messageTimestamp?: number;
    instanceId?: string;
    source?: string;
  };

  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
}
