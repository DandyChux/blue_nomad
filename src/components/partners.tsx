'use client';

import Image from 'next/image';
import { useViewport } from '~/lib/useViewport';
import { roundTo } from '~/lib/utils';

type LogoProps = {
	// src: StaticImageData;
	src: string;
	alt: string;
};

const centralLogo: LogoProps = {
	src: '/logos/blue-nomad.png',
	alt: 'Blue Nomad Logo',
};

const surroundingLogos: LogoProps[] = [
	{
		src: '/logos/lookout-and-wonderland.png',
		alt: 'Lookout and Wonderland',
	},
	{
		src: '/logos/woods-copenhagen.png',
		alt: 'Woods Copenhagen',
	},
	{
		src: '/logos/omorovicza.png',
		alt: 'Omorovicza',
	},
	{
		src: '/logos/amolin.png',
		alt: 'Amolin',
	},
	{
		src: '/logos/27-rosiers.png',
		alt: '27 Rosiers',
	},
	{
		src: '/logos/dermalogica.png',
		alt: 'Dermalogica',
	},
	{
		src: '/logos/earl-of-east.png',
		alt: 'Earl of East',
	},
	{
		src: '/logos/arami.png',
		alt: 'Arami',
	},
	{
		src: '/logos/lesse.png',
		alt: 'Lesse',
	},
];

export default function Partners() {
	// Define ellipse dimensions
	const { width, height } = useViewport();
	const ovalWidth = width * 0.7;
	const ovalHeight = height * 0.5;
	const radiusX = ovalWidth / 2;
	const radiusY = ovalHeight / 2;
	const totalImages = surroundingLogos.length;

	return (
		<div className='mt-8 pt-12 md:px-4 lg:px-8 w-full md:flex-col'>
			<div className='lg:mb-32'>
				<p className='lg:text-2xl uppercase text-end'>
					Some Favorites From Near &amp; Far:
				</p>
				<h1 className='uppercase text-lg lg:text-[3rem] text-end my-2 lg:my-6'>
					Our In-Studio Curation
				</h1>
			</div>

			{/* Elliptical layout for medium screens and above */}
			<div className='relative w-full h-[650px] self-center hidden md:block'>
				{/* Central Image */}
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
					<Image
						src={centralLogo.src}
						alt={centralLogo.alt}
						width={300}
						height={300}
						className='w-auto h-auto'
					/>
				</div>

				{/* Surrounding Images */}
				{surroundingLogos.map((logo, index) => {
					const θ = (2 * Math.PI * index) / totalImages;
					let x = Math.cos(θ) * radiusX;
					let y = Math.sin(θ) * radiusY;

					// Round x and y to 3 decimal places
					x = roundTo(x, 3);
					y = roundTo(y, 3);

					return (
						<div
							key={index}
							className='absolute top-1/2 left-1/2'
							style={{
								transform: `translate(${x}px, ${y}px)`,
							}}
						>
							<div
								className='flex items-center justify-center'
								style={{
									transform: 'translate(-50%, -50%)',
								}}
							>
								<Image
									src={logo.src}
									alt={logo.alt}
									width={175}
									height={75}
									className='w-[75%] h-auto'
								/>
							</div>
						</div>
					);
				})}
			</div>

			{/* Stacked layout for mobile screens */}
			<div className='flex flex-col items-center gap-4 mt-10 md:hidden'>
				{/* Central Image */}
				<div>
					<Image
						src={centralLogo.src}
						alt={centralLogo.alt}
						width={200}
						height={200}
						className='w-full h-auto'
					/>
				</div>
				{/* Surrounding Images */}
				{surroundingLogos.map((logo, index) => (
					<div key={index}>
						<Image
							src={logo.src}
							alt={logo.alt}
							width={75}
							height={75}
							className='w-full h-auto'
						/>
					</div>
				))}
			</div>
		</div>
	);
}
