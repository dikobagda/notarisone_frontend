"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
        <Sun className="h-4 w-4 text-muted-foreground/40" />
        <div className="h-5 w-9 bg-muted animate-pulse rounded-full" />
        <Moon className="h-4 w-4 text-muted-foreground/40" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full shadow-sm">
      <Sun className={`h-4 w-4 transition-colors ${!isDark ? "text-amber-500" : "text-muted-foreground/40"}`} />
      <Switch
        id="mode-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-slate-200"
      />
      <Moon className={`h-4 w-4 transition-colors ${isDark ? "text-indigo-400" : "text-muted-foreground/40"}`} />
      <Label htmlFor="mode-toggle" className="sr-only">Toggle theme</Label>
    </div>
  );
}
