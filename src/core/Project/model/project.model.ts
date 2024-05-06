import { Static, Type } from '@sinclair/typebox'

export const ProjectRow = Type.Object({
    uid: Type.String(),
    name: Type.String(),
    category: Type.String(),
    company: Type.String()
})

export type ProjectRowType = Static<typeof ProjectRow>