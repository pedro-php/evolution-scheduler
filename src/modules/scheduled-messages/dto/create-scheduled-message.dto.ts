import { IsDateString, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateScheduledMessageDto {
  @ApiProperty({ example: "my-instance" })
  @IsString()
  @IsNotEmpty()
  instanceId: string;

  @ApiProperty({ example: "5511999999999" })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: "Hello this is a scheduled message" })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: "2026-01-25T14:00:00Z" })
  @IsDateString()
  scheduledFor: string;
}
