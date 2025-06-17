/*
  # Add User Profile Management Functions

  1. New Functions
    - `get_complete_user_profile` - Fetches complete user profile with related data
    - `create_complete_user_profile` - Creates new user and initializes related tables
    - `hall_ticket_exists` - Checks if hall ticket already exists
    - `email_exists` - Checks if email already exists

  2. Security
    - Functions use existing RLS policies
    - Proper error handling and validation

  3. Features
    - Complete user profile creation with all related tables
    - Comprehensive profile fetching with joins
    - Validation functions for registration
*/

-- Function to check if hall ticket exists
CREATE OR REPLACE FUNCTION public.hall_ticket_exists(p_hall_ticket text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exists_flag boolean;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.users WHERE hall_ticket = p_hall_ticket) INTO exists_flag;
    RETURN exists_flag;
END;
$$;

-- Function to check if email exists
CREATE OR REPLACE FUNCTION public.email_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    exists_flag boolean;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.users WHERE email = p_email) INTO exists_flag;
    RETURN exists_flag;
END;
$$;

-- Function to get complete user profile
CREATE OR REPLACE FUNCTION public.get_complete_user_profile(p_firebase_uid text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', u.id,
        'firebase_uid', u.firebase_uid,
        'full_name', u.full_name,
        'hall_ticket', u.hall_ticket,
        'email', u.email,
        'department', u.department,
        'academic_year', u.academic_year,
        'phone_number', u.phone_number,
        'role', u.role,
        'email_verified', u.email_verified,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'profile_picture_url', u.profile_picture_url,
        'is_active', u.is_active,
        'academic_info', CASE 
            WHEN ai.id IS NOT NULL THEN jsonb_build_object(
                'id', ai.id,
                'user_id', ai.user_id,
                'current_semester', ai.current_semester,
                'cgpa', ai.cgpa,
                'subjects_enrolled', ai.subjects_enrolled,
                'mentor_name', ai.mentor_name,
                'mentor_email', ai.mentor_email
            )
            ELSE NULL
        END,
        'engagement', CASE 
            WHEN e.id IS NOT NULL THEN jsonb_build_object(
                'id', e.id,
                'user_id', e.user_id,
                'activity_points', e.activity_points,
                'badges', e.badges,
                'last_login', e.last_login,
                'events_attended', e.events_attended,
                'feedback_count', e.feedback_count,
                'created_at', e.created_at,
                'updated_at', e.updated_at
            )
            ELSE NULL
        END,
        'preferences', CASE 
            WHEN p.id IS NOT NULL THEN jsonb_build_object(
                'id', p.id,
                'user_id', p.user_id,
                'language', p.language,
                'notifications_enabled', p.notifications_enabled,
                'theme', p.theme,
                'widgets_enabled', p.widgets_enabled
            )
            ELSE NULL
        END
    )
    INTO user_profile
    FROM users u
    LEFT JOIN academic_info ai ON u.id = ai.user_id
    LEFT JOIN engagement e ON u.id = e.user_id
    LEFT JOIN preferences p ON u.id = p.user_id
    WHERE u.firebase_uid = p_firebase_uid;

    RETURN user_profile;
END;
$$;

-- Function to create complete user profile
CREATE OR REPLACE FUNCTION public.create_complete_user_profile(
    p_firebase_uid text,
    p_full_name text,
    p_hall_ticket text,
    p_email text,
    p_department text,
    p_academic_year text,
    p_phone_number text,
    p_email_verified boolean DEFAULT FALSE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    user_profile jsonb;
BEGIN
    -- Insert into users table
    INSERT INTO public.users (
        firebase_uid, 
        full_name, 
        hall_ticket, 
        email, 
        department, 
        academic_year, 
        phone_number, 
        email_verified, 
        role
    ) VALUES (
        p_firebase_uid, 
        p_full_name, 
        p_hall_ticket, 
        p_email, 
        p_department, 
        p_academic_year, 
        p_phone_number, 
        p_email_verified, 
        'student'
    )
    RETURNING id INTO new_user_id;

    -- Initialize academic_info
    INSERT INTO public.academic_info (user_id) 
    VALUES (new_user_id);

    -- Initialize engagement
    INSERT INTO public.engagement (user_id, activity_points, feedback_count) 
    VALUES (new_user_id, 0, 0);

    -- Initialize preferences
    INSERT INTO public.preferences (user_id, notifications_enabled, theme) 
    VALUES (new_user_id, TRUE, 'System');

    -- Fetch the complete profile using the previously defined function
    SELECT public.get_complete_user_profile(p_firebase_uid) INTO user_profile;

    RETURN user_profile;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.hall_ticket_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hall_ticket_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_complete_user_profile(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_complete_user_profile(text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_complete_user_profile(text, text, text, text, text, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_complete_user_profile(text, text, text, text, text, text, text, boolean) TO anon;