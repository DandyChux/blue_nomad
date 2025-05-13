"use client"

import { MenuIcon as Menu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from './ui/sheet';
import { usePathname } from 'next/navigation';
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
	const pathname = usePathname();
	const { width } = useViewport();
	const { setSearchQuery } = useSearch(); // Use our search context

	// Handle search query changes
	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	return (
		<header
			className={
				'flex items-center justify-between absolute top-0 w-full bg-transparent p-4 md:p-6 z-1'
			}
		>
			<div className='flex items-center group'>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant={'ghost'} className='self-start w-auto h-fit'>
							<Menu
								className={cn('!size-6 lg:!size-8 xl:!size-10 text-black hover:cursor-pointer', {
									'md:text-primary-foreground': pathname === '/',
									'text-pale-grey': pathname === '/nomadsland'
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
									href={item.href}
									rel='nofollow noopener noreferrer'
									target={item.href.includes('squareup') ? '_blank' : undefined}
									className='font-source-code-pro uppercase text-lg'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>
				<nav className='hidden group-hover:flex'>
					<ul
						className={cn('flex gap-8 *:uppercase text-black', {
							'text-pale-grey': pathname === '/nomadsland',
							'text-primary-foreground': pathname === '/'
						})}
					>
						{navLinks.map((item) => (
							<li
								key={item.label}
								className='motion-safe:hover:underline motion-safe:hover:underline-offset-2 duration-300 ease-in-out'
							>
								<Link
									href={item.href}
									className={cn('font-semibold text-lg font-source-code-pro no-underline', {
										'text-pale-grey': pathname === '/nomadsland'
									})}
									rel='nofollow noopener noreferrer'
									target={item.href.includes('squareup') ? '_blank' : undefined}
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
						<Button variant={'ghost'} className={'hidden sm:inline-flex text-primary-foreground hover:text-white hover:bg-black rounded-full hover:cursor-pointer'}>
							<Link href="#subscription-form" target='_blank' rel='noopener noreferrer' className='no-underline'>
								Get Our Newsletter
							</Link>
						</Button>
					</>
				)}
				{pathname !== '/nomadsland' && (
					<Link
						href='/'
						className={cn('no-underline', {
							'block': pathname === '/',
							'hidden': pathname !== '/'
						})}
					>
						<Image
							src={pathname === '/' ? (width < 768 ? 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.png' : 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-light.png') : 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.png'}
							alt='Blue Nomad Logo'
							width={0}
							height={0}
							sizes='100vw'
							priority
							className='w-full h-auto sm:max-w-[300px]'
						/>
					</Link>
				)}
			</div>
		</header>
	);

};
