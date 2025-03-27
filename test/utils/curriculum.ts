import { CurriculumType, CurriculumUpdateType } from '@src/core/Curriculum/model';
import { EducationCreateType, EducationUpdateType } from '@src/core/Education/model';
import { WorkCreateType, WorkUpdateType } from '@src/core/Work/model';
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
    url: `/api/education/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function updateWork(app: FastifyInstance, token: string, id: string, payload: WorkUpdateType) {
  return await app.inject({
    method: 'PATCH',
    url: `/api/work/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function deleteWorkItem(app: FastifyInstance, token: string, id: string) {
  return await app.inject({
    method: 'DELETE',
    url: `/api/work/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export async function deleteEducationItem(app: FastifyInstance, token: string, id: string) {
  return await app.inject({
    method: 'DELETE',
    url: `/api/education/${id}`,
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export async function addEducation(app: FastifyInstance, token: string, payload: EducationCreateType) {
  return await app.inject({
    method: 'POST',
    url: '/api/education',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}

export async function addWork(app: FastifyInstance, token: string, payload: WorkCreateType) {
  return await app.inject({
    method: 'POST',
    url: '/api/work',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload,
  })
}