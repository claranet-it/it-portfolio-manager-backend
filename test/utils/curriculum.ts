import { CurriculumType, DeleteItemCurriculumType } from '@src/core/Curriculum/model';
import { FastifyInstance } from 'fastify';

export async function addCurriculum(app: FastifyInstance, token: string, payload: CurriculumType) {
  return await app.inject({
    method: 'POST',
    url: '/api/curriculum',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}
/* DELETE rimuovi alcuni elementi*/
export async function deleteWorkItem(app: FastifyInstance, token: string, payload: DeleteItemCurriculumType) {
  return await app.inject({
    method: 'DELETE',
    url: '/api/curriculum/work',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function deleteEducationItem(app: FastifyInstance, token: string, payload: DeleteItemCurriculumType) {
  return await app.inject({
    method: 'DELETE',
    url: '/api/curriculum/education',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

/* PUT modifica alcuni elementi */

export async function getCurriculum(app: FastifyInstance, token: string) {
  return await app.inject({
    method: 'GET',
    url: '/api/curriculum',
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export async function getCurriculumByEmail(app: FastifyInstance, email: string) {
  return await app.inject({
    method: 'GET',
    url: `/api/curriculum/${email}`,
  })
}

