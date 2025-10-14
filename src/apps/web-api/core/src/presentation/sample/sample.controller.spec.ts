import { CreateSampleCommand } from '@libs/application/sample/commands/create-sample.command';
import { DeleteSampleCommand } from '@libs/application/sample/commands/delete-sample.command';
import { UpdateSampleCommand } from '@libs/application/sample/commands/update-sample.command';
import type { CreateSampleDto } from '@libs/application/sample/dto/create-sample.dto';
import type { UpdateSampleDto } from '@libs/application/sample/dto/update-sample.dto';
import { GetSampleQuery } from '@libs/application/sample/queries/get-sample.query';
import { GetSamplesQuery } from '@libs/application/sample/queries/get-samples.query';
import type { SampleProps } from '@libs/domain/sample/entities/sample.entity';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SampleController } from './sample.controller';

describe('SampleController', () => {
  let controller: SampleController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(() => {
    commandBus = {
      execute: vi.fn(),
    } as unknown as CommandBus;
    queryBus = {
      execute: vi.fn(),
    } as unknown as QueryBus;

    controller = new SampleController(commandBus, queryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchSamples', () => {
    it('should call GetSamplesQuery with title', async () => {
      // Arrange
      const title = 'test';
      const expectedResult: SampleProps[] = [];
      vi.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.searchSamples(null, null, title);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(new GetSamplesQuery(null, null, title));
      expect(result).toBe(expectedResult);
    });

    it('should call GetSamplesQuery with null', async () => {
      // Arrange
      const title = null;
      const expectedResult: SampleProps[] = [];
      vi.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.searchSamples(null, null, title);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(new GetSamplesQuery(null, null, title));
      expect(result).toBe(expectedResult);
    });
  });

  describe('getSampleById', () => {
    it('should call GetSampleQuery with sampleId', async () => {
      // Arrange
      const sampleId = 'a-valid-uuid';
      const expectedResult: SampleProps | null = null;
      vi.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getSampleById(sampleId);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(new GetSampleQuery(sampleId));
      expect(result).toBe(expectedResult);
    });
  });

  describe('createSample', () => {
    it('should call CreateSampleCommand with request body', async () => {
      // Arrange
      const reqBody: CreateSampleDto = {
        title: 'New Sample',
      };
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      // Act
      await controller.createSample(reqBody);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new CreateSampleCommand(reqBody));
    });
  });

  describe('updateSampleById', () => {
    it('should call UpdateSampleCommand with sampleId and request body', async () => {
      // Arrange
      const sampleId = 'a-valid-uuid';
      const reqBody: UpdateSampleDto = {
        title: 'Updated Sample',
      };
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      // Act
      await controller.updateSampleById(sampleId, reqBody);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateSampleCommand(sampleId, reqBody));
    });
  });

  describe('deleteSampleById', () => {
    it('should call DeleteSampleCommand with sampleId', async () => {
      // Arrange
      const sampleId = 'a-valid-uuid';
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      // Act
      await controller.deleteSampleById(sampleId);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteSampleCommand(sampleId));
    });
  });
});
