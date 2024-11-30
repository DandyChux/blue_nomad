import { MenuIcon as Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type NavItem = {
	label: string;
	href: string;
};

export const navLinks: NavItem[] = [
	{
		label: 'Our Story',
		href: '/about',
	},
	{
		label: 'Book a Treatment',
		href: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
	{
		label: 'Gift Card',
		href: 'https://app.squareup.com/gift/ML665NPQYDHTJ/order',
	},
];

export const Navbar: React.FC = () => {
	return (
		<header
			className={
				'flex items-center justify-start absolute top-0 w-full bg-transparent p-4 md:p-6 lg:px-10'
			}
		>
			<div className='flex items-center group w-full'>
				<Link
					href='/'
					className='relative w-[200px] lg:mr-8 motion-safe:hover:scale-105 no-underline'
				>
					<Image
						src='/logos/blue-nomad.png'
						alt='Blue Nomad Logo'
						width={0}
						height={0}
						sizes='100vw'
						className='w-auto h-auto'
					/>
				</Link>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant={'ghost'}
							className='ml-auto w-auto h-fit md:hidden'
						>
							<Menu
								className='!size-6 lg:!size-8 xl:!size-10'
								strokeWidth={2.5}
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						sideOffset={4}
						className='md:hidden shadow-none bg-black text-white'
					>
						{navLinks.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									href={item.href}
									rel='nofollow noopener noreferrer'
									target={item.href.includes('squareup') ? '_blank' : undefined}
									className='font-source-code-pro'
								>
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<nav className='hidden md:flex'>
					<ul className='flex gap-8 *:uppercase'>
						{navLinks.map((item) => (
							<li
								key={item.label}
								className='motion-safe:hover:underline motion-safe:hover:underline-offset-2 duration-300 ease-in-out'
							>
								<Link
									href={item.href}
									className='font-semibold text-lg font-source-code-pro no-underline'
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
		</header>
	);
};
