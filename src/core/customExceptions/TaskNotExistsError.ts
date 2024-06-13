export class TaskNotExistsError extends Error {
  constructor() {
    super('Customer, project or tasks not existing')
    Object.setPrototypeOf(this, TaskNotExistsError.prototype)
  }
}
