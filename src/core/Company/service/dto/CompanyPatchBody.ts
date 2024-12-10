import { Static, Type } from '@sinclair/typebox'

export const CompanyPatchBody = Type.Object({
  image_url: Type.String(),
})

export type CompanyPatchBodyType = Static<typeof CompanyPatchBody>
