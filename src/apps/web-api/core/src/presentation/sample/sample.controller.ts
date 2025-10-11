import { CreateSampleCommand } from '@libs/application/sample/commands/create-sample.command';
import { UpdateSampleCommand } from '@libs/application/sample/commands/update-sample.command';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CreateSampleDto } from '@libs/application/sample/dto/create-sample.dto';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { UpdateSampleDto } from '@libs/application/sample/dto/update-sample.dto';
import { GetSampleQuery } from '@libs/application/sample/queries/get-sample.query';
import { GetSamplesQuery } from '@libs/application/sample/queries/get-samples.query';
import type { SampleEntity, SampleProps } from '@libs/domain/sample/entities/sample.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery } from '@nestjs/swagger';
import { DeleteSampleCommand } from './../../../../../../libs/application/sample/commands/delete-sample.command';

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
  async searchSamples(@Query('title') title: string | null): Promise<SampleProps[]> {
    return await this.queryBus.execute(new GetSamplesQuery(title));
  }

  /**
   * サンプル1件取得
   * @param sampleId UUID
   * @returns サンプル
   */
  @Get(':id')
  async getSampleById(@Param('id', ParseUUIDPipe) sampleId: string): Promise<SampleProps | null> {
    return await this.queryBus.execute(new GetSampleQuery(sampleId));
  }

  /**
   * サンプル新規登録
   * @param reqBody リクエストボディ
   * @returns なし
   */
  @Post()
  async createSample(@Body() reqBody: CreateSampleDto): Promise<void> {
    return this.commandBus.execute(new CreateSampleCommand(reqBody));
  }

  /**
   * サンプル更新
   * @param reqBody リクエストボディ
   * @returns なし
   */
  @Put(':id')
  async updateSampleById(
    @Param('id', ParseUUIDPipe) sampleId: string,
    @Body() reqBody: UpdateSampleDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateSampleCommand(sampleId, reqBody));
  }

  /**
   *
   * @param sampleId UUID
   * @returns なし
   */
  @Delete(':id')
  async deleteSampleById(@Param('id', ParseUUIDPipe) sampleId: string): Promise<void> {
    return this.commandBus.execute(new DeleteSampleCommand(sampleId));
  }
}
