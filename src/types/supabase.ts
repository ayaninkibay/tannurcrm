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

            products: {
        Row: {
          id: string;                  // uuid
          created_at: string;          // timestamp (now() по умолчанию)
          description: string | null;  // text
          price: number | null;        // numeric
          image_url: string | null;    // text
          is_active: boolean | null;   // bool
          price_dealer: number | null; // numeric
          compound: string | null;     // text
          video_instr: string | null;  // text
          name: string | null;         // text
          category: string | null;     // text
          flagman: boolean | null;     // bool (default true)
          gallery: string[] | null;    // text[] (array)
          updated_at: string | null;   // timestamp
        };
        Insert: {
          id?: string;
          created_at?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          is_active?: boolean | null;
          price_dealer?: number | null;
          compound?: string | null;
          video_instr?: string | null;
          name?: string | null;
          category?: string | null;
          flagman?: boolean | null;
          gallery?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          is_active?: boolean | null;
          price_dealer?: number | null;
          compound?: string | null;
          video_instr?: string | null;
          name?: string | null;
          category?: string | null;
          flagman?: boolean | null;
          gallery?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
  };
};

// Алиасы под products
export type ProductRow    = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];