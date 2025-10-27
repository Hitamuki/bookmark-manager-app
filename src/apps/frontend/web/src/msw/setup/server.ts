import { setupServer } from 'msw/node';
import { getSamplesMock } from '@/libs/api-client/endpoints/samples/samples.msw';

export const server = setupServer(...getSamplesMock());
