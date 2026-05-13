'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { Pill } from 'lucide-react'

interface SafeImageProps extends Omit<ImageProps, 'onError' | 'src'> {
  src?: ImageProps['src'] | null
  fallback?: React.ReactNode
  containerClassName?: string
}

/**
 * SafeImage Component
 * Stabilizes image rendering with error handling and optimized loading.
 */
export function SafeImage({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  ...props
}: SafeImageProps) {
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const renderFallback = () => (
    fallback || (
      <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50 text-muted-foreground animate-in fade-in duration-300">
        <Pill className="w-10 h-10 opacity-30" />
        <span className="text-[10px] font-medium mt-2">Gambar tidak tersedia</span>
      </div>
    )
  )

  if (isError || !src) {
    return (
      <div className={cn("relative overflow-hidden shrink-0", containerClassName)}>
        {renderFallback()}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden shrink-0 w-full h-full", containerClassName)}>
      <Image
        fill
        src={src}
        alt={alt}
        className={cn(
          "transition-all duration-300",
          isLoading ? "scale-105 blur-sm grayscale" : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsError(true)}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      )}
    </div>
  )
}
