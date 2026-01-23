import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({ description: "JWT access token" })
  access_token: string;
}