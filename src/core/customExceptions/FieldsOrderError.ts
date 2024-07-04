export class FieldsOrderError extends Error {
  constructor() {
    super(
      `You must select a Customer first, then a Project and finally a Task.`,
    )
    Object.setPrototypeOf(this, FieldsOrderError.prototype)
  }
}
