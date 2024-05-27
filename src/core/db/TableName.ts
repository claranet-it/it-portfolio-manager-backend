export type TableName = 'SkillMatrix' | 'UserProfile' | 'Effort' | 'Task' | 'TimeEntry' | 'Company'

export function getTableName(tableName: TableName) {
  const stage = process.env.STAGE_NAME || 'dev'

  return `ItPortfolioManager-${tableName}-${stage}`
}
