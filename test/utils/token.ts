import { FastifyInstance } from 'fastify';

export function getToken(app: FastifyInstance, email?: string): string {
  return app.createTestJwt({
    email: email || 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'ADMIN',
  })
}