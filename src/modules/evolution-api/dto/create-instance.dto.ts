import { IsBoolean, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateInstanceWebhookDto } from "./create-instance-webhook.dto";

export class CreateInstanceDto {
  @ApiPropertyOptional({ example: "my-instance" })
  @IsOptional()
  @IsString()
  instanceName?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  qrcode?: boolean;

  @ApiPropertyOptional({ example: "Baileys" })
  @IsOptional()
  @IsString()
  integration?: string;

  @ApiPropertyOptional({ type: CreateInstanceWebhookDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInstanceWebhookDto)
  webhook?: CreateInstanceWebhookDto;
}
