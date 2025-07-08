import { TemplateCreateParamsType, TemplateUpdateType } from '@src/core/Template/model';
import { FastifyInstance } from 'fastify';

export async function getMyTemplates(app: FastifyInstance, token: string) {
    return await app.inject({
        method: 'GET',
        url: '/api/template',
        headers: {
            authorization: `Bearer ${token}`,
        }
    })
}

export async function addNewTemplate(app: FastifyInstance, token: string, payload: TemplateCreateParamsType) {
    return await app.inject({
        method: 'POST',
        url: '/api/template',
        headers: {
            authorization: `Bearer ${token}`,
        },
        payload,
    })
}

export async function updateTemplate(app: FastifyInstance, token: string, id: string, payload: TemplateUpdateType) {
    return await app.inject({
        method: 'PATCH',
        url: `/api/template/${id}`,
        headers: {
            authorization: `Bearer ${token}`,
        },
        payload,
    })
}

export async function deleteTemplate(app: FastifyInstance, token: string, id: string) {
    return await app.inject({
        method: 'DELETE',
        url: `/api/template/${id}`,
        headers: {
            authorization: `Bearer ${token}`,
        },
    })
}