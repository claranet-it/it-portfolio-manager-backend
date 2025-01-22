import { BusinessCardType, DeleteBusinessCardType } from '@src/core/BusinessCard/model';
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

export async function deleteBusinessCard(app: FastifyInstance, token: string, payload: DeleteBusinessCardType) {
  return await app.inject({
    method: 'DELETE',
    url: '/api/business-card',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

