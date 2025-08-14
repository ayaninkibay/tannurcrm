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
          stock: number | null;
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
          stock?: number | null;
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
          stock?: number | null;
          category?: string | null;
          flagman?: boolean | null;
          gallery?: string[] | null;
          updated_at?: string | null;
        };
      };
      stock_movements: {
        Row: {
          id: string;                    // uuid
          created_at: string;            // timestamp
          product_id: string;            // uuid (связь с products)
          change: number;                // int4 (изменение количества)
          reason: string;                // text (причина изменения)
          created_by: string;            // uuid (связь с users)
          source: string;                // text (источник изменения)
          order_id: string | null;       // uuid (если есть связь с заказом)
          notes: string | null;          // text (дополнительные заметки)
          previous_stock: number | null; // int4 (предыдущий остаток)
          new_stock: number | null;      // int4 (новый остаток)
          updated_at: string | null;     // timestamp
        };
        Insert: {
          id?: string;
          created_at?: string;
          product_id: string;            // обязательное поле
          change: number;                // обязательное поле
          reason: string;                // обязательное поле
          created_by: string;            // обязательное поле
          source: string;                // обязательное поле
          order_id?: string | null;
          notes?: string | null;
          previous_stock?: number | null;
          new_stock?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          product_id?: string;
          change?: number;
          reason?: string;
          created_by?: string;
          source?: string;
          order_id?: string | null;
          notes?: string | null;
          previous_stock?: number | null;
          new_stock?: number | null;
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

// Типы для источников изменений
export type StockMovementSource = 
  | 'direct_update'  // Прямое изменение остатка
  | 'sale'          // Продажа
  | 'purchase'      // Поступление
  | 'return'        // Возврат
  | 'adjustment'    // Корректировка
  | 'transfer'      // Перемещение
  | 'production'    // Производство
  | 'write_off';    // Списание

// Типы для причин изменений
export type StockMovementReason = 
  | 'Прямое изменение остатка'
  | 'Продажа товара'
  | 'Поступление товара'
  | 'Возврат от клиента'
  | 'Возврат поставщику'
  | 'Инвентаризация'
  | 'Брак'
  | 'Истек срок годности'
  | 'Перемещение между складами'
  | 'Производство';

// Расширенный тип для отображения с данными связанных таблиц
export type StockMovementWithRelations = StockMovementRow & {
  product?: ProductRow;           // Данные товара
  user?: Database['public']['Tables']['users']['Row']; // Данные пользователя
};

// Тип для фильтров
export type StockMovementFilters = {
  product_id?: string;
  created_by?: string;
  source?: StockMovementSource;
  reason?: string;
  date_from?: string;
  date_to?: string;
  change_type?: 'incoming' | 'outgoing' | 'all';
};

// Тип для статистики
export type StockMovementStats = {
  total_movements: number;
  total_incoming: number;
  total_outgoing: number;
  unique_products: number;
  period_start?: string;
  period_end?: string;
};