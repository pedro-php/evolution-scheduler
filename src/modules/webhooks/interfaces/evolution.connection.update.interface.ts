export interface EvolutionConnectionUpdatePayload {
  event: "connection.update";
  instance: string;
  data: EvolutionConnectionUpdateData;
  destination: string;
  date_time: string; // ISO 8601
  sender: string; // WhatsApp JID
  server_url: string;
  apikey: string;
}

export interface EvolutionConnectionUpdateData {
  instance: string;
  wuid: string; // WhatsApp user ID (JID)
  profilePictureUrl: string | null;
  state: "open" | "close" | "connecting";
  statusReason: number;
  hostName: string;
}
