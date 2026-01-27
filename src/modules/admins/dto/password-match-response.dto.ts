import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AdminResponseDto } from "./admin-response.dto";

export class PasswordMatchResponseDto {
    @ApiProperty()
    match: boolean;
    @ApiPropertyOptional()
    user?: AdminResponseDto | null;
}