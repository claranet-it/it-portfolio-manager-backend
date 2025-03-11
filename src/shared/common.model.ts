import { Static, Type } from '@sinclair/typebox'

export const IdQueryString = Type.Object({
    id: Type.String(),
})

export type IdQueryStringType = Static<typeof IdQueryString>