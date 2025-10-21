import { CreateSampleCommand } from '@/libs/application/sample/commands/create-sample.command';
import { UpdateSampleCommand } from '@/libs/application/sample/commands/update-sample.command';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CreateSampleDto } from '@/libs/application/sample/dto/create-sample.dto';
import { ApiOkResponsePagination, type PaginationDto } from '@/libs/application/sample/dto/pagination.dto';
import { SampleDto } from '@/libs/application/sample/dto/sample.dto';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { UpdateSampleDto } from '@/libs/application/sample/dto/update-sample.dto';
import { GetSampleQuery } from '@/libs/application/sample/queries/get-sample.query';
import { GetSamplesQuery } from '@/libs/application/sample/queries/get-samples.query';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeleteSampleCommand } from './../../../../../../libs/application/sample/commands/delete-sample.command';

@ApiTags('samples')
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
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiOkResponsePagination(SampleDto)
  async searchSamples(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number | null,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number | null,
    @Query('title') title: string | null,
  ): Promise<PaginationDto<SampleDto>> {
    return await this.queryBus.execute(new GetSamplesQuery(limit, offset, title));
  }

  /**
   * サンプル1件取得
   * @param sampleId UUID
   * @returns サンプル
   */
  @Get(':id')
  @ApiOkResponse({ type: SampleDto })
  async getSampleById(@Param('id', ParseUUIDPipe) sampleId: string): Promise<SampleDto> {
    return await this.queryBus.execute(new GetSampleQuery(sampleId));
  }

  /**
   * サンプル新規登録
   * @param reqBody リクエストボディ
   * @returns なし
   */
  @Post()
  @ApiCreatedResponse()
  async createSample(@Body() reqBody: CreateSampleDto): Promise<void> {
    return this.commandBus.execute(new CreateSampleCommand(reqBody));
  }

  /**
   * サンプル更新
   * @param reqBody リクエストボディ
   * @returns なし
   */
  @Put(':id')
  @ApiOkResponse()
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
