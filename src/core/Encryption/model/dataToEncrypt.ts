import { Static, Type } from '@sinclair/typebox'

export const GetDataToEncrypt = Type.Object({
  tasks: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
  ),
  customers: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
  ),
  projects: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
  ),
  timeEntries: Type.Array(
    Type.Object({
      id: Type.String(),
      description: Type.String(),
    }),
  ),
  efforts: Type.Array(
    Type.Object({
      id: Type.String(),
      notes: Type.String(),
    }),
  )
})

export type GetDataToEncryptReturnType = Static<typeof GetDataToEncrypt>