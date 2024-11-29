'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import TreatmentShot2 from '~/assets/treatment-section/Artboard 2-1.png';
import TreatmentShot3 from '~/assets/treatment-section/Artboard 2-2.png';
import TreatmentShot1 from '~/assets/treatment-section/Artboard 2.png';
import HoverShot1 from '~/assets/treatment-section/Artboard 3.png';
import HoverShot2 from '~/assets/treatment-section/Artboard 4.png';
import HoverShot3 from '~/assets/treatment-section/Artboard 5.png';
import { cn } from '~/lib/utils';
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
			'Personalized face-to-neck skin therapy blending advanced modalities with ancient massage techniques. From well-aging to acne care, each treatment is customized to guide your skin to optimal health.',
		price: 235,
		defaultImage: TreatmentShot3.src,
		hoverImage: HoverShot3.src,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
	{
		title: 'Refresh Peel 45min',
		description:
			"A customized blend of acids and vitamins that transforms texture and tone while protecting your skin's barrier and revealing its natural luminosity. Most beneficial during colder months.",
		price: 225,
		defaultImage: TreatmentShot1.src,
		hoverImage: HoverShot1.src,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
		// membersOnly: true,
	},
	{
		title: 'Facial ST 60 Membership',
		description:
			'Our signature Facial ST 60 monthly, with access to anytime skincare guidance and first experience at new brands and treatments.',
		price: 185,
		defaultImage: TreatmentShot2.src,
		hoverImage: HoverShot2.src,
		membersOnly: true,
		link: 'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start',
	},
];

export default function TreatmentCards() {
	return (
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
					index={index + 1} // index is 0-based so we add 1
				/>
			))}
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
				'relative group rounded-none motion-safe:hover:scale-105 transition-all ease-in-out transform duration-500 p-4 border-none',
				{
					'bg-secondary text-secondary-foreground': index % 2 !== 0,
					'text-white': index % 2 === 0,
				},
				className
			)}
		>
			<Link
				className='text-sm underline decoration-dotted underline-offset-2'
				href={link}
				target='_blank'
				rel='noreferrer'
			>
				<span className='absolute inset-0'></span>
			</Link>
			{index % 2 === 0 ? (
				<>
					<CardContent className='p-0'>
						<Link href={link} target='_blank' rel='noopener noreferrer'>
							<Image
								src={isHovered ? hoverImage : defaultImage}
								alt={title}
								width={550}
								height={420}
								sizes='100vw'
								className='w-full h-auto'
								placeholder='empty'
							/>
						</Link>
					</CardContent>
					<CardHeader>
						<CardDescription className='text-inherit uppercase font-source-code-pro font-semibold'>
							{description}{' '}
							{membersOnly
								? 'May be canceled anytime after the first (3) months.'
								: ''}
						</CardDescription>
						<CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
							{title} {membersOnly ? '' : `- $${price}`}
						</CardTitle>
						{membersOnly && (
							<CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
								Membership - ${price}
							</CardTitle>
						)}
					</CardHeader>
				</>
			) : (
				<>
					<CardHeader>
						<CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
							{title} {membersOnly ? '' : `- $${price}`}
						</CardTitle>
						{membersOnly && (
							<CardTitle className='font-normal text-xl lg:text-3xl tracking-wide'>
								${price}
							</CardTitle>
						)}
						<CardDescription className='text-inherit uppercase font-source-code-pro font-semibold'>
							{description}{' '}
							{membersOnly
								? 'May be canceled anytime after the first (3) months.'
								: ''}
						</CardDescription>
					</CardHeader>
					<CardContent className='p-0'>
						<Link href={link} target='_blank' rel='noopener noreferrer'>
							<Image
								src={isHovered ? hoverImage : defaultImage}
								alt={title}
								width={550}
								height={420}
								sizes='100vw'
								className='w-full h-auto'
								placeholder='empty'
							/>
						</Link>
					</CardContent>
				</>
			)}
		</Card>
	);
};
