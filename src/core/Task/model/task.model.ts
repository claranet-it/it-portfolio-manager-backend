import { Static, Type } from '@sinclair/typebox'

export const ProjectRow = Type.Object({
  uid: Type.String(),
  name: Type.String(),
  category: Type.String(),
  company: Type.String(),
})

export type ProjectRowType = Static<typeof ProjectRow>

export const Projects = Type.Array(ProjectRow)

export type ProjectsType = Static<typeof Projects>

export const ProjectReadParams = Type.Object({
  company: Type.String(),
})

export const CustomerList = Type.Array(Type.String())

export type ProjectReadParamsType = Static<typeof ProjectReadParams>
