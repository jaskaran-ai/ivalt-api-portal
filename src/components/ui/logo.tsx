'use client';

import { useTheme } from '@/components/ui/theme-provider';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8 w-auto' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'dark' ? '/logo.webp' : '/logo-light.png';

  // biome-ignore lint/performance/noImgElement: static local image with dynamic theme classes
  return <img src={src} alt="iVALT" className={className} />;
}
