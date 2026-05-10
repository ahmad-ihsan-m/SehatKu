'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, Pill, Info, DollarSign, Package, Factory, Activity, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { medicineSchema, type MedicineFormValues } from '../schemas'
import type { Category } from '@/types/database'
import { clientUploadPublic } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import { SafeImage } from '@/components/ui/safe-image'
import { cn } from '@/lib/utils'

interface MedicineFormProps {
  categories: Category[]
  initialData?: Partial<MedicineFormValues> & { id?: string }
  onSubmit: (values: MedicineFormValues) => Promise<void>
  isLoading: boolean
}

export function MedicineForm({ categories, initialData, onSubmit, isLoading: isSubmitting }: MedicineFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialData?.image_url || null)

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: initialData?.name || '',
      category_id: initialData?.category_id || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      stock: initialData?.stock || 0,
      requires_prescription: initialData?.requires_prescription || false,
      image_url: initialData?.image_url || '',
      dosage: initialData?.dosage || '',
      manufacturer: initialData?.manufacturer || '',
      is_active: initialData?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        stock: initialData.stock || 0,
        requires_prescription: initialData.requires_prescription || false,
        image_url: initialData.image_url || '',
        dosage: initialData.dosage || '',
        manufacturer: initialData.manufacturer || '',
        is_active: initialData.is_active ?? true,
      })
      setPreview(initialData.image_url || null)
    }
  }, [initialData, form])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    setIsUploading(true)
    const fileName = `medicine-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const result = await clientUploadPublic('medicines', fileName, file)
    
    if ('error' in result) {
      toast.error(result.error)
    } else {
      form.setValue('image_url', result.publicUrl)
      setPreview(result.publicUrl)
      toast.success('Gambar berhasil diunggah')
    }
    setIsUploading(false)
  }

  const removeImage = () => {
    form.setValue('image_url', '')
    setPreview(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 pb-8">
        
        {/* SECTION 1: MEDIA & STATUS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Tag className="w-4 h-4" />
            <span>Media & Identitas</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-48 shrink-0">
              <div className="relative group aspect-square w-full rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/10 hover:border-primary/40 transition-all bg-muted/5">
                {preview ? (
                  <>
                    <SafeImage src={preview} alt="Preview" className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="rounded-full px-4 h-8 text-[10px] font-bold">
                        <X className="w-3 h-3 mr-1.5" /> Hapus
                      </Button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer group p-4">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground mt-2 text-center">Upload Foto</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nama Produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Amoxicillin 500mg" {...field} className="h-10 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none font-semibold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requires_prescription"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 rounded-xl bg-amber-50/30 border border-amber-100/50 dark:bg-amber-950/5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[11px] font-bold flex items-center gap-2 text-amber-700">
                          <Info className="w-3.5 h-3.5" /> Butuh Resep
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[11px] font-bold flex items-center gap-2 text-primary">
                          <Activity className="w-3.5 h-3.5" /> Status Aktif
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/50 w-full" />

        {/* SECTION 2: DETAIL PRODUK */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>Detail & Aturan Pakai</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} key={categories.length}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="rounded-lg">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Pabrikan</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Factory className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                      <Input placeholder="Nama produsen..." {...field} className="h-10 pl-9 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dosis & Aturan Konsumsi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Pill className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                      <Input placeholder="Misal: 3x1 sehari sesudah makan" {...field} className="h-10 pl-9 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Deskripsi Obat</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informasi detail mengenai obat..." 
                      className="min-h-[100px] rounded-2xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none p-4 resize-none text-sm leading-relaxed" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="h-px bg-border/50 w-full" />

        {/* SECTION 3: INVENTARIS & HARGA */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <DollarSign className="w-4 h-4" />
            <span>Inventaris & Harga</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Harga Jual (IDR)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-primary" />
                      <Input type="number" {...field} className="h-10 pl-9 rounded-xl bg-primary/5 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none font-bold text-primary" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stok Gudang</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                      <Input type="number" {...field} className="h-10 pl-9 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none font-bold" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="w-full sm:w-auto h-11 px-12 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
