import { ApiProperty } from '@nestjs/swagger';

export class SampleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string | null;
}
