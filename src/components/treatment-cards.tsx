import { Image } from './ui/image';
import React, { useState } from 'react';
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
		defaultImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Johanna/Look-1-519.webp',
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
		defaultImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Look-5-306.webp',
		hoverImage: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Ego.webp',
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
				<a
					href={
						'https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start'
					}
					target='_blank'
					rel='noreferrer noopener'
				>
					Book a <br />
					Treatment
				</a>
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
					src={isHovered ? hoverImage : defaultImage}
					alt={title}
					// quality={85}
					loading='lazy'
					className={cn('object-cover h-full w-full', {
						'object-[5%_35%]': index % 2 === 0,
					})}
				/>
			</CardContent>
		</Card>
	);
};
