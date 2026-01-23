import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateInstanceHeadersDto } from "./create-instance-headers.dto";

export class CreateInstanceWebhookDto {
  @ApiPropertyOptional({ example: "https://api.myapp.com/webhooks/evolution" })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  byEvents?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  base64?: boolean;

  @ApiPropertyOptional({ type: CreateInstanceHeadersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInstanceHeadersDto)
  headers?: CreateInstanceHeadersDto;

  @ApiPropertyOptional({
    example: ["messages.upsert"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];
}
