import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserDto {
  @ApiProperty({ example: "user" })
  @IsNotEmpty()
  @IsString()
  name?: string;
  @ApiProperty({ example: "5535999999999" })
  @IsNotEmpty()
  @IsString()
  phone: string
}
