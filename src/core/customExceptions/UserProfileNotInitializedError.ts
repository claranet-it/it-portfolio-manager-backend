export class UserProfileNotInitializedError extends Error {
  constructor() {
    super('User Profile not initialized')
    Object.setPrototypeOf(this, UserProfileNotInitializedError.prototype)
  }
}
