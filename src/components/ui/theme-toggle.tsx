'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';

const nextTheme = { light: 'dark' as const, dark: 'system' as const, system: 'light' as const };
const icons = { light: Sun, dark: Moon, system: Monitor };
const labels = { light: 'Light', dark: 'Dark', system: 'System' };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme[theme])}
      aria-label={`Switch theme (current: ${labels[theme]})`}
      className="h-8 w-8"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
