import { ScheduleParserService } from "./schedule-parser.service";
import OpenAI from "openai";
import { ScheduleIntent } from "./interfaces/schedule-intent.interface";

jest.mock("openai");

describe("ScheduleParserService", () => {
  let service: ScheduleParserService;

  const mockCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        }) as any
    );

    service = new ScheduleParserService();
  });

  it("returns ScheduleIntent when OpenAI returns valid schedulable JSON", async () => {
    const intent: ScheduleIntent = {
      intent: "schedule_message",
      message: "Send report",
      scheduledFor: "2026-01-29T10:00:00Z",
    };

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(intent),
          },
        },
      ],
    });

    const result = await service.parseSchedule("Send report tomorrow");

    expect(result).toEqual(intent);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns null when OpenAI returns non-schedulable intent", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ intent: "chitchat" }),
          },
        },
      ],
    });

    const result = await service.parseSchedule("Hello");

    expect(result).toBeNull();
  });

  it("returns null when OpenAI returns invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "{invalid-json",
          },
        },
      ],
    });

    const result = await service.parseSchedule("Schedule something");

    expect(result).toBeNull();
  });

  it("returns null when OpenAI returns empty content", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    const result = await service.parseSchedule("Anything");

    expect(result).toBeNull();
  });
});
