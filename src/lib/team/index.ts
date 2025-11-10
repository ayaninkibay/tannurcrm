// lib/team/index.ts

// Экспортируем все из TeamService
export { TeamService, type TeamMember, type TeamStats } from './TeamService';

// Экспортируем все хуки из TeamModule
export {
  useTeamTree,
  useDirectReferrals,
  useDirectReferralsWithStats,
  useTeamStats,
  useTeamByLevel,
  useTeamStatsByLevel,
  useTeamSearch,
  useTopPerformers,
  useUserGoalInfo,
  useTeamPagination,
  type TeamStatsData
} from './TeamModule';