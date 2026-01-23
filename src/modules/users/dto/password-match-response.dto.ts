import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserResponseDto } from "./user-response.dto";

export class PasswordMatchResponseDto {
    @ApiProperty()
    match: boolean;
    @ApiPropertyOptional()
    user?: UserResponseDto | null;
}