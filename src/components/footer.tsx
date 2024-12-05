'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { NavItem, navLinks } from './navbar';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';

const contactSchema = z.object({
	email: z.string().email('Invalid email'),
});

const accessoryLinks: NavItem[] = [
	{
		label: 'Privacy Policy',
		href: '/privacy-policy',
	},
	{
		label: 'Terms of Service',
		href: '/terms-and-conditions',
	},
	{
		label: 'Frequently Asked Questions',
		href: '/faq',
	},
];

export const Footer: React.FC = () => {
	const year = new Date().getFullYear();
	const form = useForm<z.infer<typeof contactSchema>>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			email: '',
		},
	});

	async function onSubmit(data: z.infer<typeof contactSchema>) {
		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success('Thank you for subscribing!');
			}
		} catch (error) {
			console.error(error);
			toast.error('Error subscribing. Please try again.');
		}
	}

	return (
		<footer className='flex flex-col px-2 bg-footer-gradient bg-cover bg-no-repeat bg-top lg:bg-center space-y-6'>
			<div className='flex flex-col lg:flex-row space-y-14 lg:space-y-0 px-8 md:px-12 lg:px-20 py-4 md:py-8 lg:py-16'>
				<div className='flex-1 flex flex-col space-y-4'>
					<h2 className='uppercase text-xl'>Our Studio</h2>
					<address className='uppercase not-italic font-semibold font-source-code-pro'>
						Blue Nomad Labs LLC. <br />
						1123 Broadway, #1014 <br />
						New York, NY 10010
					</address>
					<p className='uppercase font-semibold font-source-code-pro'>
						M-F 11AM to 8PM
					</p>
				</div>

				<div className='flex flex-col flex-1 h-full justify-between'>
					<nav className='inline-flex flex-col gap-4 tracking-wide'>
						{navLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className='uppercase font-semibold text-xl'
								target={link.href.includes('squareup') ? '_blank' : undefined}
								rel='noopener noreferrer nofollow'
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				{/* <nav className='flex flex-col gap-2 flex-1'>
					{accessoryLinks.map((link, index) => (
						<Link
							key={index}
							href={link.href}
							// target='_blank'
							rel='noopener noreferrer nofollow'
							className='font-semibold uppercase font-source-code-pro no-underline'
						>
							{link.label}
						</Link>
					))}
				</nav> */}

				<div className='flex flex-col flex-1 space-y-2 mt-10 md:mt-0'>
					<span className='uppercase font-semibold text-xl lg:text-2xl tracking-wide'>
						Subscribe for 10% off your first treatment.
					</span>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col space-y-4'
						>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder='E-MAIL'
												className='placeholder:font-semibold placeholder:text-black placeholder:opacity-85 shadow-none border-t-0 border-l-0 border-r-0 rounded-none'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								className='rounded-full uppercase mt-4 bg-transparent self-end'
								variant={'outline'}
								size={'xl'}
							>
								Sign up
							</Button>
						</form>
					</Form>
				</div>
			</div>

			<div className='mt-auto flex flex-col w-full px-8 md:px-12 lg:px-20'>
				<h2 className='uppercase text-xl'>Contact Us</h2>
				<div className='flex flex-col md:flex-row gap-10'>
					<span className='uppercase font-source-code-pro font-semibold text-lg'>
						{/*917-000-0002 */}hello@bluenomad.nyc
					</span>

					<nav className='flex gap-8'>
						{/* <Link
							href='https://open.spotify.com/playlist/4XgNSZMlb2nPYlgjRyJphW?si=MfZFdSygTEWVGPij1nHwBQ&pi=u-MDOmpmukRmuB'
							target='_blank'
							rel='noopener noreferrer nofollow'
							className='font-semibold uppercase font-source-code-pro'
						>
							Spotify
						</Link> */}
						<Link
							href='https://www.instagram.com/bluenomadworld'
							target='_blank'
							rel='noopener noreferrer nofollow'
							className='font-semibold uppercase font-source-code-pro'
						>
							Instagram
						</Link>
					</nav>
				</div>
			</div>

			<div className='flex flex-col lg:flex-row w-full items-center px-8'>
				<div className='relative w-full md:w-[60%]'>
					<Link href='/'>
						<Image
							src='/logos/blue-nomad.png'
							alt='Blue Nomad Logo'
							width={0}
							height={0}
							sizes='100vw'
							className='w-full h-auto'
						/>
					</Link>
				</div>
				<small className='text-[0.5rem] lg:text-sm mt-2 lg:mt-0 uppercase font-bold place-self-center lg:place-self-end lg:px-20 grow'>
					&#169;{year} Blue Nomad Labs LLC. All rights reserved.
				</small>
			</div>
		</footer>
	);
};
