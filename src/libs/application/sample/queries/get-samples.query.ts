export class GetSamplesQuery {
  constructor(
    public readonly limit: number | null,
    public readonly offset: number | null,
    public readonly title: string | null,
  ) {}
}
