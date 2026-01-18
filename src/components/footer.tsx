'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { addToHubSpot, sendMail } from '~/app/actions';
import { NavItem, navLinks } from './navbar';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '~/lib/utils';
import { usePlausible } from 'next-plausible';

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
	const pathname = usePathname();
	const plausible = usePlausible();
	const { slug } = useParams();
	const year = new Date().getFullYear();
	const form = useForm<z.infer<typeof contactSchema>>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			email: '',
		},
	});
	const isSubmitting = form.formState.isSubmitting;

	async function onSubmit(data: z.infer<typeof contactSchema>) {
		try {
			// Add contact to HubSpot CRM with additional properties
			await addToHubSpot({
				email: data.email,
				// properties: {
				// 	website_source: 'footer_subscription',
				// 	subscription_date: new Date().toISOString(),
				// }
			}).then(() => {
				toast.success('Thank you for signing up! You will now be added to our newsletter list.')
				// Track the subscription event (only if subscription is successful)
				plausible('Subscribe', { props: { email: data.email } });
			})

		} catch (error) {
			console.error('Subscription error:', error);

			// Fallback: Try to at least send an email notification
			try {
				const mailText = `New subscriber (HubSpot failed): ${data.email}`;
				const response = await sendMail({
					email: data.email,
					subject: 'New Subscription (Manual Review Required)',
					text: mailText,
				});

				if (response?.messageId) {
					toast.warning('Subscription received! We\'ll add you to our list shortly.');
				} else {
					toast.error('Failed to subscribe. Please try again or contact us directly.');
				}
			} catch (emailError) {
				toast.error('Failed to subscribe. Please try again or contact us directly.');
			}
		}
	}

	return (
		<footer className={cn('flex flex-col px-2 space-y-6 relative')}>
			<div className="absolute inset-0 m-0 -z-10">
				<Image
					src="/footer_gradient.png"
					alt="Background"
					fill
					priority
					placeholder="blur"
					blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYiPjwvcmVjdD48L3N2Zz4="
					className="object-cover xl:object-cover object-center"
					sizes="100vw"
				/>
			</div>

			<div className='flex flex-col lg:flex-row space-y-14 lg:space-y-0 px-8 md:px-12 lg:px-20 py-4 md:py-8 lg:py-16'>
				<div className='flex-1 flex flex-col space-y-4'>
					<h2 className='uppercase text-xl'>Our Studio</h2>
					<address className='uppercase not-italic font-bold font-source-code-pro'>
						Blue Nomad <br />
						1123 Broadway, #1014 <br />
						New York, NY 10010
					</address>
					<p className='uppercase font-bold font-source-code-pro'>
						Mon-Sat 11AM to 8PM
					</p>
				</div>

				<div className='flex flex-col flex-1 h-full justify-between'>
					<nav className='inline-flex flex-col gap-4 tracking-wide'>
						{navLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className='uppercase text-lg md:text-xl font-bold'
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

				<div id='subscription-form' className='flex flex-col flex-1 space-y-2 mt-10 md:mt-0'>
					<span className='uppercase font-semibold text-xl lg:text-2xl tracking-wide'>
						Notes from our world, first.
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
												className={cn('placeholder:font-semibold placeholder:text-black placeholder:opacity-85 shadow-none border-t-0 border-l-0 border-r-0 rounded-none', {
													// 'border-white placeholder:text-white': pathname === '/nomadsland' || slug !== undefined
												})}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								className={cn('rounded-full uppercase mt-4 bg-transparent self-end font-bold', {
									// 'border-white': pathname === '/nomadsland' || slug !== undefined
								})}
								variant={'outline'}
								size={'xl'}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Submitting...' : 'Sign Up'}
							</Button>
						</form>
					</Form>
				</div>
			</div>

			<div className='mt-auto flex flex-col w-full px-8 md:px-12 lg:px-20'>
				<h2 className='uppercase text-xl'>Contact Us</h2>
				<div className='flex flex-col md:flex-row gap-10'>
					<span className='uppercase font-source-code-pro font-bold text-lg'>
						646-566-1183 / hello@bluenomad.nyc
					</span>

					<nav className='flex gap-8'>
						<Link
							href='https://www.instagram.com/bluenomadworld'
							target='_blank'
							rel='noopener noreferrer nofollow'
							className='font-bold uppercase font-source-code-pro'
							onClick={() => plausible('Clicked Instagram Link')}
						>
							Instagram
						</Link>
						<Link
							href='https://www.tiktok.com/@bluenomadworld?_t=8sLa1tyGeW6&_r=1'
							target='_blank'
							rel='noopener noreferrer nofollow'
							className='font-bold uppercase font-source-code-pro'
						>
							TikTok
						</Link>
					</nav>
				</div>
			</div>

			<div className='flex flex-col lg:flex-row w-full items-center px-8'>
				<div className='relative w-full md:w-[60%]'>
					<Link href='/'>
						<Image
							// src={(pathname === '/nomadsland' || slug !== undefined) ? '/logos/blue-nomad-white.png' : '/logos/blue-nomad.png'}
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
			<address>
				<p className='text-sm text-center text-muted-foreground'>
					Created by <a href='https://ceokoroji.dev' className='underline'>Chukwuma Okoroji</a> 🖤
				</p>
			</address>
		</footer>
	);
};
