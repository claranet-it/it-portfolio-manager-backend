export class FieldsOrderError extends Error {
  constructor() {
    super(`You must select a Customer, then a Project, then a Task`)
    Object.setPrototypeOf(this, FieldsOrderError.prototype)
  }
}
