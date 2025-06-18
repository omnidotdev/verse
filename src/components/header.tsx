import { Link } from "@tanstack/react-router";

import ModeToggle from "@/components/mode-toggle";

const Header = () => (
	<div>
		<div className="flex flex-row items-center justify-between p-2">
			<nav className="flex gap-4 text-lg">
				<Link to="/">Omniverse</Link>
			</nav>

			<div className="flex items-center gap-2">
				<ModeToggle />
			</div>
		</div>

		<hr />
	</div>
);

export default Header;
