import { Static, Type } from '@sinclair/typebox'

export const CompanyKeys = Type.Object({
  encryptedPrivateKey: Type.String(),
  encryptedAESKey: Type.String(),
  publicKey: Type.String(),
})

export type CompanyKeysType = Static<typeof CompanyKeys>