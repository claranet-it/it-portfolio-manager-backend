import { Static, Type } from '@sinclair/typebox'

export const CompanyKeys = Type.Object({
  encryptedPrivateKey: Type.String(),
  encryptedAESKey: Type.String(),
  publicKey: Type.String(),
  encryptionCompleted: Type.Boolean(),
})

export type CompanyKeysType = Static<typeof CompanyKeys>

export const CreateCompanyKeys = Type.Object({
  company_id: Type.String(),
  encryptedPrivateKey: Type.String(),
  encryptedAESKey: Type.String(),
  publicKey: Type.String(),
  encryptionCompleted: Type.Optional(Type.Boolean()),
})

export type CreateCompanyKeysType = Static<typeof CreateCompanyKeys>