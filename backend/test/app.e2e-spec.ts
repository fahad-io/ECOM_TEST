import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end smoke test of the security-critical surface: auth, the global
 * deny-by-default guard, and role authorization. Runs against an ephemeral
 * in-memory MongoDB (its own random port — independent of `npm run db:mem`).
 */
describe('MARL API (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let http: () => request.SuperTest<request.Test>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    // Override ConfigService so the app binds to THIS in-memory Mongo and a
    // test secret, regardless of what backend/.env contains. (Setting
    // process.env alone is not enough — ConfigModule resolves MONGO_URI from
    // the .env file, which would point the test at the real local database.)
    const testConfig: Record<string, string> = {
      MONGO_URI: uri,
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '7d',
      CLIENT_URL: 'http://localhost:3000',
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => testConfig[key] })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    http = () => request(app.getHttpServer());
  }, 60_000);

  afterAll(async () => {
    // Drop the ephemeral DB so reruns are deterministic, then tear everything down.
    if (app) {
      const conn = app.get<Connection>(getConnectionToken());
      await conn.dropDatabase().catch(() => undefined);
      await app.close();
    }
    await mongo?.stop();
  });

  it('rejects an unauthenticated /auth/me with 401', async () => {
    await http().get('/api/auth/me').expect(401);
  });

  it('serves the public product catalog without auth', async () => {
    const res = await http().get('/api/products').expect(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
  });

  it('signs up, returns a token, and resolves /auth/me', async () => {
    const signup = await http()
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@e2e.dev', password: 'secret123' })
      .expect(201);
    expect(signup.body.accessToken).toBeDefined();
    expect(signup.body.user).not.toHaveProperty('passwordHash');

    const token = signup.body.accessToken as string;
    const me = await http()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.email).toBe('test@e2e.dev');
    expect(me.body.role).toBe('user');
  });

  it('rejects signup with invalid input (400)', async () => {
    await http()
      .post('/api/auth/signup')
      .send({ name: 'x', email: 'nope', password: 'short' })
      .expect(400);
  });

  it('blocks a normal user from an admin route (403)', async () => {
    const signup = await http()
      .post('/api/auth/signup')
      .send({ name: 'Plain User', email: 'plain@e2e.dev', password: 'secret123' })
      .expect(201);
    const token = signup.body.accessToken as string;

    await http()
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
