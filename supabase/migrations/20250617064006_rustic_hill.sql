/*
  # Fix User Profile System

  1. Database Functions
    - Create function to get current user ID from Firebase UID
    - Create function to get user rank for leaderboard
    
  2. Row Level Security Policies
    - Enable RLS on all tables
    - Add policies for user data access
    
  3. Triggers and Functions
    - Auto-create related records when user is created
    - Update timestamps automatically
    
  4. Indexes
    - Add performance indexes for common queries
*/

-- Create function to get current user ID from Firebase UID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the Firebase UID from the JWT token
  SELECT id INTO user_id
  FROM users
  WHERE firebase_uid = auth.jwt() ->> 'sub';
  
  RETURN user_id;
END;
$$;

-- Create function to get user rank
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id uuid)
RETURNS TABLE(rank bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(e.activity_points, 0) DESC) as rank
  FROM users u
  LEFT JOIN engagement e ON u.id = e.user_id
  WHERE u.id = p_user_id;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (firebase_uid = (auth.jwt() ->> 'sub'));

CREATE POLICY "Allow user creation during registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = (auth.jwt() ->> 'sub'));

-- Academic info policies
CREATE POLICY "Users can read own academic info"
  ON academic_info
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own academic info"
  ON academic_info
  FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Allow academic info creation"
  ON academic_info
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- Engagement policies
CREATE POLICY "Users can read own engagement data"
  ON engagement
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can read all engagement for leaderboard"
  ON engagement
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow engagement creation"
  ON engagement
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Allow engagement updates"
  ON engagement
  FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id());

-- Preferences policies
CREATE POLICY "Users can read own preferences"
  ON preferences
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own preferences"
  ON preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Allow preferences creation"
  ON preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- Documents policies
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- Activity points history policies
CREATE POLICY "Users can read own points history"
  ON activity_points_history
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Allow points history creation"
  ON activity_points_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Staff can add points for any user

-- Club policies
CREATE POLICY "Anyone can read clubs"
  ON clubs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create clubs"
  ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = get_current_user_id());

CREATE POLICY "Club creators can update their clubs"
  ON clubs
  FOR UPDATE
  TO authenticated
  USING (created_by = get_current_user_id());

-- Club memberships policies
CREATE POLICY "Users can read club memberships"
  ON club_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join clubs"
  ON club_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can leave clubs"
  ON club_memberships
  FOR DELETE
  TO authenticated
  USING (user_id = get_current_user_id());

-- Club roles policies
CREATE POLICY "Users can read club roles"
  ON club_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Club admins can manage roles"
  ON club_roles
  FOR ALL
  TO authenticated
  USING (true); -- Will be refined based on club admin status

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Club admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Will be refined based on club admin status

-- Events policies
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Campus orders policies
CREATE POLICY "Users can read own orders"
  ON campus_orders
  FOR SELECT
  TO authenticated
  USING (student_id = get_current_user_id());

CREATE POLICY "Users can create orders"
  ON campus_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = get_current_user_id());

CREATE POLICY "Vendors can read their orders"
  ON campus_orders
  FOR SELECT
  TO authenticated
  USING (true); -- Will be refined for vendor access

CREATE POLICY "Vendors can update order status"
  ON campus_orders
  FOR UPDATE
  TO authenticated
  USING (true); -- Will be refined for vendor access

-- Campus order items policies
CREATE POLICY "Users can read order items for their orders"
  ON campus_order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM campus_orders WHERE student_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can create order items"
  ON campus_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM campus_orders WHERE student_id = get_current_user_id()
    )
  );

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Vendors policies
CREATE POLICY "Anyone can read approved vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Store categories policies
CREATE POLICY "Anyone can read active categories"
  ON store_categories
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Create trigger function to auto-create related records
CREATE OR REPLACE FUNCTION create_user_related_records()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create engagement record
  INSERT INTO engagement (user_id, activity_points, badges, events_attended, feedback_count)
  VALUES (NEW.id, 0, '[]'::jsonb, '{}'::text[], 0);
  
  -- Create academic_info record
  INSERT INTO academic_info (user_id)
  VALUES (NEW.id);
  
  -- Create preferences record
  INSERT INTO preferences (user_id, theme, notifications_enabled, language)
  VALUES (NEW.id, 'System', true, 'English');
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create related records when user is created
DROP TRIGGER IF EXISTS create_user_related_records_trigger ON users;
CREATE TRIGGER create_user_related_records_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_related_records();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_engagement_updated_at ON engagement;
CREATE TRIGGER update_engagement_updated_at
  BEFORE UPDATE ON engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON preferences;
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_hall_ticket ON users(hall_ticket);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_activity_points ON engagement(activity_points DESC);
CREATE INDEX IF NOT EXISTS idx_academic_info_user_id ON academic_info(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_history_user_id ON activity_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_history_created_at ON activity_points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_roles_user_id ON club_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_club_roles_club_id ON club_roles(club_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_orders_student_id ON campus_orders(student_id);
CREATE INDEX IF NOT EXISTS idx_campus_orders_vendor_id ON campus_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_vendors_firebase_uid ON vendors(firebase_uid);

-- Insert default store categories if they don't exist
INSERT INTO store_categories (name, icon, description, display_order, active) VALUES
('Food & Beverages', '🍕', 'Delicious meals, snacks, and drinks', 1, true),
('Stationery', '📝', 'Notebooks, pens, and study materials', 2, true),
('Electronics', '💻', 'Gadgets, accessories, and tech items', 3, true),
('Books', '📚', 'Textbooks, novels, and reference materials', 4, true),
('Clothing', '👕', 'Apparel and accessories', 5, true),
('Health & Beauty', '💄', 'Personal care and wellness products', 6, true)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;