export class EffortExceedsMaxError extends Error {
  constructor(montYear: string) {
    const [month, year] = montYear.split('_')
    const date = new Date()
    date.setMonth(parseInt(month) - 1)

    const monthName = date.toLocaleString('en-US', { month: 'long' })
    super(`Total effort for period ${monthName} ${year} is greater then 100`)
    Object.setPrototypeOf(this, EffortExceedsMaxError.prototype)
  }
}
