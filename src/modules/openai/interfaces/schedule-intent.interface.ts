export interface ScheduleIntent {
  intent: "schedule_message";
  message: string;
  scheduledFor: string; // ISO 8601
}
