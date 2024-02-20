import { Static, Type } from "@sinclair/typebox";

export const accountStatus = Type.Object({
    email: Type.String(),
    active: Type.Boolean()
})

export type accountstatusType =  Static<typeof accountStatus>