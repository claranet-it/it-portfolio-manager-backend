export class TaskError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, TaskError.prototype)
  }
}
