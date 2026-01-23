import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsStrongPassword } from "class-validator";

export class PatchUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password?: string;
}
