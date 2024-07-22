export class TimeEntryError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, TimeEntryError.prototype)
  }
}
