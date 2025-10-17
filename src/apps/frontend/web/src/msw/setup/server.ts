import { getSamplesMock } from '@/libs/api-client/endpoints/samples/samples.msw';
import { setupServer } from 'msw/node';

export const server = setupServer(...getSamplesMock());
