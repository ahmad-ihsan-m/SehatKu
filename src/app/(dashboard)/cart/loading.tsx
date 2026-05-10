import { Skeleton } from '@/components/ui/skeleton'

export default function CartLoading() {
  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
