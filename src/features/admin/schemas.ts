import { z } from 'zod'

export const medicineSchema = z.object({
  name: z.string().min(1, 'Nama obat wajib diisi'),
  category_id: z.string().min(1, 'Kategori wajib dipilih'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  requires_prescription: z.boolean().default(false),
  image_url: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  dosage: z.string().optional(),
  manufacturer: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type MedicineFormValues = z.infer<typeof medicineSchema>
