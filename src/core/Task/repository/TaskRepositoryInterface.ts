
export interface TaskRepositoryInterface {
  getCustomers(company: string): Promise<string[]>
}
