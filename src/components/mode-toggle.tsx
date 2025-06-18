import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const ModeToggle = () => {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			className="cursor-pointer"
			size="icon"
			onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
		>
			<Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:scale-0" />

			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

			<span className="sr-only">Toggle theme</span>
		</Button>
	);
};

export default ModeToggle;
