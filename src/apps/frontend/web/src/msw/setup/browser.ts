import { getSamplesMock } from '@/libs/api-client/endpoints/samples/samples.msw';
import { setupWorker } from 'msw/browser';

export const worker = setupWorker(...getSamplesMock());
