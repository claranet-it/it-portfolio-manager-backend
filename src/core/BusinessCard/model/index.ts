import { Static, Type } from '@sinclair/typebox'

export const BusinessCard = Type.Object({
  name: Type.String(),
  role: Type.Optional(Type.String()),
  email: Type.String({ format: "email" }),
  mobile: Type.Optional(Type.String()),
})

export const BusinessCardWithUserEmail = Type.Intersect([
  BusinessCard,
  Type.Object({
    userEmail: Type.String(),
  }),
])

export const DeleteBusinessCard = Type.Object({
  email: Type.String({ format: "email" }),
})

export const GetBusinessCard = Type.Object({
  email: Type.String({ format: "email" }),
})

export type BusinessCardType = Static<typeof BusinessCard>
export type BusinessCardWithUserEmailType = Static<typeof BusinessCardWithUserEmail>
export type DeleteBusinessCardType = Static<typeof DeleteBusinessCard>
export type GetBusinessCardType = Static<typeof GetBusinessCard>
