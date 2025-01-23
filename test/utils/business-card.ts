import { BusinessCardType } from '@src/core/BusinessCard/model';
import { FastifyInstance } from 'fastify';

export async function addBusinessCard(app: FastifyInstance, token: string, payload: BusinessCardType) {
  return await app.inject({
    method: 'POST',
    url: '/api/business-card',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function deleteOwnBusinessCard(app: FastifyInstance, token: string) {
  return await app.inject({
    method: 'DELETE',
    url: '/api/business-card',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
}

export async function getOwnBusinessCard(app: FastifyInstance, token: string) {
  return await app.inject({
    method: 'GET',
    url: '/api/business-card',
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

