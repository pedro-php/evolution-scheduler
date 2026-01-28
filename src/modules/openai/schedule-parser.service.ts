import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { ScheduleIntent } from "./interfaces/schedule-intent";

@Injectable()
export class ScheduleParserService {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async parseSchedule(text: string): Promise<ScheduleIntent | null> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
                You extract scheduling intents from messages.

                Return ONLY valid JSON.
                If the user wants to schedule a message, return:
                {
                "intent": "schedule_message",
                "message": string,
                "scheduledFor": ISO_8601_datetime
                }

                If not schedulable, return null.
                Never explain anything.
                Never type !schedule in your response.
          `.trim(),
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ScheduleIntent;
      if (parsed?.intent !== "schedule_message") return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
