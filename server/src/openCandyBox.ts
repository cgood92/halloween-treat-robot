import { FastifyInstance } from 'fastify';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const USB = '/dev/cu.usbmodem2101'; // May need to change on a different computer setup

const port = new SerialPort({ path: USB, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data: any) => {
  console.info('from arduino:', data);
});

export async function openCandyBox(fastify: FastifyInstance) {
  fastify.post('/open', (req, reply) => {
    port.write('RUN\n', (err: any) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.info('sent RUN to arduino');
    });

    reply.send({ message: 'sent' });
  });
}
