'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, FileText, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { registerPrescriptionAction } from '@/features/prescriptions/actions'
import { clientUploadPrivate } from '@/lib/supabase/storage'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

function UploadPrescriptionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicineId = searchParams.get('medicineId')
  
  const user = useAuthStore((s) => s.user)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(f.type)) {
      toast.error('Format file harus JPEG, PNG, atau WebP')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !user) {
      toast.error('Sesi tidak valid atau file belum dipilih')
      return
    }

    setIsLoading(true)

    // 1. Client-side upload to private bucket
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`
    
    const uploadResult = await clientUploadPrivate('prescriptions', fileName, file)
    
    if ('error' in uploadResult) {
      toast.error(uploadResult.error)
      setIsLoading(false)
      return
    }

    // 2. Register in DB via Server Action
    const result = await registerPrescriptionAction(uploadResult.path, medicineId || undefined)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Resep berhasil diupload!')
      router.push('/prescriptions')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function removeFile() {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/prescriptions">
          <Button variant="outline" size="icon" className="rounded-xl shadow-sm" aria-label="Kembali">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">Upload Resep</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Lengkapi data medis Anda untuk memproses obat keras
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-xl shadow-primary/5 bg-card overflow-hidden">
          <CardHeader className="pb-4 bg-muted/20 border-b">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80">Dokumen Medis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {preview ? (
              <div className="relative group animate-in zoom-in-95 duration-300">
                <div className="rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted shadow-inner">
                  <img
                    src={preview}
                    alt="Preview resep"
                    className="w-full max-h-96 object-contain bg-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 w-10 h-10 rounded-full shadow-lg"
                  onClick={removeFile}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="mt-4 flex items-center justify-between bg-muted/50 p-3 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold truncate max-w-[200px]">{file?.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {(file!.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">Siap Kirim</Badge>
                </div>
              </div>
            ) : (
              <div
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 group ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <ImageIcon className="w-10 h-10 text-primary opacity-80" />
                </div>
                <h3 className="text-lg font-bold mb-1">Pilih Foto Resep</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tarik gambar ke sini atau klik untuk mencari
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">JPEG</Badge>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">PNG</Badge>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">WEBP</Badge>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">MAX 5MB</Badge>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              className="hidden"
            />
          </CardContent>
          <CardFooter className="flex-col gap-4 p-6 bg-muted/20 border-t">
            <Button
              type="submit"
              className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  Mengirim Berkas...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-3" />
                  Kirim Resep ke Apoteker
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <AlertCircle className="w-3 h-3 text-primary" />
              <span>Privasi data medis Anda terjamin</span>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default function UploadPrescriptionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
      <UploadPrescriptionForm />
    </Suspense>
  )
}
