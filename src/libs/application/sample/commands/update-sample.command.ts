import type { UpdateSampleDto } from '../dto/update-sample.dto';

export class UpdateSampleCommand {
  constructor(
    public readonly sampleId: string,
    public readonly reqBody: UpdateSampleDto,
  ) {}
}
