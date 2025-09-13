[
  {
    "schemaname": "public",
    "tablename": "bonus_levels",
    "indexname": "bonus_levels_pkey",
    "indexdef": "CREATE UNIQUE INDEX bonus_levels_pkey ON public.bonus_levels USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_levels",
    "indexname": "idx_bonus_levels_amount_range",
    "indexdef": "CREATE INDEX idx_bonus_levels_amount_range ON public.bonus_levels USING btree (min_amount, max_amount)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_levels",
    "indexname": "idx_bonus_levels_is_active",
    "indexdef": "CREATE INDEX idx_bonus_levels_is_active ON public.bonus_levels USING btree (is_active)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_levels",
    "indexname": "idx_bonus_levels_sort_order",
    "indexdef": "CREATE INDEX idx_bonus_levels_sort_order ON public.bonus_levels USING btree (sort_order)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_payots",
    "indexname": "bonus_payots_pkey",
    "indexdef": "CREATE UNIQUE INDEX bonus_payots_pkey ON public.bonus_payots USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_payots",
    "indexname": "idx_bonus_payots_order_id",
    "indexdef": "CREATE INDEX idx_bonus_payots_order_id ON public.bonus_payots USING btree (order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_payots",
    "indexname": "idx_bonus_payots_status",
    "indexdef": "CREATE INDEX idx_bonus_payots_status ON public.bonus_payots USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "bonus_payots",
    "indexname": "idx_bonus_payots_user_id",
    "indexdef": "CREATE INDEX idx_bonus_payots_user_id ON public.bonus_payots USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "cart_items",
    "indexname": "cart_items_cart_id_product_id_key",
    "indexdef": "CREATE UNIQUE INDEX cart_items_cart_id_product_id_key ON public.cart_items USING btree (cart_id, product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "cart_items",
    "indexname": "cart_items_pkey",
    "indexdef": "CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "cart_items",
    "indexname": "idx_cart_items_cart_id",
    "indexdef": "CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id)"
  },
  {
    "schemaname": "public",
    "tablename": "cart_items",
    "indexname": "idx_cart_items_cart_product",
    "indexdef": "CREATE INDEX idx_cart_items_cart_product ON public.cart_items USING btree (cart_id, product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "cart_items",
    "indexname": "idx_cart_items_product_id",
    "indexdef": "CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "carts",
    "indexname": "carts_pkey",
    "indexdef": "CREATE UNIQUE INDEX carts_pkey ON public.carts USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "carts",
    "indexname": "idx_carts_status",
    "indexdef": "CREATE INDEX idx_carts_status ON public.carts USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "carts",
    "indexname": "idx_carts_user_id",
    "indexdef": "CREATE INDEX idx_carts_user_id ON public.carts USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "carts",
    "indexname": "idx_carts_user_status",
    "indexdef": "CREATE INDEX idx_carts_user_status ON public.carts USING btree (user_id, status)"
  },
  {
    "schemaname": "public",
    "tablename": "debug_logs",
    "indexname": "debug_logs_pkey",
    "indexdef": "CREATE UNIQUE INDEX debug_logs_pkey ON public.debug_logs USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "events",
    "indexname": "events_pkey",
    "indexdef": "CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "events",
    "indexname": "idx_events_dates",
    "indexdef": "CREATE INDEX idx_events_dates ON public.events USING btree (start_date, end_date)"
  },
  {
    "schemaname": "public",
    "tablename": "events",
    "indexname": "idx_events_priority",
    "indexdef": "CREATE INDEX idx_events_priority ON public.events USING btree (priority DESC)"
  },
  {
    "schemaname": "public",
    "tablename": "events",
    "indexname": "idx_events_status",
    "indexdef": "CREATE INDEX idx_events_status ON public.events USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "news",
    "indexname": "news_pkey",
    "indexdef": "CREATE UNIQUE INDEX news_pkey ON public.news USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "order_items",
    "indexname": "idx_order_items_order_id",
    "indexdef": "CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "order_items",
    "indexname": "idx_order_items_product_id",
    "indexdef": "CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "indexname": "idx_orders_order_status",
    "indexdef": "CREATE INDEX idx_orders_order_status ON public.orders USING btree (order_status)"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "indexname": "idx_orders_payment_status",
    "indexdef": "CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status)"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "indexname": "idx_orders_user_id",
    "indexdef": "CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "orders",
    "indexname": "orders_pkey",
    "indexdef": "CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "products",
    "indexname": "products_pkey",
    "indexdef": "CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_code_uses",
    "indexname": "idx_promo_code_uses_code",
    "indexdef": "CREATE INDEX idx_promo_code_uses_code ON public.promo_code_uses USING btree (promo_code_id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_code_uses",
    "indexname": "idx_promo_code_uses_order",
    "indexdef": "CREATE INDEX idx_promo_code_uses_order ON public.promo_code_uses USING btree (order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_code_uses",
    "indexname": "idx_promo_code_uses_user",
    "indexdef": "CREATE INDEX idx_promo_code_uses_user ON public.promo_code_uses USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_code_uses",
    "indexname": "promo_code_uses_pkey",
    "indexdef": "CREATE UNIQUE INDEX promo_code_uses_pkey ON public.promo_code_uses USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_code_uses",
    "indexname": "promo_code_uses_promo_code_id_order_id_key",
    "indexdef": "CREATE UNIQUE INDEX promo_code_uses_promo_code_id_order_id_key ON public.promo_code_uses USING btree (promo_code_id, order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "idx_promo_codes_active",
    "indexdef": "CREATE INDEX idx_promo_codes_active ON public.promo_codes USING btree (is_active)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "idx_promo_codes_campaign",
    "indexdef": "CREATE INDEX idx_promo_codes_campaign ON public.promo_codes USING btree (campaign_name)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "idx_promo_codes_code",
    "indexdef": "CREATE INDEX idx_promo_codes_code ON public.promo_codes USING btree (code)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "idx_promo_codes_valid_dates",
    "indexdef": "CREATE INDEX idx_promo_codes_valid_dates ON public.promo_codes USING btree (valid_from, valid_until)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "promo_codes_code_key",
    "indexdef": "CREATE UNIQUE INDEX promo_codes_code_key ON public.promo_codes USING btree (code)"
  },
  {
    "schemaname": "public",
    "tablename": "promo_codes",
    "indexname": "promo_codes_pkey",
    "indexdef": "CREATE UNIQUE INDEX promo_codes_pkey ON public.promo_codes USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "star_payots",
    "indexname": "star_payots_pkey",
    "indexdef": "CREATE UNIQUE INDEX star_payots_pkey ON public.star_payots USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "stock_movements",
    "indexname": "idx_stock_movements_created_at",
    "indexdef": "CREATE INDEX idx_stock_movements_created_at ON public.stock_movements USING btree (created_at)"
  },
  {
    "schemaname": "public",
    "tablename": "stock_movements",
    "indexname": "idx_stock_movements_created_by",
    "indexdef": "CREATE INDEX idx_stock_movements_created_by ON public.stock_movements USING btree (created_by)"
  },
  {
    "schemaname": "public",
    "tablename": "stock_movements",
    "indexname": "idx_stock_movements_product_id",
    "indexdef": "CREATE INDEX idx_stock_movements_product_id ON public.stock_movements USING btree (product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "stock_movements",
    "indexname": "stock_movements_pkey",
    "indexdef": "CREATE UNIQUE INDEX stock_movements_pkey ON public.stock_movements USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "subscription_payments",
    "indexname": "subscription_payments_pkey",
    "indexdef": "CREATE UNIQUE INDEX subscription_payments_pkey ON public.subscription_payments USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_bonuses",
    "indexname": "idx_team_purchase_bonuses_beneficiary",
    "indexdef": "CREATE INDEX idx_team_purchase_bonuses_beneficiary ON public.team_purchase_bonuses USING btree (beneficiary_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_bonuses",
    "indexname": "idx_team_purchase_bonuses_contributor",
    "indexdef": "CREATE INDEX idx_team_purchase_bonuses_contributor ON public.team_purchase_bonuses USING btree (contributor_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_bonuses",
    "indexname": "idx_team_purchase_bonuses_purchase",
    "indexdef": "CREATE INDEX idx_team_purchase_bonuses_purchase ON public.team_purchase_bonuses USING btree (team_purchase_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_bonuses",
    "indexname": "idx_team_purchase_bonuses_status",
    "indexdef": "CREATE INDEX idx_team_purchase_bonuses_status ON public.team_purchase_bonuses USING btree (calculation_status, payment_status)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_bonuses",
    "indexname": "team_purchase_bonuses_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_bonuses_pkey ON public.team_purchase_bonuses USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_carts",
    "indexname": "idx_team_purchase_carts_member",
    "indexdef": "CREATE INDEX idx_team_purchase_carts_member ON public.team_purchase_carts USING btree (member_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_carts",
    "indexname": "idx_team_purchase_carts_purchase",
    "indexdef": "CREATE INDEX idx_team_purchase_carts_purchase ON public.team_purchase_carts USING btree (team_purchase_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_carts",
    "indexname": "idx_team_purchase_carts_user",
    "indexdef": "CREATE INDEX idx_team_purchase_carts_user ON public.team_purchase_carts USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_carts",
    "indexname": "team_purchase_carts_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_carts_pkey ON public.team_purchase_carts USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_carts",
    "indexname": "team_purchase_carts_team_purchase_id_user_id_product_id_key",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_carts_team_purchase_id_user_id_product_id_key ON public.team_purchase_carts USING btree (team_purchase_id, user_id, product_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "idx_team_purchase_members_purchase",
    "indexdef": "CREATE INDEX idx_team_purchase_members_purchase ON public.team_purchase_members USING btree (team_purchase_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "idx_team_purchase_members_status",
    "indexdef": "CREATE INDEX idx_team_purchase_members_status ON public.team_purchase_members USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "idx_team_purchase_members_team_purchase_id",
    "indexdef": "CREATE INDEX idx_team_purchase_members_team_purchase_id ON public.team_purchase_members USING btree (team_purchase_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "idx_team_purchase_members_user",
    "indexdef": "CREATE INDEX idx_team_purchase_members_user ON public.team_purchase_members USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "idx_team_purchase_members_user_id",
    "indexdef": "CREATE INDEX idx_team_purchase_members_user_id ON public.team_purchase_members USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "team_purchase_members_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_members_pkey ON public.team_purchase_members USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_members",
    "indexname": "team_purchase_members_team_purchase_id_user_id_key",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_members_team_purchase_id_user_id_key ON public.team_purchase_members USING btree (team_purchase_id, user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_orders",
    "indexname": "team_purchase_orders_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_orders_pkey ON public.team_purchase_orders USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchase_orders",
    "indexname": "team_purchase_orders_team_purchase_id_order_id_key",
    "indexdef": "CREATE UNIQUE INDEX team_purchase_orders_team_purchase_id_order_id_key ON public.team_purchase_orders USING btree (team_purchase_id, order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchases",
    "indexname": "idx_team_purchases_initiator",
    "indexdef": "CREATE INDEX idx_team_purchases_initiator ON public.team_purchases USING btree (initiator_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchases",
    "indexname": "idx_team_purchases_invite_code",
    "indexdef": "CREATE INDEX idx_team_purchases_invite_code ON public.team_purchases USING btree (invite_code)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchases",
    "indexname": "idx_team_purchases_status",
    "indexdef": "CREATE INDEX idx_team_purchases_status ON public.team_purchases USING btree (status)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchases",
    "indexname": "team_purchases_invite_code_key",
    "indexdef": "CREATE UNIQUE INDEX team_purchases_invite_code_key ON public.team_purchases USING btree (invite_code)"
  },
  {
    "schemaname": "public",
    "tablename": "team_purchases",
    "indexname": "team_purchases_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_purchases_pkey ON public.team_purchases USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_relations",
    "indexname": "idx_team_relations_order_id",
    "indexdef": "CREATE INDEX idx_team_relations_order_id ON public.team_relations USING btree (order_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_relations",
    "indexname": "idx_team_relations_parent_id",
    "indexdef": "CREATE INDEX idx_team_relations_parent_id ON public.team_relations USING btree (parent_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_relations",
    "indexname": "idx_team_relations_user_id",
    "indexdef": "CREATE INDEX idx_team_relations_user_id ON public.team_relations USING btree (user_id)"
  },
  {
    "schemaname": "public",
    "tablename": "team_relations",
    "indexname": "team_relations_pkey",
    "indexdef": "CREATE UNIQUE INDEX team_relations_pkey ON public.team_relations USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "user_volumes",
    "indexname": "user_volumes_pkey",
    "indexdef": "CREATE UNIQUE INDEX user_volumes_pkey ON public.user_volumes USING btree (id)"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "indexname": "idx_users_parent_id",
    "indexdef": "CREATE INDEX idx_users_parent_id ON public.users USING btree (parent_id)"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "indexname": "idx_users_personal_level",
    "indexdef": "CREATE INDEX idx_users_personal_level ON public.users USING btree (personal_level)"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "indexname": "users_pkey",
    "indexdef": "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)"
  }
]