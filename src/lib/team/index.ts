// lib/team/index.ts

// Экспортируем все из TeamService
export { TeamService, type TeamMember, type TeamStats } from './TeamService';

// Экспортируем все хуки
export { 
  useTeamTree, 
  useDealerTeam, 
  useAllMembers, 
  useTeamStats
} from './TeamModule';

// Экспортируем все компоненты
export { 
  TreeModule, 
  TeamCardModule 
} from './TeamModule';

// Экспортируем default
export { default } from './TeamModule';