import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EvolutionMessageDto {
  @ApiProperty({ example: "my-instance" })
  @IsNotEmpty()
  @IsString()
  instance: string;

  @ApiProperty({ example: "5511999999999" })
  @IsNotEmpty()
  @IsString()
  number: string;
}
