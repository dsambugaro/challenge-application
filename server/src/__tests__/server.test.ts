import supertest from 'supertest';

import Server from '../server';
import Database from '../utils/database';
import Auth from '../utils/auth';
import { Role } from '../models/userModel';
import { Status } from '../models/assetModel';
import { setupTest, base64Image } from '../utils/test-setup';
import UserService from '../services/userService';
import UserRepository from '../repositories/userRepository';

const createConnectionFalse = jest.spyOn(Database, 'createConnection');
createConnectionFalse.mockImplementation(() => false);

const data = {
  companies: {
    name: 'Teste Company',
    description: 'Company for testing',
    cnpj: '00155513000171',
    active: true,
  },
  units: {
    name: 'Teste Unit',
    company: 1,
  },
  users: {
    name: 'Teste User',
    email: 'user@teste.com.br',
    role: Role.ADMIN,
    username: 'teste-user',
    password: 'teste123',
    company: 1,
  },
  assets: {
    name: 'Teste Asset',
    healthscore: 42,
    status: Status.IN_OPERATION,
    serialnumber: '3phMw9nm',
    image: base64Image,
    description: 'Asset for testing',
    user: 1,
    unit: 1,
    company: 1,
  },
};

describe('test auth', () => {
  const server = new Server();
  const app = server.app;
  setupTest(true);

  it('access protected route without auth should result on error', async () => {
    await supertest(app).get('/api/v1/assets').expect(401);
    await supertest(app)
      .get('/api/v1/assets')
      .set({ 'x-access-token': 'wrong token' })
      .expect(403);
  });

  it('login & acces protected route', async () => {
    const loginMock = jest.spyOn(UserService, 'login');
    loginMock.mockResolvedValueOnce(new UserRepository(data['users']));
    loginMock.mockResolvedValueOnce(null);

    await supertest(app)
      .post('/login')
      .send({
        username: data['users'].username,
        password: data['users'].password,
      })
      .expect(200);

    await supertest(app)
      .get('/api/v1/assets')
      .set({ 'x-access-token': Auth.createToken(1, 'test-user', 'admin', 1) })
      .expect(200)
      .then(response => {
        expect(response.body.content).toHaveLength(0);
      });

    await supertest(app).post('/login').send({}).expect(401);
  });
});

describe('test CRUD endpoints', () => {
  const authMock = jest.spyOn(Auth, 'validate');
  authMock.mockImplementation((req, res, next) => {
    req.currentUser = {
      id: 1,
      role: Role.ADMIN,
      company: undefined,
    };
    next();
  });
  const server = new Server();
  const app = server.app;
  setupTest(true);
  server.routes.forEach(route => {
    it(`/api/v1/${route}... - success`, async () => {
      await supertest(app)
        .get(`/api/v1/${route}`)
        .expect(200)
        .then(response => {
          expect(response.body.content).toHaveLength(0);
        });

      await supertest(app)
        .put(`/api/v1/${route}`)
        .send(data[route])
        .expect(201);

      await supertest(app)
        .get(`/api/v1/${route}`)
        .expect(200)
        .then(response => {
          expect(response.body.content).toHaveLength(1);
          expect(response.body.content[0].name).toBe(data[route].name);
        });

      await supertest(app)
        .post(`/api/v1/${route}/1`)
        .send({ ...data[route], name: 'changed' })
        .expect(200);

      await supertest(app)
        .get(`/api/v1/${route}/1`)
        .expect(200)
        .then(response => {
          expect(response.body.name).toBe('changed');
        });

      await supertest(app).delete(`/api/v1/${route}/1`).expect(200);

      await supertest(app)
        .get(`/api/v1/${route}`)
        .expect(200)
        .then(response => {
          expect(response.body.content).toHaveLength(0);
        });
    });
  });
});
