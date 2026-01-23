import { ApiProperty } from "@nestjs/swagger";

export class ScheduledMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  instance: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  scheduledFor: Date;

  @ApiProperty({ nullable: true })
  sentAt?: Date | null;

  @ApiProperty({
    enum: ["PENDING", "SENT", "FAILED"],
  })
  status: string;

  @ApiProperty({ nullable: true })
  externalId?: string | null;

  @ApiProperty({ nullable: true })
  error?: string | null;

  @ApiProperty()
  createdAt: Date;
}
