import { ApiProperty } from "@nestjs/swagger";

export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;
}

export class AdminPasswordResponseDto extends AdminResponseDto {
  @ApiProperty()
  password: string;
}