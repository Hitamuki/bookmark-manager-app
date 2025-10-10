import { CreateSampleCommand } from '@libs/application/sample/commands/create-sample.command';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CreateSampleDto } from '@libs/application/sample/dto/create-sample.dto';
import { GetSamplesQuery } from '@libs/application/sample/queries/get-samples.query';
import type { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
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

  /**
   * サンプル検索
   * @param title タイトル
   * @returns サンプル一覧
   */
  @Get()
  @ApiQuery({ name: 'title', required: false })
  async search(@Query('title') title: string | null): Promise<SampleEntity[]> {
    return await this.queryBus.execute(new GetSamplesQuery(title));
  }

  /**
   * サンプル新規登録
   * @param reqBody リクエストボディ
   * @returns なし
   */
  @Post()
  async create(@Body() reqBody: CreateSampleDto): Promise<void> {
    return this.commandBus.execute(new CreateSampleCommand(reqBody));
  }
}
