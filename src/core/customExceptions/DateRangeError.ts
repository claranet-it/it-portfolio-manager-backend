export class DateRangeError extends Error {
  constructor(from: string, to: string) {
    super(`End date ${from} must be greater than Start date ${to}`)
    Object.setPrototypeOf(this, DateRangeError.prototype)
  }
}
