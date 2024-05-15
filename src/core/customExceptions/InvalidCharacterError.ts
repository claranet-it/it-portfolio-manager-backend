export class InvalidCharacterError extends Error{
    constructor(message: string){
        super(message)
        Object.setPrototypeOf(this, InvalidCharacterError.prototype)
    }
}