import { Body, Controller, Post } from '@nestjs/common';
import {
  type CreateSampleDto,
  CreateSampleDtoSchema,
} from '../../../../../../libs/application/sample/dto/create-sample.dto';
import type { SampleService } from '../../../../../../libs/application/sample/sample.usecase';

@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  async create(@Body() reqBody: CreateSampleDto) {
    // DTOのZodバリデーション
    const valid = CreateSampleDtoSchema.parse(reqBody);
    await this.sampleService.createSample(valid);
  }
}
