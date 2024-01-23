export class EffortExcedsMaxError extends Error{
    constructor(montYear: string){
        super(`Total effort for period ${montYear} is greater then 100`);
        Object.setPrototypeOf(this, EffortExcedsMaxError.prototype)
    }
}