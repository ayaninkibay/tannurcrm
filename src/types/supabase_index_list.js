[
  {
    "table_name": "audit_log_entries",
    "index_name": "audit_log_entries_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "audit_log_entries",
    "index_name": "audit_logs_instance_id_idx",
    "column_name": "instance_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "balance_transactions_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_created_at",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_source",
    "column_name": "source_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_source",
    "column_name": "source_type",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_type",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_type",
    "column_name": "transaction_type",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_id_status",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_id_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_id_status",
    "column_name": "transaction_type",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_id_status",
    "column_name": "operation",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_id_status",
    "column_name": "amount",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_status",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "balance_transactions",
    "index_name": "idx_balance_transactions_user_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_event_targets",
    "index_name": "bonus_event_targets_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "bonus_event_targets",
    "index_name": "idx_bonus_event_targets_event",
    "column_name": "event_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_event_targets",
    "index_name": "idx_bonus_event_targets_sort",
    "column_name": "sort_order",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_event_targets",
    "index_name": "idx_bonus_event_targets_sort",
    "column_name": "event_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_events",
    "index_name": "bonus_events_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "bonus_events",
    "index_name": "idx_bonus_events_active",
    "column_name": "is_active",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_events",
    "index_name": "idx_bonus_events_active",
    "column_name": "end_date",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_levels",
    "index_name": "bonus_levels_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "bonus_levels",
    "index_name": "idx_bonus_levels_amount_range",
    "column_name": "min_amount",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_levels",
    "index_name": "idx_bonus_levels_amount_range",
    "column_name": "max_amount",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_levels",
    "index_name": "idx_bonus_levels_is_active",
    "column_name": "is_active",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "bonus_levels",
    "index_name": "idx_bonus_levels_sort_order",
    "column_name": "sort_order",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "buckets",
    "index_name": "bname",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "buckets",
    "index_name": "buckets_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "buckets_analytics",
    "index_name": "buckets_analytics_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "cart_items",
    "index_name": "cart_items_cart_id_product_id_key",
    "column_name": "product_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "cart_items",
    "index_name": "cart_items_cart_id_product_id_key",
    "column_name": "cart_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "cart_items",
    "index_name": "cart_items_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "cart_items",
    "index_name": "idx_cart_items_cart_id",
    "column_name": "cart_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "cart_items",
    "index_name": "idx_cart_items_cart_product",
    "column_name": "product_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "cart_items",
    "index_name": "idx_cart_items_cart_product",
    "column_name": "cart_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "cart_items",
    "index_name": "idx_cart_items_product_id",
    "column_name": "product_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "carts",
    "index_name": "carts_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "carts",
    "index_name": "idx_carts_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "carts",
    "index_name": "idx_carts_user_id",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "carts",
    "index_name": "idx_carts_user_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "carts",
    "index_name": "idx_carts_user_status",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "course_lessons",
    "index_name": "course_lessons_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "course_lessons",
    "index_name": "idx_course_lessons_course_id",
    "column_name": "course_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "course_lessons",
    "index_name": "idx_course_lessons_is_published",
    "column_name": "is_published",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "course_lessons",
    "index_name": "idx_course_lessons_order_index",
    "column_name": "course_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "course_lessons",
    "index_name": "idx_course_lessons_order_index",
    "column_name": "order_index",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "courses",
    "index_name": "courses_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "courses",
    "index_name": "courses_slug_key",
    "column_name": "slug",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "courses",
    "index_name": "idx_courses_author_id",
    "column_name": "author_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "courses",
    "index_name": "idx_courses_category",
    "column_name": "category",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "courses",
    "index_name": "idx_courses_is_published",
    "column_name": "is_published",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "courses",
    "index_name": "idx_courses_slug",
    "column_name": "slug",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "debug_logs",
    "index_name": "debug_logs_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "distributors",
    "index_name": "distributors_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "distributors",
    "index_name": "idx_distributors_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "distributors",
    "index_name": "idx_distributors_user_id",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "document_categories",
    "index_name": "document_categories_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "document_categories",
    "index_name": "idx_document_categories_is_active",
    "column_name": "is_active",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "events",
    "index_name": "events_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "events",
    "index_name": "idx_events_dates",
    "column_name": "end_date",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "events",
    "index_name": "idx_events_dates",
    "column_name": "start_date",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "events",
    "index_name": "idx_events_priority",
    "column_name": "priority",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "events",
    "index_name": "idx_events_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "flow_state",
    "index_name": "flow_state_created_at_idx",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "flow_state",
    "index_name": "flow_state_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "flow_state",
    "index_name": "idx_auth_code",
    "column_name": "auth_code",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "flow_state",
    "index_name": "idx_user_id_auth_method",
    "column_name": "authentication_method",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "flow_state",
    "index_name": "idx_user_id_auth_method",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "gift_items",
    "index_name": "gift_items_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "gift_items",
    "index_name": "idx_gift_items_gift_id",
    "column_name": "gift_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "gift_items",
    "index_name": "idx_gift_items_product_id",
    "column_name": "product_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "gifts",
    "index_name": "gifts_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "gifts",
    "index_name": "idx_gifts_created_at",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "gifts",
    "index_name": "idx_gifts_created_by",
    "column_name": "created_by",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "gifts",
    "index_name": "idx_gifts_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "identities",
    "index_name": "identities_email_idx",
    "column_name": "email",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "identities",
    "index_name": "identities_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "identities",
    "index_name": "identities_provider_id_provider_unique",
    "column_name": "provider_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "identities",
    "index_name": "identities_provider_id_provider_unique",
    "column_name": "provider",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "identities",
    "index_name": "identities_user_id_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "instances",
    "index_name": "instances_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_25",
    "index_name": "messages_2025_09_25_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_25",
    "index_name": "messages_2025_09_25_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_25",
    "index_name": "messages_2025_09_25_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_25",
    "index_name": "messages_2025_09_25_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_26",
    "index_name": "messages_2025_09_26_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_26",
    "index_name": "messages_2025_09_26_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_26",
    "index_name": "messages_2025_09_26_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_26",
    "index_name": "messages_2025_09_26_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_27",
    "index_name": "messages_2025_09_27_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_27",
    "index_name": "messages_2025_09_27_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_27",
    "index_name": "messages_2025_09_27_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_27",
    "index_name": "messages_2025_09_27_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_28",
    "index_name": "messages_2025_09_28_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_28",
    "index_name": "messages_2025_09_28_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_28",
    "index_name": "messages_2025_09_28_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_28",
    "index_name": "messages_2025_09_28_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_29",
    "index_name": "messages_2025_09_29_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_29",
    "index_name": "messages_2025_09_29_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_29",
    "index_name": "messages_2025_09_29_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_29",
    "index_name": "messages_2025_09_29_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_30",
    "index_name": "messages_2025_09_30_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_30",
    "index_name": "messages_2025_09_30_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_09_30",
    "index_name": "messages_2025_09_30_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_09_30",
    "index_name": "messages_2025_09_30_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_10_01",
    "index_name": "messages_2025_10_01_inserted_at_topic_idx",
    "column_name": "topic",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_10_01",
    "index_name": "messages_2025_10_01_inserted_at_topic_idx",
    "column_name": "inserted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "messages_2025_10_01",
    "index_name": "messages_2025_10_01_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "messages_2025_10_01",
    "index_name": "messages_2025_10_01_pkey",
    "column_name": "inserted_at",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "mfa_amr_claims",
    "index_name": "amr_id_pk",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "mfa_amr_claims",
    "index_name": "mfa_amr_claims_session_id_authentication_method_pkey",
    "column_name": "session_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_amr_claims",
    "index_name": "mfa_amr_claims_session_id_authentication_method_pkey",
    "column_name": "authentication_method",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_challenges",
    "index_name": "mfa_challenge_created_at_idx",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "mfa_challenges",
    "index_name": "mfa_challenges_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "mfa_factors",
    "index_name": "factor_id_created_at_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "factor_id_created_at_idx",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "mfa_factors_last_challenged_at_key",
    "column_name": "last_challenged_at",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "mfa_factors_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "mfa_factors",
    "index_name": "mfa_factors_user_friendly_name_unique",
    "column_name": "friendly_name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "mfa_factors_user_friendly_name_unique",
    "column_name": "user_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "mfa_factors_user_id_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "unique_phone_factor_per_user",
    "column_name": "phone",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "mfa_factors",
    "index_name": "unique_phone_factor_per_user",
    "column_name": "user_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "migrations",
    "index_name": "migrations_name_key",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "migrations",
    "index_name": "migrations_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_beneficiary",
    "column_name": "beneficiary_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_beneficiary_auth",
    "column_name": "beneficiary_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_contributor",
    "column_name": "contributor_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_month",
    "column_name": "month_period",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "idx_monthly_bonuses_type",
    "column_name": "bonus_type",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "monthly_bonuses_month_period_beneficiary_id_contributor_id_key",
    "column_name": "month_period",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "monthly_bonuses_month_period_beneficiary_id_contributor_id_key",
    "column_name": "contributor_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "monthly_bonuses_month_period_beneficiary_id_contributor_id_key",
    "column_name": "beneficiary_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "monthly_bonuses",
    "index_name": "monthly_bonuses_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "oauth_clients",
    "index_name": "oauth_clients_client_id_idx",
    "column_name": "client_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "oauth_clients",
    "index_name": "oauth_clients_client_id_key",
    "column_name": "client_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "oauth_clients",
    "index_name": "oauth_clients_deleted_at_idx",
    "column_name": "deleted_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "oauth_clients",
    "index_name": "oauth_clients_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "objects",
    "index_name": "bucketid_objname",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "bucketid_objname",
    "column_name": "bucket_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_name_bucket_level_unique",
    "column_name": "level",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_name_bucket_level_unique",
    "column_name": "bucket_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_name_bucket_level_unique",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_objects_bucket_id_name",
    "column_name": "bucket_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_objects_bucket_id_name",
    "column_name": "name",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_objects_lower_name",
    "column_name": "level",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "idx_objects_lower_name",
    "column_name": "bucket_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "name_prefix_search",
    "column_name": "name",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "objects_bucket_id_level_idx",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "objects_bucket_id_level_idx",
    "column_name": "level",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "objects_bucket_id_level_idx",
    "column_name": "bucket_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "objects",
    "index_name": "objects_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "one_time_tokens",
    "index_name": "one_time_tokens_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "one_time_tokens",
    "index_name": "one_time_tokens_relates_to_hash_idx",
    "column_name": "relates_to",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "one_time_tokens",
    "index_name": "one_time_tokens_token_hash_hash_idx",
    "column_name": "token_hash",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "one_time_tokens",
    "index_name": "one_time_tokens_user_id_token_type_key",
    "column_name": "token_type",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "one_time_tokens",
    "index_name": "one_time_tokens_user_id_token_type_key",
    "column_name": "user_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "order_items",
    "index_name": "idx_order_items_order_id",
    "column_name": "order_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "order_items",
    "index_name": "idx_order_items_product_id",
    "column_name": "product_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "order_items",
    "index_name": "order_items_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "orders",
    "index_name": "idx_orders_order_status",
    "column_name": "order_status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "orders",
    "index_name": "idx_orders_payment_status",
    "column_name": "payment_status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "orders",
    "index_name": "idx_orders_user_id",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "orders",
    "index_name": "orders_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_aggregate",
    "index_name": "pg_aggregate_fnoid_index",
    "column_name": "aggfnoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_am",
    "index_name": "pg_am_name_index",
    "column_name": "amname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_am",
    "index_name": "pg_am_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_fam_strat_index",
    "column_name": "amoprighttype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_fam_strat_index",
    "column_name": "amopfamily",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_fam_strat_index",
    "column_name": "amoplefttype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_fam_strat_index",
    "column_name": "amopstrategy",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_opr_fam_index",
    "column_name": "amopfamily",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_opr_fam_index",
    "column_name": "amopopr",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amop",
    "index_name": "pg_amop_opr_fam_index",
    "column_name": "amoppurpose",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amproc",
    "index_name": "pg_amproc_fam_proc_index",
    "column_name": "amprocfamily",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amproc",
    "index_name": "pg_amproc_fam_proc_index",
    "column_name": "amprocnum",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amproc",
    "index_name": "pg_amproc_fam_proc_index",
    "column_name": "amproclefttype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amproc",
    "index_name": "pg_amproc_fam_proc_index",
    "column_name": "amprocrighttype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_amproc",
    "index_name": "pg_amproc_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_attrdef",
    "index_name": "pg_attrdef_adrelid_adnum_index",
    "column_name": "adnum",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_attrdef",
    "index_name": "pg_attrdef_adrelid_adnum_index",
    "column_name": "adrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_attrdef",
    "index_name": "pg_attrdef_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_attribute",
    "index_name": "pg_attribute_relid_attnam_index",
    "column_name": "attname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_attribute",
    "index_name": "pg_attribute_relid_attnam_index",
    "column_name": "attrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_attribute",
    "index_name": "pg_attribute_relid_attnum_index",
    "column_name": "attrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_attribute",
    "index_name": "pg_attribute_relid_attnum_index",
    "column_name": "attnum",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_grantor_index",
    "column_name": "grantor",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_member_role_index",
    "column_name": "roleid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_member_role_index",
    "column_name": "member",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_member_role_index",
    "column_name": "grantor",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_role_member_index",
    "column_name": "roleid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_role_member_index",
    "column_name": "member",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_auth_members",
    "index_name": "pg_auth_members_role_member_index",
    "column_name": "grantor",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_authid",
    "index_name": "pg_authid_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_authid",
    "index_name": "pg_authid_rolname_index",
    "column_name": "rolname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_cast",
    "index_name": "pg_cast_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_cast",
    "index_name": "pg_cast_source_target_index",
    "column_name": "casttarget",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_cast",
    "index_name": "pg_cast_source_target_index",
    "column_name": "castsource",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_class",
    "index_name": "pg_class_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_class",
    "index_name": "pg_class_relname_nsp_index",
    "column_name": "relname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_class",
    "index_name": "pg_class_relname_nsp_index",
    "column_name": "relnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_class",
    "index_name": "pg_class_tblspc_relfilenode_index",
    "column_name": "relfilenode",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_class",
    "index_name": "pg_class_tblspc_relfilenode_index",
    "column_name": "reltablespace",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_collation",
    "index_name": "pg_collation_name_enc_nsp_index",
    "column_name": "collencoding",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_collation",
    "index_name": "pg_collation_name_enc_nsp_index",
    "column_name": "collnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_collation",
    "index_name": "pg_collation_name_enc_nsp_index",
    "column_name": "collname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_collation",
    "index_name": "pg_collation_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conname_nsp_index",
    "column_name": "connamespace",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conname_nsp_index",
    "column_name": "conname",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conparentid_index",
    "column_name": "conparentid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conrelid_contypid_conname_index",
    "column_name": "conrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conrelid_contypid_conname_index",
    "column_name": "contypid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_conrelid_contypid_conname_index",
    "column_name": "conname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_contypid_index",
    "column_name": "contypid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_constraint",
    "index_name": "pg_constraint_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_default_index",
    "column_name": "contoencoding",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_default_index",
    "column_name": "conforencoding",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_default_index",
    "column_name": "connamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_default_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_name_nsp_index",
    "column_name": "conname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_name_nsp_index",
    "column_name": "connamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_conversion",
    "index_name": "pg_conversion_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_database",
    "index_name": "pg_database_datname_index",
    "column_name": "datname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_database",
    "index_name": "pg_database_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_db_role_setting",
    "index_name": "pg_db_role_setting_databaseid_rol_index",
    "column_name": "setrole",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_db_role_setting",
    "index_name": "pg_db_role_setting_databaseid_rol_index",
    "column_name": "setdatabase",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_default_acl",
    "index_name": "pg_default_acl_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_default_acl",
    "index_name": "pg_default_acl_role_nsp_obj_index",
    "column_name": "defaclobjtype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_default_acl",
    "index_name": "pg_default_acl_role_nsp_obj_index",
    "column_name": "defaclrole",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_default_acl",
    "index_name": "pg_default_acl_role_nsp_obj_index",
    "column_name": "defaclnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_depender_index",
    "column_name": "classid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_depender_index",
    "column_name": "objid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_depender_index",
    "column_name": "objsubid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_reference_index",
    "column_name": "refclassid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_reference_index",
    "column_name": "refobjid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_depend",
    "index_name": "pg_depend_reference_index",
    "column_name": "refobjsubid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_description",
    "index_name": "pg_description_o_c_o_index",
    "column_name": "classoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_description",
    "index_name": "pg_description_o_c_o_index",
    "column_name": "objsubid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_description",
    "index_name": "pg_description_o_c_o_index",
    "column_name": "objoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_enum",
    "index_name": "pg_enum_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_enum",
    "index_name": "pg_enum_typid_label_index",
    "column_name": "enumlabel",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_enum",
    "index_name": "pg_enum_typid_label_index",
    "column_name": "enumtypid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_enum",
    "index_name": "pg_enum_typid_sortorder_index",
    "column_name": "enumtypid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_enum",
    "index_name": "pg_enum_typid_sortorder_index",
    "column_name": "enumsortorder",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_event_trigger",
    "index_name": "pg_event_trigger_evtname_index",
    "column_name": "evtname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_event_trigger",
    "index_name": "pg_event_trigger_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_extension",
    "index_name": "pg_extension_name_index",
    "column_name": "extname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_extension",
    "index_name": "pg_extension_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_foreign_data_wrapper",
    "index_name": "pg_foreign_data_wrapper_name_index",
    "column_name": "fdwname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_foreign_data_wrapper",
    "index_name": "pg_foreign_data_wrapper_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_foreign_server",
    "index_name": "pg_foreign_server_name_index",
    "column_name": "srvname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_foreign_server",
    "index_name": "pg_foreign_server_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_foreign_table",
    "index_name": "pg_foreign_table_relid_index",
    "column_name": "ftrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_index",
    "index_name": "pg_index_indexrelid_index",
    "column_name": "indexrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_index",
    "index_name": "pg_index_indrelid_index",
    "column_name": "indrelid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_inherits",
    "index_name": "pg_inherits_parent_index",
    "column_name": "inhparent",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_inherits",
    "index_name": "pg_inherits_relid_seqno_index",
    "column_name": "inhseqno",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_inherits",
    "index_name": "pg_inherits_relid_seqno_index",
    "column_name": "inhrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_init_privs",
    "index_name": "pg_init_privs_o_c_o_index",
    "column_name": "objsubid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_init_privs",
    "index_name": "pg_init_privs_o_c_o_index",
    "column_name": "classoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_init_privs",
    "index_name": "pg_init_privs_o_c_o_index",
    "column_name": "objoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_language",
    "index_name": "pg_language_name_index",
    "column_name": "lanname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_language",
    "index_name": "pg_language_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_largeobject",
    "index_name": "pg_largeobject_loid_pn_index",
    "column_name": "pageno",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_largeobject",
    "index_name": "pg_largeobject_loid_pn_index",
    "column_name": "loid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_largeobject_metadata",
    "index_name": "pg_largeobject_metadata_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_namespace",
    "index_name": "pg_namespace_nspname_index",
    "column_name": "nspname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_namespace",
    "index_name": "pg_namespace_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_opclass",
    "index_name": "pg_opclass_am_name_nsp_index",
    "column_name": "opcname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opclass",
    "index_name": "pg_opclass_am_name_nsp_index",
    "column_name": "opcmethod",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opclass",
    "index_name": "pg_opclass_am_name_nsp_index",
    "column_name": "opcnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opclass",
    "index_name": "pg_opclass_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_operator",
    "index_name": "pg_operator_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_operator",
    "index_name": "pg_operator_oprname_l_r_n_index",
    "column_name": "oprright",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_operator",
    "index_name": "pg_operator_oprname_l_r_n_index",
    "column_name": "oprleft",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_operator",
    "index_name": "pg_operator_oprname_l_r_n_index",
    "column_name": "oprname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_operator",
    "index_name": "pg_operator_oprname_l_r_n_index",
    "column_name": "oprnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opfamily",
    "index_name": "pg_opfamily_am_name_nsp_index",
    "column_name": "opfmethod",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opfamily",
    "index_name": "pg_opfamily_am_name_nsp_index",
    "column_name": "opfname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opfamily",
    "index_name": "pg_opfamily_am_name_nsp_index",
    "column_name": "opfnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_opfamily",
    "index_name": "pg_opfamily_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_parameter_acl",
    "index_name": "pg_parameter_acl_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_parameter_acl",
    "index_name": "pg_parameter_acl_parname_index",
    "column_name": "parname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_partitioned_table",
    "index_name": "pg_partitioned_table_partrelid_index",
    "column_name": "partrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_policy",
    "index_name": "pg_policy_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_policy",
    "index_name": "pg_policy_polrelid_polname_index",
    "column_name": "polrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_policy",
    "index_name": "pg_policy_polrelid_polname_index",
    "column_name": "polname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_proc",
    "index_name": "pg_proc_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_proc",
    "index_name": "pg_proc_proname_args_nsp_index",
    "column_name": "proargtypes",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_proc",
    "index_name": "pg_proc_proname_args_nsp_index",
    "column_name": "proname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_proc",
    "index_name": "pg_proc_proname_args_nsp_index",
    "column_name": "pronamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_publication",
    "index_name": "pg_publication_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_publication",
    "index_name": "pg_publication_pubname_index",
    "column_name": "pubname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_publication_namespace",
    "index_name": "pg_publication_namespace_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_publication_namespace",
    "index_name": "pg_publication_namespace_pnnspid_pnpubid_index",
    "column_name": "pnpubid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_publication_namespace",
    "index_name": "pg_publication_namespace_pnnspid_pnpubid_index",
    "column_name": "pnnspid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_publication_rel",
    "index_name": "pg_publication_rel_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_publication_rel",
    "index_name": "pg_publication_rel_prpubid_index",
    "column_name": "prpubid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_publication_rel",
    "index_name": "pg_publication_rel_prrelid_prpubid_index",
    "column_name": "prpubid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_publication_rel",
    "index_name": "pg_publication_rel_prrelid_prpubid_index",
    "column_name": "prrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_range",
    "index_name": "pg_range_rngmultitypid_index",
    "column_name": "rngmultitypid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_range",
    "index_name": "pg_range_rngtypid_index",
    "column_name": "rngtypid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_replication_origin",
    "index_name": "pg_replication_origin_roiident_index",
    "column_name": "roident",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_replication_origin",
    "index_name": "pg_replication_origin_roname_index",
    "column_name": "roname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_rewrite",
    "index_name": "pg_rewrite_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_rewrite",
    "index_name": "pg_rewrite_rel_rulename_index",
    "column_name": "ev_class",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_rewrite",
    "index_name": "pg_rewrite_rel_rulename_index",
    "column_name": "rulename",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_seclabel",
    "index_name": "pg_seclabel_object_index",
    "column_name": "classoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_seclabel",
    "index_name": "pg_seclabel_object_index",
    "column_name": "objoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_seclabel",
    "index_name": "pg_seclabel_object_index",
    "column_name": "objsubid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_seclabel",
    "index_name": "pg_seclabel_object_index",
    "column_name": "provider",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_sequence",
    "index_name": "pg_sequence_seqrelid_index",
    "column_name": "seqrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_depender_index",
    "column_name": "classid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_depender_index",
    "column_name": "objid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_depender_index",
    "column_name": "objsubid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_depender_index",
    "column_name": "dbid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_reference_index",
    "column_name": "refclassid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdepend",
    "index_name": "pg_shdepend_reference_index",
    "column_name": "refobjid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_shdescription",
    "index_name": "pg_shdescription_o_c_index",
    "column_name": "classoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_shdescription",
    "index_name": "pg_shdescription_o_c_index",
    "column_name": "objoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_shseclabel",
    "index_name": "pg_shseclabel_object_index",
    "column_name": "objoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_shseclabel",
    "index_name": "pg_shseclabel_object_index",
    "column_name": "classoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_shseclabel",
    "index_name": "pg_shseclabel_object_index",
    "column_name": "provider",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic",
    "index_name": "pg_statistic_relid_att_inh_index",
    "column_name": "stainherit",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic",
    "index_name": "pg_statistic_relid_att_inh_index",
    "column_name": "starelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic",
    "index_name": "pg_statistic_relid_att_inh_index",
    "column_name": "staattnum",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic_ext",
    "index_name": "pg_statistic_ext_name_index",
    "column_name": "stxname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_statistic_ext",
    "index_name": "pg_statistic_ext_name_index",
    "column_name": "stxnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_statistic_ext",
    "index_name": "pg_statistic_ext_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic_ext",
    "index_name": "pg_statistic_ext_relid_index",
    "column_name": "stxrelid",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_statistic_ext_data",
    "index_name": "pg_statistic_ext_data_stxoid_inh_index",
    "column_name": "stxdinherit",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_statistic_ext_data",
    "index_name": "pg_statistic_ext_data_stxoid_inh_index",
    "column_name": "stxoid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_subscription",
    "index_name": "pg_subscription_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_subscription",
    "index_name": "pg_subscription_subname_index",
    "column_name": "subname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_subscription",
    "index_name": "pg_subscription_subname_index",
    "column_name": "subdbid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_subscription_rel",
    "index_name": "pg_subscription_rel_srrelid_srsubid_index",
    "column_name": "srrelid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_subscription_rel",
    "index_name": "pg_subscription_rel_srrelid_srsubid_index",
    "column_name": "srsubid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_tablespace",
    "index_name": "pg_tablespace_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_tablespace",
    "index_name": "pg_tablespace_spcname_index",
    "column_name": "spcname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_transform",
    "index_name": "pg_transform_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_transform",
    "index_name": "pg_transform_type_lang_index",
    "column_name": "trftype",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_transform",
    "index_name": "pg_transform_type_lang_index",
    "column_name": "trflang",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_trigger",
    "index_name": "pg_trigger_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_trigger",
    "index_name": "pg_trigger_tgconstraint_index",
    "column_name": "tgconstraint",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "pg_trigger",
    "index_name": "pg_trigger_tgrelid_tgname_index",
    "column_name": "tgrelid",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_trigger",
    "index_name": "pg_trigger_tgrelid_tgname_index",
    "column_name": "tgname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_config",
    "index_name": "pg_ts_config_cfgname_index",
    "column_name": "cfgnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_config",
    "index_name": "pg_ts_config_cfgname_index",
    "column_name": "cfgname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_config",
    "index_name": "pg_ts_config_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_config_map",
    "index_name": "pg_ts_config_map_index",
    "column_name": "mapseqno",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_config_map",
    "index_name": "pg_ts_config_map_index",
    "column_name": "maptokentype",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_config_map",
    "index_name": "pg_ts_config_map_index",
    "column_name": "mapcfg",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_dict",
    "index_name": "pg_ts_dict_dictname_index",
    "column_name": "dictname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_dict",
    "index_name": "pg_ts_dict_dictname_index",
    "column_name": "dictnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_dict",
    "index_name": "pg_ts_dict_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_parser",
    "index_name": "pg_ts_parser_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_parser",
    "index_name": "pg_ts_parser_prsname_index",
    "column_name": "prsname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_parser",
    "index_name": "pg_ts_parser_prsname_index",
    "column_name": "prsnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_template",
    "index_name": "pg_ts_template_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_ts_template",
    "index_name": "pg_ts_template_tmplname_index",
    "column_name": "tmplnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_ts_template",
    "index_name": "pg_ts_template_tmplname_index",
    "column_name": "tmplname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_type",
    "index_name": "pg_type_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_type",
    "index_name": "pg_type_typname_nsp_index",
    "column_name": "typnamespace",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_type",
    "index_name": "pg_type_typname_nsp_index",
    "column_name": "typname",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_user_mapping",
    "index_name": "pg_user_mapping_oid_index",
    "column_name": "oid",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "pg_user_mapping",
    "index_name": "pg_user_mapping_user_server_index",
    "column_name": "umserver",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "pg_user_mapping",
    "index_name": "pg_user_mapping_user_server_index",
    "column_name": "umuser",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "prefixes",
    "index_name": "idx_prefixes_lower_name",
    "column_name": "bucket_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "prefixes",
    "index_name": "idx_prefixes_lower_name",
    "column_name": "level",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "prefixes",
    "index_name": "prefixes_pkey",
    "column_name": "level",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "prefixes",
    "index_name": "prefixes_pkey",
    "column_name": "name",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "prefixes",
    "index_name": "prefixes_pkey",
    "column_name": "bucket_id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "products",
    "index_name": "products_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_instance_id_idx",
    "column_name": "instance_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_instance_id_user_id_idx",
    "column_name": "instance_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_instance_id_user_id_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_parent_idx",
    "column_name": "parent",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_session_id_revoked_idx",
    "column_name": "session_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_session_id_revoked_idx",
    "column_name": "revoked",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_token_unique",
    "column_name": "token",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "refresh_tokens",
    "index_name": "refresh_tokens_updated_at_idx",
    "column_name": "updated_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "s3_multipart_uploads",
    "index_name": "idx_multipart_uploads_list",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "s3_multipart_uploads",
    "index_name": "idx_multipart_uploads_list",
    "column_name": "key",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "s3_multipart_uploads",
    "index_name": "idx_multipart_uploads_list",
    "column_name": "bucket_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "s3_multipart_uploads",
    "index_name": "s3_multipart_uploads_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "s3_multipart_uploads_parts",
    "index_name": "s3_multipart_uploads_parts_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "saml_providers",
    "index_name": "saml_providers_entity_id_key",
    "column_name": "entity_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "saml_providers",
    "index_name": "saml_providers_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "saml_providers",
    "index_name": "saml_providers_sso_provider_id_idx",
    "column_name": "sso_provider_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "saml_relay_states",
    "index_name": "saml_relay_states_created_at_idx",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "saml_relay_states",
    "index_name": "saml_relay_states_for_email_idx",
    "column_name": "for_email",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "saml_relay_states",
    "index_name": "saml_relay_states_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "saml_relay_states",
    "index_name": "saml_relay_states_sso_provider_id_idx",
    "column_name": "sso_provider_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "schema_migrations",
    "index_name": "schema_migrations_pkey",
    "column_name": "version",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "schema_migrations",
    "index_name": "schema_migrations_pkey",
    "column_name": "version",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "secrets",
    "index_name": "secrets_name_idx",
    "column_name": "name",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "secrets",
    "index_name": "secrets_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "sessions",
    "index_name": "sessions_not_after_idx",
    "column_name": "not_after",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sessions",
    "index_name": "sessions_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "sessions",
    "index_name": "sessions_user_id_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sessions",
    "index_name": "user_id_created_at_idx",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sessions",
    "index_name": "user_id_created_at_idx",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sso_domains",
    "index_name": "sso_domains_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "sso_domains",
    "index_name": "sso_domains_sso_provider_id_idx",
    "column_name": "sso_provider_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "sso_providers",
    "index_name": "sso_providers_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "sso_providers",
    "index_name": "sso_providers_resource_id_pattern_idx",
    "column_name": "resource_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "star_payots",
    "index_name": "star_payots_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "stock_movements",
    "index_name": "idx_stock_movements_created_at",
    "column_name": "created_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "stock_movements",
    "index_name": "idx_stock_movements_created_by",
    "column_name": "created_by",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "stock_movements",
    "index_name": "idx_stock_movements_product_id",
    "column_name": "product_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "stock_movements",
    "index_name": "stock_movements_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "subscription",
    "index_name": "ix_realtime_subscription_entity",
    "column_name": "entity",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "subscription",
    "index_name": "pk_subscription",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "subscription",
    "index_name": "subscription_subscription_id_entity_filters_key",
    "column_name": "filters",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription",
    "index_name": "subscription_subscription_id_entity_filters_key",
    "column_name": "subscription_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription",
    "index_name": "subscription_subscription_id_entity_filters_key",
    "column_name": "entity",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "idx_subscription_distributions_payment",
    "column_name": "subscription_payment_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "idx_subscription_distributions_recipient",
    "column_name": "recipient_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "idx_subscription_distributions_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "subscription_payment_distribu_subscription_payment_id_recip_key",
    "column_name": "subscription_payment_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "subscription_payment_distribu_subscription_payment_id_recip_key",
    "column_name": "recipient_id",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "subscription_payment_distribu_subscription_payment_id_recip_key",
    "column_name": "distribution_type",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "subscription_payment_distributions",
    "index_name": "subscription_payment_distributions_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "subscription_payments",
    "index_name": "subscription_payments_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "user_turnover_audit",
    "index_name": "user_turnover_audit_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "user_turnover_current",
    "index_name": "idx_user_turnover_current_bonus",
    "column_name": "bonus_percent",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "user_turnover_current",
    "index_name": "user_turnover_current_pkey",
    "column_name": "user_id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "users",
    "index_name": "confirmation_token_idx",
    "column_name": "confirmation_token",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "email_change_token_current_idx",
    "column_name": "email_change_token_current",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "email_change_token_new_idx",
    "column_name": "email_change_token_new",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "idx_users_parent_id",
    "column_name": "parent_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "idx_users_role_admin",
    "column_name": "id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "idx_users_role_admin",
    "column_name": "role",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "reauthentication_token_idx",
    "column_name": "reauthentication_token",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "recovery_token_idx",
    "column_name": "recovery_token",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_email_partial_key",
    "column_name": "email",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_instance_id_email_idx",
    "column_name": "instance_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_instance_id_idx",
    "column_name": "instance_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_is_anonymous_idx",
    "column_name": "is_anonymous",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_phone_key",
    "column_name": "phone",
    "is_unique": true,
    "is_primary": false
  },
  {
    "table_name": "users",
    "index_name": "users_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "users",
    "index_name": "users_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_dates",
    "column_name": "requested_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_dates",
    "column_name": "completed_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_pending_old",
    "column_name": "requested_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_requests_requested_at",
    "column_name": "requested_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_requests_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_requests_user",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_requests_user",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_status_date",
    "column_name": "requested_at",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_status_date",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_user_status",
    "column_name": "status",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "idx_withdrawal_user_status",
    "column_name": "user_id",
    "is_unique": false,
    "is_primary": false
  },
  {
    "table_name": "withdrawal_requests",
    "index_name": "withdrawal_requests_pkey",
    "column_name": "id",
    "is_unique": true,
    "is_primary": true
  }
]