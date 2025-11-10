import { Controller, Get } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { PrismaService } from '@/libs/infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () => this.prisma.pingCheck('database', this.prismaService),
      () => this.mongoose.pingCheck('mongodb', { timeout: 1500 }),
    ]);
  }
}
