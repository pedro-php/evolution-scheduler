import { IsOptional, IsString } from "class-validator"

export class CreateInstanceHeadersDto {
    @IsOptional()
    @IsString()
    "autorization": "Bearer TOKEN"
    @IsOptional()
    @IsString()
    "Content-Type": "application/json"
}