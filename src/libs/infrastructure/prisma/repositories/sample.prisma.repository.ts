import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import type { SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { PrismaService } from '@libs/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SamplePrismaRepository implements SampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(limit: number | null, offset: number | null, title: string | null): Promise<SampleEntity[]> {
    const records = await this.prisma.sample.findMany({
      take: limit ?? limit,
      skip: offset ?? offset,
      where: {
        isDeleted: false,
        title: title ?? { contains: title },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => new SampleEntity(record));
  }

  async count(title: string | null): Promise<number> {
    return this.prisma.sample.count({
      where: {
        isDeleted: false,
        title: title ? { contains: title } : undefined,
      },
    });
  }

  async findById(id: string): Promise<SampleEntity | null> {
    const record = await this.prisma.sample.findUnique({ where: { id } });
    return record ? new SampleEntity(record) : null;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.sample.count({
      where: { id: id, isDeleted: false },
    });
    return count > 0;
  }

  async create(sampleEntity: SampleEntity): Promise<void> {
    const data = {
      id: sampleEntity.id,
      title: sampleEntity.title,
      isDeleted: sampleEntity.isDeleted,
      createdBy: sampleEntity.createdBy,
      createdAt: sampleEntity.createdAt,
      updatedBy: sampleEntity.updatedBy,
      updatedAt: sampleEntity.updatedAt,
    };
    await this.prisma.sample.create({ data });
  }

  async update(id: string, sampleEntity: SampleEntity): Promise<void> {
    await this.prisma.sample.update({
      where: { id: id },
      data: {
        title: sampleEntity.title,
        updatedAt: new Date(),
        updatedBy: sampleEntity.updatedBy,
      },
    });
  }

  async delete(id: string): Promise<void> {
    // 物理削除
    await this.prisma.sample.delete({ where: { id } });
  }
}
