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
    "events": "INSERT, DELETE, UPDATE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_cart_timestamp()"
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
    "table_name": "products",
    "trigger_name": "track_product_stock_changes",
    "events": "INSERT, UPDATE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION track_stock_changes()"
  },
  {
    "schema": "public",
    "table_name": "promo_codes",
    "trigger_name": "update_promo_codes_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_promo_codes_updated_at()"
  },
  {
    "schema": "public",
    "table_name": "team_purchase_bonuses",
    "trigger_name": "update_team_purchase_bonuses_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "schema": "public",
    "table_name": "team_purchase_members",
    "trigger_name": "update_team_purchase_members_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "schema": "public",
    "table_name": "team_purchase_orders",
    "trigger_name": "update_member_contribution_trigger",
    "events": "UPDATE, INSERT, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_member_contribution()"
  },
  {
    "schema": "public",
    "table_name": "team_purchase_orders",
    "trigger_name": "update_team_purchase_after_order",
    "events": "UPDATE, INSERT, DELETE",
    "timing": "AFTER",
    "definition": "EXECUTE FUNCTION update_team_purchase_totals()"
  },
  {
    "schema": "public",
    "table_name": "team_purchases",
    "trigger_name": "trigger_set_invite_code",
    "events": "INSERT",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION set_invite_code()"
  },
  {
    "schema": "public",
    "table_name": "team_purchases",
    "trigger_name": "update_team_purchases_updated_at",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_updated_at_column()"
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
    "table_name": "users",
    "trigger_name": "update_user_personal_level",
    "events": "UPDATE",
    "timing": "BEFORE",
    "definition": "EXECUTE FUNCTION update_personal_level()"
  }
]