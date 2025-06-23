import ThemeToggle from "@/components/theme-toggle";

/**
 * Layout header.
 */
const Header = () => (
  <div className="flex flex-row items-center justify-end pr-3 pt-3">
    <ThemeToggle />
  </div>
);

export default Header;
