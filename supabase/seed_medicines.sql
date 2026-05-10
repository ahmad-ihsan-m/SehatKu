-- Realistic Medicine Seed Data for SehatKu (v2 - Local Images)
-- Includes categories and 30+ medicines with local assets and realistic variations

-- 1. Ensure Categories Exist
INSERT INTO public.categories (id, name, description) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Analgesik', 'Obat pereda nyeri dan penurun demam'),
  ('c2222222-2222-2222-2222-222222222222', 'Antibiotik', 'Obat untuk infeksi bakteri (Memerlukan Resep)'),
  ('c3333333-3333-3333-3333-333333333333', 'Vitamin & Suplemen', 'Multivitamin dan suplemen kesehatan'),
  ('c4444444-4444-4444-4444-444444444444', 'Obat Lambung', 'Antasida dan penghambat asam lambung'),
  ('c5555555-5555-5555-5555-555555555555', 'Obat Batuk & Flu', 'Pereda gejala batuk, pilek, dan flu'),
  ('c6666666-6666-6666-6666-666666666666', 'Diabetes', 'Manajemen gula darah (Memerlukan Resep)'),
  ('c7777777-7777-7777-7777-777711111111', 'Hipertensi', 'Pengontrol tekanan darah tinggi (Memerlukan Resep)'),
  ('c8888888-8888-8888-8888-888811111111', 'Herbal', 'Obat-obatan berbahan dasar alami'),
  ('c9999999-9999-9999-9999-999911111111', 'Anak', 'Obat khusus bayi dan anak-anak'),
  ('c0000000-0000-0000-0000-000011111111', 'Kulit & Alergi', 'Salep, krim, dan obat antihistamin')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Clear old dummy data to avoid confusion (Optional, based on requirement "aman dijalankan berkali-kali")
-- DELETE FROM public.medicines WHERE image_url LIKE '%example.com%';

-- 2. Seed Medicines
INSERT INTO public.medicines (id, category_id, name, description, price, stock, requires_prescription, dosage, manufacturer, is_active, image_url) VALUES
  -- ANALGESIK (Pill Box)
  (uuid_generate_v4(), 'c1111111-1111-1111-1111-111111111111', 'Panadol Extra', 'Meredakan sakit kepala dan sakit gigi yang mengganggu.', 15500, 150, false, '500mg Paracetamol, 65mg Caffeine', 'GSK Consumer Healthcare', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c1111111-1111-1111-1111-111111111111', 'Asam Mefenamat 500mg', 'Meredakan nyeri ringan hingga sedang seperti sakit gigi dan nyeri haid.', 8000, 8, true, '500mg Asam Mefenamat', 'Bernofarm', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c1111111-1111-1111-1111-111111111111', 'Cataflam 50mg', 'Obat anti-inflamasi non-steroid untuk nyeri sendi dan tulang.', 75000, 25, true, '50mg Kalium Diklofenak', 'Novartis', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c1111111-1111-1111-1111-111111111111', 'Paracetamol 500mg Generic', 'Obat generik penurun panas dan pereda nyeri.', 2500, 500, false, '500mg Paracetamol', 'Kimia Farma', true, '/images/medicines/pill_box.png'),

  -- ANTIBIOTIK (Pill Box)
  (uuid_generate_v4(), 'c2222222-2222-2222-2222-222222222222', 'Amoxicillin 500mg', 'Antibiotik spektrum luas untuk infeksi bakteri.', 12000, 100, true, '500mg Amoxicillin', 'Kimia Farma', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c2222222-2222-2222-2222-222222222222', 'Cefadroxil 500mg', 'Antibiotik sefalosporin untuk infeksi saluran kemih dan kulit.', 25000, 5, true, '500mg Cefadroxil', 'Dexa Medica', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c2222222-2222-2222-2222-222222222222', 'Azithromycin 500mg', 'Antibiotik untuk infeksi saluran pernapasan.', 65000, 0, true, '500mg Azithromycin', 'Indofarma', true, '/images/medicines/pill_box.png'),

  -- VITAMIN (Supplement Bottle)
  (uuid_generate_v4(), 'c3333333-3333-3333-3333-333333333333', 'Enervon-C Multivitamin', 'Suplemen makanan untuk menjaga daya tahan tubuh.', 45000, 200, false, 'Vitamin C 500mg, Vitamin B Kompleks', 'Medifarma', true, '/images/medicines/supplement_bottle.png'),
  (uuid_generate_v4(), 'c3333333-3333-3333-3333-333333333333', 'Imboost Force', 'Membantu memperbaiki sistem imun tubuh.', 85000, 15, false, 'Echinacea purpurea, Zinc Picolinate', 'Soho Industries', true, '/images/medicines/supplement_bottle.png'),
  (uuid_generate_v4(), 'c3333333-3333-3333-3333-333333333333', 'Sangobion Capsule', 'Suplemen zat besi untuk mengatasi anemia.', 22000, 80, false, 'Ferrous Gluconate, Vitamins', 'Merck', true, '/images/medicines/supplement_bottle.png'),
  (uuid_generate_v4(), 'c3333333-3333-3333-3333-333333333333', 'Blackmores Fish Oil', 'Suplemen minyak ikan untuk kesehatan jantung.', 185000, 30, false, '1000mg Fish Oil', 'Kalbe Blackmores', true, '/images/medicines/supplement_bottle.png'),

  -- LAMBUNG (Syrup Bottle / Pill Box)
  (uuid_generate_v4(), 'c4444444-4444-4444-4444-444444444444', 'Mylanta Cair 150ml', 'Meredakan gejala sakit maag dan kembung.', 38000, 50, false, 'Alumunium Hidroksida, Magnesium Hidroksida', 'Johnson & Johnson', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c4444444-4444-4444-4444-444444444444', 'Omeprazole 20mg', 'Menurunkan produksi asam lambung berlebih.', 15000, 40, true, '20mg Omeprazole', 'Pharos Indonesia', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c4444444-4444-4444-4444-444444444444', 'Polysilane Suspensi', 'Antasida untuk mengatasi asam lambung naik.', 28000, 3, false, 'Dimethicone, Alumunium Hydroxide', 'AstraZeneca', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c4444444-4444-4444-4444-444444444444', 'Gastrucid Tablet', 'Meredakan gejala lambung akut.', 12000, 100, false, 'Antasida', 'Nufarindo', true, '/images/medicines/pill_box.png'),

  -- BATUK & FLU (Syrup Bottle)
  (uuid_generate_v4(), 'c5555555-5555-5555-5555-555555555555', 'OBH Combi Batuk Berdahak', 'Meredakan batuk disertai dahak.', 18000, 90, false, 'Succus Liquiritiae, Ammonium Chloride', 'Combiphar', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c5555555-5555-5555-5555-555555555555', 'Vicks Formula 44', 'Meredakan batuk tidak berdahak.', 22000, 12, false, 'Dextromethorphan HBr', 'Procter & Gamble', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c5555555-5555-5555-5555-555555555555', 'Siladex Cough & Cold', 'Meredakan gejala flu dan batuk kering.', 16000, 0, false, 'Pseudoephedrine HCl, Guaifenesin', 'Konimex', false, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c5555555-5555-5555-5555-555555555555', 'Rhinos SR', 'Meredakan gejala rhinitis alergi.', 85000, 20, true, 'Loratadine, Pseudoephedrine', 'Dexa Medica', true, '/images/medicines/pill_box.png'),

  -- DIABETES (Pill Box)
  (uuid_generate_v4(), 'c6666666-6666-6666-6666-666666666666', 'Metformin HCl 500mg', 'Obat lini pertama untuk diabetes melitus tipe 2.', 10000, 300, true, '500mg Metformin', 'Kalbe Farma', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c6666666-6666-6666-6666-666666666666', 'Glimepiride 2mg', 'Membantu mengontrol kadar gula darah.', 45000, 4, true, '2mg Glimepiride', 'Sanbe Farma', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c6666666-6666-6666-6666-666666666666', 'Acarbose 50mg', 'Mencegah lonjakan gula darah setelah makan.', 22000, 50, true, '50mg Acarbose', 'Dexa Medica', true, '/images/medicines/pill_box.png'),

  -- HIPERTENSI (Pill Box)
  (uuid_generate_v4(), 'c7777777-7777-7777-7777-777711111111', 'Amlodipine 5mg', 'Obat penurun tekanan darah tinggi.', 15000, 400, true, '5mg Amlodipine Besilate', 'Kimia Farma', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c7777777-7777-7777-7777-777711111111', 'Candesartan 8mg', 'Mengatasi hipertensi dan gagal jantung.', 60000, 8, true, '8mg Candesartan Cilexetil', 'Dexa Medica', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c7777777-7777-7777-7777-777711111111', 'Bisoprolol 5mg', 'Obat penghambat beta untuk hipertensi.', 35000, 15, true, '5mg Bisoprolol', 'Merck', true, '/images/medicines/pill_box.png'),

  -- HERBAL (Supplement Bottle)
  (uuid_generate_v4(), 'c8888888-8888-8888-8888-888811111111', 'Tolak Angin Cair', 'Meredakan masuk angin dan memelihara daya tahan tubuh.', 4500, 1000, false, 'Ekstrak Jahe, Madu, Mint', 'Sido Muncul', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c8888888-8888-8888-8888-888811111111', 'Antangin JRG', 'Mengatasi mual dan perut kembung.', 4000, 500, false, 'Jahe, Royal Jelly, Ginseng', 'Deltomed', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c8888888-8888-8888-8888-888811111111', 'Lelap Tablet', 'Membantu meringankan gangguan tidur.', 15000, 40, false, 'Valerian, Nutmeg', 'Soho Industries', true, '/images/medicines/pill_box.png'),

  -- ANAK (Syrup Bottle)
  (uuid_generate_v4(), 'c9999999-9999-9999-9999-999911111111', 'Tempra Syrup 60ml', 'Pereda demam khusus bayi dan anak.', 55000, 45, false, 'Paracetamol 160mg/5ml', 'Taisho', true, '/images/medicines/syrup_bottle.png'),
  (uuid_generate_v4(), 'c9999999-9999-9999-9999-999911111111', 'Sanmol Drop 15ml', 'Obat tetes penurun panas untuk bayi.', 32000, 7, false, 'Paracetamol 60mg/0.6ml', 'Sanbe Farma', true, '/images/medicines/syrup_bottle.png'),

  -- KULIT & ALERGI (Ointment Tube)
  (uuid_generate_v4(), 'c0000000-0000-0000-0000-000011111111', 'Betadine Salep 5g', 'Antiseptik untuk mencegah infeksi pada luka.', 25000, 120, false, 'Povidone-Iodine 10%', 'Mundipharma', true, '/images/medicines/ointment_tube.png'),
  (uuid_generate_v4(), 'c0000000-0000-0000-0000-000011111111', 'Cetirizine 10mg', 'Meredakan gejala alergi (rhinitis, urtikaria).', 12000, 200, true, '10mg Cetirizine Dihydrochloride', 'Novell Pharma', true, '/images/medicines/pill_box.png'),
  (uuid_generate_v4(), 'c0000000-0000-0000-0000-000011111111', 'Hydrocortisone Salep', 'Meredakan peradangan pada kulit.', 10000, 2, true, 'Hydrocortisone Acetate 1%', 'Kimia Farma', true, '/images/medicines/ointment_tube.png'),
  (uuid_generate_v4(), 'c0000000-0000-0000-0000-000011111111', 'Caladine Lotion', 'Meredakan gatal karena biang keringat.', 22000, 60, false, 'Calamine, Zinc Oxide', 'Galenium Pharmasia', true, '/images/medicines/syrup_bottle.png');
