export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          role: string;
          status: string;
          is_confirmed: boolean;
          star_id: string;
          region: string;
          instagram: string;
          avatar_url: string;
          referral_code: string | null;
          sponsor_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          role?: string;
          status?: string;
          is_confirmed?: boolean;
          star_id?: string;
          region?: string;
          instagram?: string;
          avatar_url?: string;
          referral_code?: string | null;
          sponsor_id?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          role?: string;
          status?: string;
          is_confirmed?: boolean;
          star_id?: string;
          region?: string;
          instagram?: string;
          avatar_url?: string;
          referral_code?: string | null;
          sponsor_id?: string | null;
        };
      };
    };
  };
};
