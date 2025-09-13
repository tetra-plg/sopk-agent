-- =====================================================
-- Données de test pour développement
-- =====================================================

-- Créer un utilisateur de test dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440000',
  'authenticated',
  'authenticated',
  'test@sopk-companion.com',
  '$2a$10$EH5Q/SEHK6FzNGrEzF1E5O0sPBf4FQfKfq4RHOKrGr4Vf3j4hLlOy',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User", "prenom": "Test"}',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insérer quelques sessions de test
INSERT INTO breathing_sessions (
  user_id,
  technique,
  duration_seconds,
  completed,
  stress_before,
  stress_after,
  feeling_after,
  created_at
) VALUES
-- Session complétée - cohérence cardiaque
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 300, true, 8, 4, 'calmer', NOW() - INTERVAL '2 hours'),

-- Session complétée - respiration carrée
('550e8400-e29b-41d4-a716-446655440000', 'box', 240, true, 7, 3, 'better', NOW() - INTERVAL '1 day'),

-- Session incomplète
('550e8400-e29b-41d4-a716-446655440000', 'quick', 120, false, 6, NULL, NULL, NOW() - INTERVAL '3 hours'),

-- Session récente
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 360, true, 9, 5, 'calmer', NOW() - INTERVAL '30 minutes'),

-- Session d'hier
('550e8400-e29b-41d4-a716-446655440000', 'box', 180, true, 5, 2, 'better', NOW() - INTERVAL '1 day' - INTERVAL '2 hours');

-- Insérer une identité pour l'utilisateur
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"sub": "550e8400-e29b-41d4-a716-446655440000", "email": "test@sopk-companion.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider_id, provider) DO NOTHING;