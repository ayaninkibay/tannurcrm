[
  {
    "schema": "public",
    "table_name": "bonus_levels",
    "trigger_name": "update_bonus_levels_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "schema": "public",
    "table_name": "cart_items",
    "trigger_name": "update_cart_on_item_change",
    "events": "INSERT, UPDATE, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_cart_timestamp()"
  },
  {
    "schema": "public",
    "table_name": "course_lessons",
    "trigger_name": "update_course_lessons_count_trigger",
    "events": "INSERT, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_course_lessons_count()"
  },
  {
    "schema": "public",
    "table_name": "course_lessons",
    "trigger_name": "update_course_lessons_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "schema": "public",
    "table_name": "courses",
    "trigger_name": "generate_course_slug_trigger",
    "events": "UPDATE, INSERT",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION generate_course_slug()"
  },
  {
    "schema": "public",
    "table_name": "courses",
    "trigger_name": "update_courses_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "schema": "public",
    "table_name": "distributors",
    "trigger_name": "trigger_distributors_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_distributors_updated_at()"
  },
  {
    "schema": "public",
    "table_name": "document_categories",
    "trigger_name": "trigger_document_categories_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_documents_updated_at()"
  },
  {
    "schema": "public",
    "table_name": "gifts",
    "trigger_name": "update_gifts_updated_at_trigger",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_gifts_updated_at()"
  },
  {
    "schema": "public",
    "table_name": "order_items",
    "trigger_name": "calculate_order_item_total_trigger",
    "events": "INSERT, UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION calculate_order_item_total()"
  },
  {
    "schema": "public",
    "table_name": "orders",
    "trigger_name": "trigger_orders_turnover",
    "events": "UPDATE, INSERT, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION trigger_update_turnover_from_orders()"
  },
  {
    "schema": "public",
    "table_name": "orders",
    "trigger_name": "update_turnover_on_order",
    "events": "UPDATE, INSERT",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_user_turnover_on_order()"
  },
  {
    "schema": "public",
    "table_name": "products",
    "trigger_name": "track_product_stock_changes",
    "events": "UPDATE, INSERT",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION track_stock_changes()"
  },
  {
    "schema": "public",
    "table_name": "subscription_payments",
    "trigger_name": "subscription_payment_bonus_trigger",
    "events": "UPDATE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION trigger_subscription_payment_bonus()"
  },
  {
    "schema": "public",
    "table_name": "user_turnover_audit",
    "trigger_name": "protect_audit_table_trigger",
    "events": "INSERT, UPDATE, DELETE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION protect_audit_table()"
  },
  {
    "schema": "public",
    "table_name": "user_turnover_current",
    "trigger_name": "audit_turnover",
    "events": "UPDATE, INSERT, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION audit_turnover_changes()"
  },
  {
    "schema": "public",
    "table_name": "user_turnover_current",
    "trigger_name": "protect_turnover_table_trigger",
    "events": "UPDATE, DELETE, INSERT",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION protect_turnover_table()"
  },
  {
    "schema": "public",
    "table_name": "users",
    "trigger_name": "trigger_set_referral_code",
    "events": "INSERT",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION set_referral_code()"
  },
  {
    "schema": "public",
    "table_name": "withdrawal_requests",
    "trigger_name": "withdrawal_status_change_trigger",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION log_withdrawal_status_change()"
  }
]