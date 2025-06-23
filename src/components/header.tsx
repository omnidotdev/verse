import ThemeToggle from "@/components/theme-toggle";

/**
 * Layout header.
 */
const Header = () => (
  <div className="flex flex-row items-center justify-end p-2">
    <ThemeToggle />
  </div>
);

export default Header;
