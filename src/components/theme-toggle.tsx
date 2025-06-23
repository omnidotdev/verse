import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      size="icon"
      onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />

      <Moon className="hidden h-[1.2rem] w-[1.2rem] dark:block" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
