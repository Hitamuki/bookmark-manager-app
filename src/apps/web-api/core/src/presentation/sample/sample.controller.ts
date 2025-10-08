import { type CreateSampleDto, CreateSampleDtoSchema } from '@libs/application/sample/dto/create-sample.dto';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { SampleService } from '@libs/application/sample/sample.usecase';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  async create(@Body() reqBody: CreateSampleDto) {
    // DTOのZodバリデーション
    CreateSampleDtoSchema.parse(reqBody);
    await this.sampleService.createSample(reqBody);
  }
}
