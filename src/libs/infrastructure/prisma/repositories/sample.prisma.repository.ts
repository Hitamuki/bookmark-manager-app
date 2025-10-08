import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import type { SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { PrismaService } from '@libs/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SamplePrismaRepository implements SampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(title: string | null): Promise<SampleEntity[]> {
    const records = await this.prisma.sample.findMany({
      where: {
        isDeleted: false,
        title: title ? { contains: title } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => new SampleEntity(record));
  }

  async findById(id: string): Promise<SampleEntity | null> {
    const record = await this.prisma.sample.findUnique({ where: { id } });
    return record ? new SampleEntity(record) : null;
  }

  async create(sampleEntity: SampleEntity): Promise<void> {
    const data = {
      id: sampleEntity.id.toString(),
      title: sampleEntity.title,
      isDeleted: sampleEntity.isDeleted,
      createdBy: sampleEntity.createdBy,
      createdAt: sampleEntity.createdAt,
      updatedBy: sampleEntity.updatedBy,
      updatedAt: sampleEntity.updatedAt,
    };
    await this.prisma.sample.create({ data });
  }

  async update(sampleEntity: SampleEntity): Promise<void> {
    const { id, ...data } = sampleEntity;
    const dbData = await this.prisma.sample.findUnique({
      where: { id: sampleEntity.id.toString() },
    });
    if (!dbData) {
      // TODO: 例外をスロー
    }
    await this.prisma.sample.update({
      where: { id: sampleEntity.id.toString() },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    const data = await this.prisma.sample.findUnique({
      where: { id: id.toString() },
    });
    if (!data) {
      // TODO: 例外をスロー
    }
    await this.prisma.sample.delete({ where: { id } });
  }
}
