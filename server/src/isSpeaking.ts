import { FastifyInstance } from 'fastify';
import WebSocket from 'ws';

let currentPayload: any = null;

export async function isSpeaking(fastify: FastifyInstance) {
  const clients = new Set<WebSocket.WebSocket>();

  fastify.get('/isSpeaking', { websocket: true }, (socket, req) => {
    clients.add(socket);

    socket.on('close', () => {
      clients.delete(socket);
    });

    if (currentPayload) {
      socket.send(JSON.stringify(currentPayload));
    }
  });

  fastify.post('/isSpeaking', (req, reply) => {
    currentPayload = req.body;
    for (const client of clients) {
      client.send(JSON.stringify(currentPayload));
    }
    reply.send({ ok: true });
  });
}
