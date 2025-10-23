export default {
  'api-client': {
    input: {
      target: './../../docs/openapi/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './../libs/api-client/endpoints',
      schemas: './../libs/api-client/model',
      client: 'react-query', // TanStack Query
      httpClient: 'axios',
      mock: true,
      biome: true,
      clean: true,
    },
  },
};
