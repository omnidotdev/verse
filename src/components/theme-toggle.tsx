import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect } from "react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();

	const toggleTheme = useCallback(
		() => setTheme(theme === "light" ? "dark" : "light"),
		[theme, setTheme],
	);

	// Press "T" to toggle the theme, mirroring the rest of the Omni fleet. Ignore
	// it while a modifier is held or the user is typing in a field, so it never
	// hijacks a real keystroke.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() !== "t" ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement ||
				(event.target instanceof HTMLElement && event.target.isContentEditable)
			) {
				return;
			}
			toggleTheme();
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [toggleTheme]);

	return (
		<Button
			variant="ghost"
			className="cursor-pointer"
			size="icon"
			onClick={toggleTheme}
			title="Toggle theme (T)"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />

			<Moon className="hidden h-[1.2rem] w-[1.2rem] dark:block" />

			<span className="sr-only">Toggle theme</span>
		</Button>
	);
};

export default ThemeToggle;
