import { Link } from '@tanstack/react-router'
import { ModeToggle } from './mode-toggle'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'

export type NavItem = {
	label: string;
	href: string;
};

export const navLinks: NavItem[] = [
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'Our Story',
		href: '/about',
	},
	{
		label: 'Book a Treatment',
		href: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
		// href: '/booking'
	},
	{
		label: 'Gift Card',
		href: 'https://app.squareup.com/gift/ML665NPQYDHTJ/order',
	},
	{
		label: "Nomad's Land",
		href: '/nomadsland',
	},
];

export const Navbar: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<Link to="/" className="mr-6 flex items-center space-x-2">
					<span className="font-bold text-xl">Blue Nomad</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
					<div className="flex items-center space-x-6">
						{navLinks.map((item) => (
							<Link
								key={item.label}
								to={item.href}
								className="text-sm font-medium transition-colors hover:text-primary"
								activeProps={{ className: 'text-primary' }}
							>
								{item.label}
							</Link>
						))}
					</div>
					<ModeToggle />
				</div>

				{/* Mobile Navigation */}
				<div className="flex flex-1 items-center justify-end md:hidden">
					<ModeToggle />
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="ml-2">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<nav className="flex flex-col space-y-4">
								{navLinks.map((item) => (
									<Link
										key={item.label}
										to={item.href}
										className="text-lg font-medium transition-colors hover:text-primary"
										activeProps={{ className: 'text-primary' }}
										onClick={() => setOpen(false)}
									>
										{item.label}
									</Link>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	)
}
