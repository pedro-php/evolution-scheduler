import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EvolutionMessageDto } from "./evolution-message.dto";

export class SendTextDto extends EvolutionMessageDto {
  @ApiProperty({ example: "Hello from Evolution API 👋" })
  @IsNotEmpty()
  @IsString()
  text: string;
}
