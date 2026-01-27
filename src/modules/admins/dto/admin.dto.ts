import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class AdminDto {
  @ApiProperty({ example: "pedro@email.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "strongPassword@123" })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
