import { FastifyInstance } from 'fastify';
import { Message, Ollama } from 'ollama';
import WebSocket from 'ws';

const ollama = new Ollama({ host: 'http://0.0.0.0:11434' });

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['role', 'content'],
          },
        },
      },
    },
  },
};

export async function llm(fastify: FastifyInstance) {
  const clients = new Set<WebSocket.WebSocket>();

  fastify.get('/llm', { websocket: true }, (socket, req) => {
    clients.add(socket);

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  fastify.post('/llm', opts, (req, reply) => {
    const messages = (req.body as any).messages as Message[];
    const ID = Math.random().toString(36);

    (async function makeChatCall() {
      broadcast({ id: ID, isStart: true });
      const response = await ollama.chat({
        model: 'llama3.1',
        messages,
        stream: true,
      });

      for await (const part of response) {
        broadcast({ id: ID, part: part.message.content });
      }

      broadcast({ id: ID, isFinal: true });
    })();
  });

  function broadcast(object: any) {
    for (const client of clients) {
      client.send(JSON.stringify(object));
    }
  }
}
