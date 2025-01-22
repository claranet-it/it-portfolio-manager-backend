import { Static, Type } from '@sinclair/typebox'

export const BusinessCard = Type.Object({
  name: Type.String(),
  role: Type.Optional(Type.String()),
  email: Type.String(),
  mobile: Type.Optional(Type.String()),
})

export const BusinessCardWithUserEmail = Type.Intersect([
  BusinessCard,
  Type.Object({
    userEmail: Type.String(),
  }),
])

export type BusinessCardType = Static<typeof BusinessCard>
export type BusinessCardWithUserEmailType = Static<typeof BusinessCardWithUserEmail>