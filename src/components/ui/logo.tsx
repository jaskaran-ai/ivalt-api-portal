"use client";

import { useTheme } from "@/components/ui/theme-provider";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8 w-auto" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === "dark" ? "/logo.webp" : "/logo-light.png";

  return <img src={src} alt="iVALT" className={className} />;
}
