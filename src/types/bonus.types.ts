// types/bonus.types.ts

export interface BonusLevel {
  id: string;
  min_amount: number;
  max_amount: number | null;
  bonus_percent: number;
  name: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
}

export interface UserTurnover {
  user_id: string;
  month_start: string;
  orders_total: number;
  personal_turnover: number;
  total_turnover: number;
  bonus_percent: number;
  updated_at: string;
}

export interface MonthlyBonus {
  id: string;
  beneficiary_id: string;
  contributor_id: string;
  month_period: string;
  order_amount: number;
  bonus_percent: number;
  bonus_amount: number;
  bonus_type: 'personal' | 'differential';
  hierarchy_level: number;
  calculation_details: any;
  status: 'preview' | 'calculated' | 'paid';
  calculated_at?: string;
  paid_at?: string;
}

export interface DealerHierarchy {
  user_id: string;
  email: string;
  full_name: string;
  parent_id: string | null;
  level: number;
  month_orders: number;
  personal_turnover: number;
  team_turnover: number;
  total_turnover: number;
  bonus_percent: number;
  personal_bonus: number;
  differential_bonus: number;
  total_bonus: number;
}

export interface TeamMember {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  parent_id: string | null;
  level: number;
  personal_turnover: number;
  team_turnover: number;
  total_turnover: number;
  bonus_percent: number;
  bonus_amount: number;
  team_size: number;
  status: string;
  joined_date: string;
}

export interface BonusCalculationPreview {
  success: boolean;
  month: string;
  total_bonuses: number;
  total_amount: number;
  details?: MonthlyBonus[];
}

export interface BonusStatistics {
  current_month: {
    personal_turnover: number;
    team_turnover: number;
    total_turnover: number;
    expected_bonus: number;
    bonus_percent: number;
    current_level: BonusLevel | null;
    next_level: BonusLevel | null;
    amount_to_next_level: number;
  };
  history: {
    total_earned: number;
    total_paid: number;
    pending_amount: number;
    months_active: number;
    average_monthly_bonus: number;
  };
  team: {
    total_members: number;
    active_members: number;
    total_team_turnover: number;
    top_performers: TeamMember[];
  };
}

export interface UserBonusDetails {
  user_info: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string | null;
    role: string;
    joined_date: string;
  };
  current_turnover: UserTurnover | null;
  bonus_level: BonusLevel | null;
  monthly_bonuses: MonthlyBonus[];
  team_structure: TeamMember[];
  sponsor_chain: {
    level: number;
    user_id: string;
    full_name: string;
    email: string;
    bonus_percent: number;
  }[];
}

export interface OrderHistory {
  id: string;
  order_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

export interface TransactionHistory {
  id: string;
  transaction_type: string;
  operation: 'credit' | 'debit';
  amount: number;
  created_at: string;
  source_type: string;
  notes: string;
  status: string;
}

export interface BonusChartData {
  month: string;
  personal: number;
  team: number;
  total: number;
}

export interface TeamTreeNode {
  id: string;
  name: string;
  email: string;
  turnover: number;
  bonus_percent: number;
  bonus_amount: number;
  children: TeamTreeNode[];
  expanded?: boolean;
}