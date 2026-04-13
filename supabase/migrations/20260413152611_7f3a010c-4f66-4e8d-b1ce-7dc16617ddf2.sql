
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_user_id_fkey;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE public.answers DROP CONSTRAINT IF EXISTS answers_user_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_from_user_id_fkey;
ALTER TABLE public.community_members DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;
