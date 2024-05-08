export type TableName = 'SkillMatrix' | 'UserProfile' | 'Effort' | 'Projects'

export function getTableName(tableName: TableName) {
  const stage = process.env.STAGE_NAME || 'dev'

  return `ItPortfolioManager-${tableName}-${stage}`
}
