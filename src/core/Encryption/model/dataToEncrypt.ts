import { Static, Type } from '@sinclair/typebox'

export const tastToEncrypt = Type.Object({
  id: Type.String(),
  name: Type.String(),
})

export type TaskToEncryptReturnType = Static<typeof tastToEncrypt>

export const effortToEncrypt = Type.Object({
  id: Type.String(),
  month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
  notes: Type.String(),
})

export type EffortToEncryptReturnType = Static<typeof effortToEncrypt>

export const timeEntryToEncrypt = Type.Object({
  id: Type.String(),
  description: Type.String(),
})

export type TimeEntryToEncryptReturnType = Static<typeof timeEntryToEncrypt>

export const customerToEncrypt = Type.Object({
  id: Type.String(),
  name: Type.String(),
})

export type CustomerToEncryptReturnType = Static<typeof customerToEncrypt>

export const projectToEncrypt = Type.Object({
  id: Type.String(),
  name: Type.String(),
})

export type ProjectToEncryptReturnType = Static<typeof projectToEncrypt>

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
      month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
      confirmedEffort: Type.Number(),
      tentativeEffort: Type.Number(),
      notes: Type.String(),
    }),
  )
})

export type GetDataToEncryptReturnType = Static<typeof GetDataToEncrypt>