'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';

type TreatmentProps = {
	title: string;
	description: string;
	price: number;
	defaultImage: string;
	hoverImage: string;
	link: string;
	membersOnly?: boolean;
};

type TreatmentCardProps = TreatmentProps & {
	index: number;
	className?: string;
};

const treatments: TreatmentProps[] = [
	{
		title: 'Facial ST 60min',
		description:
			'Facial skin therapy combining advanced technology with traditional massage techniques for optimal skin health. From acne care to well-aging, each treatment is customized to your needs.',
		price: 235,
		defaultImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Johanna/Look%201%20519.webp',
		hoverImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Johanna/Look%201%20435.webp',
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
	{
		title: 'AcuTherapy 50min',
		description:
			"*Coming Soon* Precision acupuncture to promote relaxation, reduce tension, optimize skin health and total body well-being. Fine needles help alleviate discomfort and encourage the body's natural healing.",
		price: 225,
		defaultImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Mel/Look%202%20233.webp',
		hoverImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Mel/Look%202%20145.webp',
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
		// membersOnly: true,
	},
	{
		title: 'Facial ST Membership',
		description:
			'Experience our signature 60min facial skin therapy monthly, with exclusive access to on-demand skin health guidance.',
		price: 185,
		defaultImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Look%205%20306.webp',
		hoverImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Look%205%20185.webp',
		membersOnly: true,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
];

export default function TreatmentCards() {
	const [imagesLoaded, setImagesLoaded] = useState(false);

	// Preload all images and set imagesLoaded when complete
	useEffect(() => {
		const imagesToLoad = [
			...treatments.map(t => t.defaultImage),
			...treatments.map(t => t.hoverImage)
		];

		let loadedCount = 0;
		const imagePromises = imagesToLoad.map(src => {
			return new Promise((resolve, reject) => {
				const img = new globalThis.Image();
				img.src = src;
				img.onload = () => {
					loadedCount++;
					resolve(true);
				};
				img.onerror = reject;
			});
		});

		Promise.all(imagePromises)
			.then(() => setImagesLoaded(true))
			.catch(err => console.error('Error preloading images:', err));

	}, []);

	return (
		<div className='flex flex-col items-center'>
			<div className='grid md:grid-cols-2 lg:grid-cols-3 mx-auto gap-4 p-2 md:p-8'>
				{treatments.map((treatment, index) => (
					<TreatmentCard
						key={index}
						title={treatment.title}
						description={treatment.description}
						price={treatment.price}
						defaultImage={treatment.defaultImage}
						hoverImage={treatment.hoverImage}
						membersOnly={treatment.membersOnly}
						link={treatment.link}
						index={index}
						imagesLoaded={imagesLoaded}
					/>
				))}
			</div>

			<Button className='uppercase mt-6' size={'xl'} variant={'outline'}>
				<Link
					href={
						'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start'
					}
					target='_blank'
					rel='noreferrer noopener'
				>
					Book a <br />
					Treatment
				</Link>
			</Button>
		</div>
	);
}

const TreatmentCard: React.FC<TreatmentCardProps & { imagesLoaded: boolean }> = ({
	description,
	defaultImage,
	hoverImage,
	price,
	title,
	membersOnly,
	className,
	index,
	link,
	imagesLoaded,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const shouldApplyHover = imagesLoaded && isHovered;

	return (
		<Card
			onMouseEnter={() => imagesLoaded && setIsHovered(true)}
			onMouseLeave={() => imagesLoaded && setIsHovered(false)}
			className={cn(
				'relative group rounded-none p-4 border-none flex flex-col',
				{
					'bg-secondary text-secondary-foreground': index % 2 === 0,
					'text-primary-foreground': index % 2 !== 0,
				},
				className
			)}
		>
			{/* <Link
				// className='text-sm underline decoration-dotted underline-offset-2'
				href={link}
				target='_blank'
				rel='noreferrer'
			>
				<span className='absolute inset-0'></span>
			</Link> */}
			<CardHeader
				className={cn('px-2 gap-0', {
					'order-2': index % 2 !== 0,
					'order-1': index % 2 === 0,
				})}
			>
				<CardTitle
					className={cn('font-normal text-xl lg:text-3xl tracking-wide my-2', {
						'order-1': index % 2 === 0,
						'order-2': index % 2 !== 0,
					})}
				>
					{title} - ${price}
				</CardTitle>
				<CardDescription
					className={cn(
						'text-inherit uppercase font-source-code-pro font-bold',
						{
							'order-1': index % 2 !== 0,
							'order-2': index % 2 === 0,
						}
					)}
				>
					{description}{' '}
					{membersOnly
						? 'Cancel anytime after the first three (3) months.'
						: ''}
				</CardDescription>
			</CardHeader>
			<CardContent
				className={cn('p-0 flex-1 relative w-full aspect-[4/3]', {
					'order-1': index % 2 !== 0,
					'order-2': index % 2 === 0,
				})}
			>
				<Image
					src={shouldApplyHover ? hoverImage : defaultImage}
					alt={title}
					fill
					className={cn('object-cover h-full w-full', {
						'object-[5%_35%]': index % 2 === 0,
					})}
				/>
			</CardContent>
		</Card>
	);
};
