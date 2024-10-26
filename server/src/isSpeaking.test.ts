import fastify, { FastifyInstance } from 'fastify';
import fastifyWebsockets from '@fastify/websocket';
import resolvable from '@josephg/resolvable';
import { isSpeaking } from './isSpeaking';

let server: FastifyInstance;

beforeEach(async () => {
  server = fastify();
  await server.register(fastifyWebsockets);
  await server.register(isSpeaking);
  await server.ready();
});

afterEach(() => {
  server.close();
});

test('isSpeaking websocket', async () => {
  const ws = await server.injectWS('/isSpeaking');
  let promise = resolvable();

  ws.on('message', (data) => {
    promise.resolve(JSON.parse(data.toString()));
  });

  server.inject({
    method: 'POST',
    url: '/isSpeaking',
    body: {
      status: 'speaking',
    },
  });

  expect(await promise).toEqual({ status: 'speaking' });

  promise = resolvable();

  server.inject({
    method: 'POST',
    url: '/isSpeaking',
    body: {
      status: 'shut',
    },
  });

  expect(await promise).toEqual({ status: 'shut' });

  ws.terminate();
});
