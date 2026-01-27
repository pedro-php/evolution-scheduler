import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "5535999999999" })
    phone?: string
    @IsOptional()
    @IsString()
    @ApiProperty({ example: "John Doe", required: false })
    name? : string 
}