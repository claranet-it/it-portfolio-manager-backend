export type TableName =
  | 'SkillMatrix'
  | 'UserProfile'
  | 'Effort'
  | 'Task'
  | 'TimeEntry'
  | 'Crew'
  | 'TaskProperties'

export function getTableName(tableName: TableName) {
  const stage = process.env.STAGE_NAME || 'dev'

  return `ItPortfolioManager-${tableName}-${stage}`
}
