"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 translate-y-0 rotate-0 transition-all duration-500 ease-in-out dark:scale-0 dark:translate-y-4 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 -translate-y-4 rotate-90 transition-all duration-500 ease-in-out dark:scale-100 dark:translate-y-0 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
