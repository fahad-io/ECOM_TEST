/**
 * Zero-install development database.
 *
 * Starts an ephemeral in-memory MongoDB bound to a fixed port (default 27017)
 * and keeps it running until you Ctrl-C. Lets you run the API + seed script
 * with no MongoDB installed:
 *
 *   Terminal 1:  npm run db:mem
 *   Terminal 2:  npm run seed && npm run start:dev
 *
 * Data lives only for the lifetime of this process. For persistence across
 * restarts, point MONGO_URI at a real MongoDB (local install or Atlas) instead.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  const port = Number(process.env.DEV_DB_PORT ?? 27017);
  const dbName = process.env.DEV_DB_NAME ?? 'marl';

  const server = await MongoMemoryServer.create({
    instance: { port, dbName },
  });

  const uri = server.getUri();
  // eslint-disable-next-line no-console
  console.log('In-memory MongoDB ready.');
  // eslint-disable-next-line no-console
  console.log(`  URI: ${uri}`);
  // eslint-disable-next-line no-console
  console.log(`  Set MONGO_URI=mongodb://127.0.0.1:${port}/${dbName}`);
  // eslint-disable-next-line no-console
  console.log('Press Ctrl-C to stop.');

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void main();
