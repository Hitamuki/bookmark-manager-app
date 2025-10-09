import { CreateSampleCommand } from '@libs/application/sample/commands/create-sample.command';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CreateSampleDto } from '@libs/application/sample/dto/create-sample.dto';
import { GetSamplesQuery } from '@libs/application/sample/queries/get-samples.query';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery } from '@nestjs/swagger';

@Controller('samples')
export class SampleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiQuery({ name: 'title', required: false })
  async search(@Query('title') title: string | null) {
    return await this.queryBus.execute(new GetSamplesQuery(title));
  }

  @Post()
  async create(@Body() reqBody: CreateSampleDto) {
    return this.commandBus.execute(new CreateSampleCommand(reqBody));
  }
}
