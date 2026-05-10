-- =====================================================
-- SEED DATA - SEHATKU
-- Production-safe UUID revision
-- =====================================================

-- =====================================================
-- 1. CATEGORIES
-- =====================================================

INSERT INTO public.categories (id, name, description)
VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Obat Bebas',
  'Dapat dibeli tanpa resep dokter.'
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Obat Keras',
  'Harus dibeli dengan resep dokter.'
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Vitamin & Suplemen',
  'Untuk menjaga daya tahan tubuh.'
),
(
  'a4444444-4444-4444-4444-444444444444',
  'Alat Kesehatan',
  'Alat penunjang kesehatan.'
);

-- =====================================================
-- 2. MEDICINES
-- =====================================================

INSERT INTO public.medicines (
  id,
  category_id,
  name,
  description,
  price,
  stock,
  requires_prescription,
  image_url
)
VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Paracetamol 500mg',
  'Obat penurun panas dan pereda nyeri.',
  5000,
  100,
  false,
  'https://example.com/paracetamol.jpg'
),
(
  'b2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'Amoxicillin 500mg',
  'Antibiotik untuk infeksi bakteri.',
  15000,
  50,
  true,
  'https://example.com/amoxicillin.jpg'
),
(
  'b3333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  'Vitamin C 1000mg',
  'Suplemen vitamin C.',
  25000,
  200,
  false,
  'https://example.com/vitc.jpg'
),
(
  'b4444444-4444-4444-4444-444444444444',
  'a1111111-1111-1111-1111-111111111111',
  'Antasida Doen',
  'Obat maag dan asam lambung.',
  8000,
  150,
  false,
  'https://example.com/antasida.jpg'
);

-- =====================================================
-- 3. AUTH USERS
-- Password: password123
-- =====================================================

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'c1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@sehatku.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'c2222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'pharmacist@sehatku.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Apoteker Budi"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'c3333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'customer@sehatku.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Customer Andi"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- =====================================================
-- 4. UPDATE USER ROLES
-- =====================================================

UPDATE public.profiles
SET role = 'admin'
WHERE id = 'c1111111-1111-1111-1111-111111111111';

UPDATE public.profiles
SET role = 'pharmacist'
WHERE id = 'c2222222-2222-2222-2222-222222222222';

-- =====================================================
-- 5. CART
-- =====================================================

INSERT INTO public.carts (
  id,
  user_id
)
VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333'
);

-- =====================================================
-- 6. CART ITEMS
-- =====================================================

INSERT INTO public.cart_items (
  cart_id,
  medicine_id,
  quantity
)
VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  2
),
(
  'd1111111-1111-1111-1111-111111111111',
  'b3333333-3333-3333-3333-333333333333',
  1
);

-- =====================================================
-- 7. PRESCRIPTIONS
-- =====================================================

INSERT INTO public.prescriptions (
  id,
  user_id,
  image_url,
  status,
  pharmacist_notes
)
VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333',
  'https://example.com/resep1.jpg',
  'pending',
  NULL
);

-- =====================================================
-- 8. ORDERS
-- =====================================================

INSERT INTO public.orders (
  id,
  user_id,
  prescription_id,
  status,
  total_amount,
  shipping_address
)
VALUES
(
  'f1111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333',
  'e1111111-1111-1111-1111-111111111111',
  'pending',
  40000,
  'Jl. Sehat Selalu No. 123, Jakarta'
);

-- =====================================================
-- 9. ORDER ITEMS
-- =====================================================

INSERT INTO public.order_items (
  order_id,
  medicine_id,
  quantity,
  price_at_time
)
VALUES
(
  'f1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  2,
  5000
),
(
  'f1111111-1111-1111-1111-111111111111',
  'b3333333-3333-3333-3333-333333333333',
  1,
  25000
);

-- =====================================================
-- 10. PAYMENTS
-- =====================================================

INSERT INTO public.payments (
  id,
  order_id,
  status,
  payment_method,
  amount
)
VALUES
(
  'ab111111-1111-1111-1111-111111111111',
  'f1111111-1111-1111-1111-111111111111',
  'pending',
  'bank_transfer',
  40000
);

-- =====================================================
-- 11. NOTIFICATIONS
-- =====================================================

INSERT INTO public.notifications (
  id,
  user_id,
  title,
  message
)
VALUES
(
  'aa111111-1111-1111-1111-111111111111',
  'c3333333-3333-3333-3333-333333333333',
  'Selamat Datang!',
  'Selamat datang di Apotek Digital SehatKu.'
);
