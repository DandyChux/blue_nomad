'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import JohannaShot1 from '~/assets/Look 1 519.jpg';
import MelShot1 from '~/assets/treatment-section/Artboard 2.png';
import MelShot2 from '~/assets/treatment-section/Artboard 3.png';
import EgoShot1 from '~/assets/Look 5 306.jpg';
import HoverShot1 from '~/assets/Look 4 213.jpg';
import JohannaShot2 from '~/assets/Look 1 435.jpg';
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
		defaultImage: JohannaShot1.src,
		hoverImage: JohannaShot2.src,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
	{
		title: 'Refresh Peel 45min',
		description:
			"A customized blend of acids and vitamins that transforms texture and tone while protecting your skin's barrier and revealing its natural luminosity. Most beneficial during colder months.",
		price: 225,
		defaultImage: MelShot2.src,
		hoverImage: MelShot1.src,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
		// membersOnly: true,
	},
	{
		title: 'Facial ST Membership',
		description:
			'Experience our signature 60min facial skin therapy monthly, with exclusive access to on-demand skin health guidance.',
		price: 185,
		defaultImage: EgoShot1.src,
		hoverImage: HoverShot1.src,
		membersOnly: true,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
];

export default function TreatmentCards() {
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

const TreatmentCard: React.FC<TreatmentCardProps> = ({
	description,
	defaultImage,
	hoverImage,
	price,
	title,
	membersOnly,
	className,
	index,
	link,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Card
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				'relative group rounded-none p-4 border-none flex flex-col',
				{
					'bg-secondary text-secondary-foreground': index % 2 === 0,
					'text-white': index % 2 !== 0,
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
				className={cn('p-0 flex-1 relative w-full aspect-square', {
					'order-1': index % 2 !== 0,
					'order-2': index % 2 === 0,
				})}
			>
				<Image
					src={isHovered ? hoverImage : defaultImage}
					alt={title}
					fill
					sizes='100vw'
					className='object-cover'
					placeholder='empty'
				/>
			</CardContent>
		</Card>
	);
};
