/**
 * samples.testテストファイル
 * テストケースを定義
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';

describe('SampleController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /samples', () => {
    it('サンプルが登録できる', async () => {
      // Arrange
      const createSampleDto = {
        title: 'Test Sample',
      };

      // Act
      const response = await request(app.getHttpServer()).post('/samples').send(createSampleDto);

      // Assert
      expect(response.status).toBe(201);
    });
  });
});
