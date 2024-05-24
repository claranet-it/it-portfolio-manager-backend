export class UnauthorizedError extends Error{
    constructor(){
        super('unauthorized')
        Object.setPrototypeOf(this, UnauthorizedError.prototype)
    }
}