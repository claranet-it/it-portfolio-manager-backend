import { FastifyInstance } from "fastify";

export async function unsubscribe(app: FastifyInstance, token: string, id: string) {
    return await app.inject({
        method: 'DELETE',
        url: `/api/unsubscribe/${id}`,
        headers: {
            authorization: `Bearer ${token}`,
        }
    })
}