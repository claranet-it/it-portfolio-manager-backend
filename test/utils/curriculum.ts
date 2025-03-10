import { CurriculumType, CurriculumUpdateType, EducationUpdateType, WorkUpdateType } from '@src/core/Curriculum/model';
import { FastifyInstance } from 'fastify';

export async function createCurriculum(app: FastifyInstance, token: string, payload: CurriculumType) {
  return await app.inject({
    method: 'POST',
    url: '/api/curriculum',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function deleteWorkItem(app: FastifyInstance, token: string, id: string) {
  return await app.inject({
    method: 'DELETE',
    url: `/api/curriculum/work/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export async function deleteEducationItem(app: FastifyInstance, token: string, id: string) {
  return await app.inject({
    method: 'DELETE',
    url: `/api/curriculum/education/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

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

export async function updateCurriculum(app: FastifyInstance, token: string, payload: CurriculumUpdateType) {
  return await app.inject({
    method: 'PATCH',
    url: '/api/curriculum/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function updateEducation(app: FastifyInstance, token: string, id: string, payload: EducationUpdateType) {
  return await app.inject({
    method: 'PATCH',
    url: `/api/curriculum/education/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function updateWork(app: FastifyInstance, token: string, id: string, payload: WorkUpdateType) {
  return await app.inject({
    method: 'PATCH',
    url: `/api/curriculum/work/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}
