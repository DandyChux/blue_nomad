import { MenuIcon as Menu } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Image } from './ui/image';
import { Button } from './ui/button';
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from './ui/sheet';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { cn } from '~/lib/utils';
import { useViewport } from '~/lib/useViewport';
import { SearchBar } from './search-bar';
import { useSearch } from '~/lib/contexts/search-context';

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
	const { pathname } = useLocation();
	const { width } = useViewport();
	const navigate = useNavigate();
	const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Handle search query changes
	const handleSearch = (query: string) => {
		navigate({
			from: '/nomadsland',
			search: {
				search: query
			}
		})
	};

	// Handle click outside to close menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsDesktopMenuOpen(false);
			}
		};

		if (isDesktopMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDesktopMenuOpen]);

	// Close menu when navigating
	useEffect(() => {
		setIsDesktopMenuOpen(false);
	}, [pathname]);

	return (
		<header
			className={
				'flex items-center justify-between absolute top-0 w-full bg-transparent p-4 md:p-6 z-1'
			}
		>
			<div className='flex items-center' ref={menuRef}>
				{/* Mobile menu (unchanged) */}
				<Sheet>
					<SheetTrigger asChild className='md:hidden'>
						<Button variant={'ghost'} className='self-start w-auto h-fit'>
							<Menu
								className={cn('!size-6 lg:!size-8 xl:!size-10 text-black hover:cursor-pointer', {
									'text-brand-white': pathname === '/' || pathname === '/nomadsland'
								})}
								strokeWidth={2.5}
							/>
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className='md:hidden shadow-none bg-black text-white border-none pl-4'
					>
						<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
						<nav className="flex flex-col gap-4 mt-8">
							{navLinks.map((item) => (
								<Link
									key={item.label}
									to={item.href}
									rel={item.href.includes('squareup') ? 'noopener noreferrer nofollow' : undefined}
									target={item.href.includes('squareup') ? '_blank' : undefined}
									className='font-source-code-pro uppercase text-lg'
									onClick={() => {
										if (item.label === 'Gift Card') {
											window.plausible?.('Clicked Gift Card')
										} else if (item.label === 'Book a Treatment') {
											window.plausible?.('Clicked Treatment Booking')

										}
									}}
								>
									{item.label}
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>

				{/* Desktop menu toggle button */}
				<Button
					variant={'ghost'}
					className='hidden md:flex self-start w-auto h-fit hover:cursor-pointer'
					onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
				>
					<Menu
						className={cn('!size-6 lg:!size-8 xl:!size-10 text-black', {
							'text-brand-white': pathname === '/' || pathname === '/nomadsland'
						})}
						strokeWidth={2.5}
					/>
				</Button>

				{/* Desktop navigation */}
				<nav className={cn('hidden md:flex ml-8', {
					'md:hidden': !isDesktopMenuOpen
				})}>
					<ul
						className={cn('flex gap-8 *:uppercase text-black', {
							'text-brand-white': pathname === '/' || pathname === '/nomadsland'
						})}
					>
						{navLinks.map((item) => (
							<li
								key={item.label}
								className='motion-safe:hover:underline motion-safe:hover:underline-offset-2 duration-300 ease-in-out'
							>
								<Link
									to={item.href}
									className={cn('font-semibold text-lg font-source-code-pro no-underline', {
										'text-brand-white': pathname === '/' || pathname === '/nomadsland'
									})}
									rel='nofollow noopener noreferrer'
									target={item.href.includes('squareup') ? '_blank' : undefined}
									onClick={() => {
										if (item.label === 'Gift Card') {
											window.plausible?.('Clicked Gift Card')
										} else if (item.label === 'Book a Treatment') {
											window.plausible?.('Clicked Treatment Booking')
										}
									}}
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>

			<div className='flex max-w-[500px] w-auto items-center justify-end'>
				{pathname === '/nomadsland' && (
					<>
						<div className="flex items-center mr-2">
							<SearchBar onSearch={handleSearch} />
						</div>
						<Button variant={'ghost'} className={'hidden sm:inline-flex text-brand-white hover:text-white hover:bg-black rounded-full hover:cursor-pointer'}>
							{/* <Link href="#subscription-form" target='_blank' rel='noopener noreferrer' className='no-underline'>
								Get Our Newsletter
							</Link> */}
							<a href="#subscription-form" className='no-underline'>
								Get Our Newsletter
							</a>
						</Button>
					</>
				)}
				{pathname !== '/nomadsland' && (
					<a
						href='/'
						className={cn('no-underline', {
							'block': pathname === '/',
							'hidden': pathname !== '/'
						})}
					>
						<Image
							// src={pathname === '/' ? (width < 768 ? 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.png' : 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-light.png') : 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.png'}
							src={'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-light.png'}
							alt='Blue Nomad Logo'
							width={0}
							height={0}
							sizes='(max-width: 768px) 300px, (max-width: 1024px) 300px, 400px'
							fetchPriority='high'
							className='w-full h-auto sm:max-w-[300px]'
						/>
					</a>
				)}
			</div>
		</header>
	);

};
