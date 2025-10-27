import { setupWorker } from 'msw/browser';
import { getSamplesMock } from '@/libs/api-client/endpoints/samples/samples.msw';

export const worker = setupWorker(...getSamplesMock());
