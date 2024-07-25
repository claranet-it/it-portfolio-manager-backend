export const invariant = (condition: boolean, message: string): void => {
    if (!condition) {
        throw new Error(message)
    }
}