import { readFileSync } from 'node:fs';
import path from 'node:path';
import fastify from 'fastify';
import fastifyWebsockets from '@fastify/websocket';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';

import { isSpeaking } from './isSpeaking';
import { llm } from './llm';
import { openCandyBox } from './openCandyBox';

const server = fastify({
  https: {
    key: readFileSync(process.env.HTTPS_KEY_PATH!),
    cert: readFileSync(process.env.HTTPS_CERT_PATH!),
  },
});
server.register(fastifyWebsockets);
server.register(isSpeaking);
server.register(llm);
server.register(openCandyBox);

server.register(cors, {
  origin: true, // Open to all hosts, which is ok for local development
});

// Serving client assets
const staticAssetsDirectory = path.join(__dirname, '../../client/build');
server.register(fastifyStatic, {
  root: staticAssetsDirectory,
});
// Enable single page application routing
server.setNotFoundHandler(function (request, reply) {
  reply.sendFile('index.html');
});

export default server;
