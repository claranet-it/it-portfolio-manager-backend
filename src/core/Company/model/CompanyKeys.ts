import { Static, Type } from '@sinclair/typebox'

export const EncryptionStatus = Type.Union([
  Type.Literal('notEncrypted'),
  Type.Literal('pending'),
  Type.Literal('completed'),
  Type.Literal('failed'),
])

export const CompanyKeys = Type.Object({
  encryptedPrivateKey: Type.String(),
  encryptedAESKey: Type.String(),
  publicKey: Type.String(),
  encryptionStatus: Type.Optional(EncryptionStatus),
})

export type CompanyKeysType = Static<typeof CompanyKeys>

export const CreateCompanyKeys = Type.Object({
  company_id: Type.String(),
  encryptedPrivateKey: Type.String(),
  encryptedAESKey: Type.String(),
  publicKey: Type.String(),
})

export type CreateCompanyKeysType = Static<typeof CreateCompanyKeys>