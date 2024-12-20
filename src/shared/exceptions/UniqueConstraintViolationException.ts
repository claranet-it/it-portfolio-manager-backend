export class UniqueConstraintViolationException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UniqueConstraintViolationException'
  }
}
