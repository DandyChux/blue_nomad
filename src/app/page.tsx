import Image from 'next/image';
import Link from 'next/link';
import Headshot from '~/assets/Look 4 165.jpg';
import OnyedikaHeadshot from '~/assets/Look 4 44.jpg';
import EgoHeadshot from '~/assets/Look 5 185.jpg';
import TreatmentCards from '~/components/treatment-cards';
import { Button } from '~/components/ui/button';

import AndieImage from '~/assets/testimonial/Andie 1.jpeg';
import GoharImage from '~/assets/testimonial/Gohar.png';
import KevinImage from '~/assets/testimonial/Kevin.jpeg';
import MawatleImage from '~/assets/testimonial/Mawatle 1.jpg';
import RonImage from '~/assets/testimonial/Ron 1.jpeg';
import SilvanaImage from '~/assets/testimonial/Tobin-162.jpg';

import SocialMediaImage2 from '~/assets/Look 4 1.jpg';
import SocialMediaImage1 from '~/assets/Look 4 139.jpg';

import StudioImage from '~/assets/studio/interiors1.jpg';

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
		src: '/logos/27-rosiers.png',
		alt: '',
	},
	{
		src: '/logos/amolin.png',
		alt: '',
	},
	{
		src: '/logos/arami.png',
		alt: '',
	},
	{
		src: '/logos/dermalogica.png',
		alt: '',
	},
	{
		src: '/logos/earl-of-east.png',
		alt: '',
	},
	{
		src: '/logos/lesse.png',
		alt: '',
	},
	{
		src: '/logos/lookout-and-wonderland.png',
		alt: '',
	},
	{
		src: '/logos/omorovicza.png',
		alt: '',
	},
];

type TestimonialProps = {
	name: string;
	profession: string;
	image: string;
	description: string;
};

const testimonials: TestimonialProps[] = [
	{
		name: 'Ron',
		profession: 'founder',
		description: 'Feel energized!',
		image: RonImage.src,
	},
	{
		name: 'Kevin',
		profession: 'model',
		description: 'Refresh from within',
		image: KevinImage.src,
	},
	{
		name: 'Mawatle',
		profession: 'thespian',
		description: 'Embrace my authentic self.',
		image: MawatleImage.src,
	},
	{
		name: 'Andie',
		profession: 'fashion producer',
		description: 'Rediscover what feels good',
		image: AndieImage.src,
	},
	{
		name: 'Gohar',
		profession: 'artist',
		description: 'Feel Inspired.',
		image: GoharImage.src,
	},
	{
		name: 'Silvana',
		profession: 'architect + interior designer',
		description: 'Relax and unwind',
		image: SilvanaImage.src,
	},
];

const socialMediaImages = [SocialMediaImage1, SocialMediaImage2];

export default function Home() {
	// Define ellipse dimensions
	const ovalWidth = 950;
	const ovalHeight = 450;
	const radiusX = ovalWidth / 2;
	const radiusY = ovalHeight / 2;

	const θ_gap_center = Math.PI / 2; // 90 degrees
	const θ_gap_size = Math.PI / 6; // 30-degree gap
	const θ_gap_start = θ_gap_center - θ_gap_size / 2;
	const θ_gap_end = θ_gap_center + θ_gap_size / 2;
	const θ_total = 2 * Math.PI - θ_gap_size;

	return (
		<>
			{/* Hero Section */}
			<section className='p-0'>
				<div className='flex flex-col flex-1 items-center bg-hero-section-gradient bg-no-repeat bg-cover bg-center py-20 justify-around'>
					<div className='relative w-full lg:w-[85%]'>
						<Image
							src='/logos/blue-nomad.png'
							alt='hero'
							width={0}
							height={0}
							sizes='100vw'
							className='w-full h-auto'
						/>
					</div>
					<h1 className='uppercase text-center w-full lg:w-3/5 font-normal'>
						A Pri<em>va</em>te Skin Health Studio in NYC
					</h1>

					<div className='relative w-[250px] h-[300px]'>
						<Image
							src={StudioImage.src}
							alt='Image of the studio'
							fill
							sizes='250px'
							// style={{
							// 	objectFit: 'cover',
							// }}
							priority
						/>
					</div>

					<Button
						className='uppercase rounded-full text-lg h-auto py-2'
						variant='outline'
						size={'lg'}
					>
						<Link href='#treatments'>
							Discover our <br /> first offering
						</Link>
					</Button>
				</div>

				<div
					className='flex flex-col lg:flex-row flex-1 place-items-center p-4'
					style={{
						backgroundImage: `url('${EgoHeadshot.src}')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
					}}
				>
					<p className='uppercase text-2xl lg:text-3xl xl:text-5xl pl-4 md:pl-8 lg:pl-20 pt-32 mx-auto lg:mx-0 text-black'>
						Modern <em>Wellness</em> <br />
						Inspired <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By{' '}
						<em>Worlds</em> near.
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Far{' '}
						<em>&</em> Within
					</p>
				</div>
			</section>

			{/* Our Story Section */}
			<section className='py-12 px-8 lg:items-center'>
				<div className='flex-1'>
					<Image
						src={Headshot}
						alt=''
						width={0}
						height={0}
						sizes='100vw'
						className='w-full h-auto'
					/>
				</div>

				<div className='flex-[1_1_30%] flex flex-col items-center gap-10'>
					<p className='text-center text-xl lg:text-3xl'>
						Redefines wellness by blending <br /> timesless experiences, guiding
						curious <br /> minds on transformative journeys <br /> from urban
						alcoves to distant escapes.
					</p>

					<h1 className='uppercase text-center text-3xl font-normal lg:text-6xl'>
						{' '}
						For the curious & discernin
						<span className='lowercase text-4xl lg:text-8xl font-normal'>
							g
						</span>
					</h1>

					<Button
						className='uppercase rounded-full h-auto py-2 px-12'
						variant={'outline'}
						size={'lg'}
					>
						<Link href='/about'>
							Our <br /> story
						</Link>
					</Button>
				</div>
			</section>

			{/* Treatments Section */}
			<section className='lg:flex-col items-center' id='treatments'>
				<h1 className='uppercase'>
					Treatme<em>n</em>ts
				</h1>
				<p className='text-lg lg:text-xl'>
					Exploring timeless traditions and science for an experience that is
					both functional and soulful
				</p>
				<TreatmentCards />

				{/* Partners Section */}
				<div className='mt-8 py-12 px-4 md:px-8 lg:px-12 w-full md:flex-col'>
					<p className='text-xl lg:text-2xl uppercase text-end'>
						Some Favorites From Near &amp; Far:
					</p>
					<h1 className='uppercase text-end'>
						O<em>ur</em> In-Studio Curation
					</h1>

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
							const totalImages = surroundingLogos.length;
							const θ = (2 * Math.PI * index) / totalImages;
							const x = Math.cos(θ) * radiusX;
							const y = Math.sin(θ) * radiusY;

							return (
								<div
									key={index}
									className='absolute top-1/2 left-1/2'
									style={{
										transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
									}}
								>
									<Image
										src={logo.src}
										alt={logo.alt}
										width={75}
										height={75}
										className='w-full h-auto'
									/>
								</div>
							);
						})}
					</div>

					{/* Stacked layout for mobile screens */}
					<div className='flex flex-col items-center gap-4 md:hidden'>
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
									width={70}
									height={70}
									className='w-full h-auto'
								/>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonial Section */}
			<section className='lg:flex-col px-4 md:px-8 lg:px-12 py-12'>
				<figure className='flex flex-col'>
					<blockquote className='uppercase text-base lg:text-5xl'>
						<p>
							I <em>seek</em> out brands
						</p>{' '}
						<p className='pl-[5%] lg:pl-[10%]'>
							From diverse origins, curating those
						</p>{' '}
						<p>
							That are efficacious, cultured, &{' '}
							<span className='lowercase'>g</span>
							enuine-each
						</p>{' '}
						<p>with an ethos that</p>
						<p className='pl-[40%] lg:pl-[25%]'>
							<span className='lowercase'>g</span>oes <em>skin</em> deep.
						</p>
					</blockquote>

					<figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end'>
						<div className='place-self-end'>
							<p className='text-xl lg:text-2xl text-end'>Ònyedikachi</p>
							<small className='lg:text-lg'>
								founder / Skin Therapist Blue Nomad
							</small>
						</div>
						<Image
							src={OnyedikaHeadshot}
							alt='Ònyedikachi'
							width={150}
							height={200}
							// sizes='100vw'
							// className='w-full h-auto'
						/>
					</figcaption>
				</figure>

				{/* Testimonials */}
				<div className='relative w-full h-[750px] self-center hidden md:block'>
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
						<h2 className='uppercase text-xl md:text-2xl lg:text-4xl'>
							Earned <em>L</em>ove
						</h2>
						<p className='text-lg md:text-xl lg:text-2xl'>
							Blue Nomad makes me feel...
						</p>
						<Button
							variant={'outline'}
							size={'lg'}
							className='h-auto uppercase rounded-full py-2 px-12 mt-6'
						>
							Your <br /> Turn
						</Button>
					</div>

					{testimonials.map((testimonial, index) => {
						const totalTestimonials = testimonials.length;
						const θ = (2 * Math.PI * index) / totalTestimonials;
						const x = Math.cos(θ) * radiusX;
						const y = Math.sin(θ) * radiusY;

						return (
							<div
								key={index}
								className='absolute top-1/2 left-1/2'
								style={{
									transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
								}}
							>
								<figure className='flex flex-col'>
									<div className='relative w-[100px] h-[150px]'>
										<Image
											src={testimonial.image}
											alt={`Picture of ${testimonial.name}`}
											// sizes="100px"
											fill
											style={{
												objectFit: 'cover',
											}}
										/>
									</div>
									<figcaption className='font-semibold uppercase'>
										{testimonial.name}, {testimonial.profession}
									</figcaption>
									<figcaption>{testimonial.description}</figcaption>
								</figure>
							</div>
						);
					})}
				</div>

				{/* Stacked layout for mobile */}
				<div className='flex flex-col items-center gap-4 md:hidden'>
					{/* Central text/CTA */}
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
						<h2 className='uppercase text-xl md:text-2xl lg:text-4xl'>
							Earned <em>L</em>ove
						</h2>
						<p className='text-lg md:text-xl lg:text-2xl'>
							Blue Nomad makes me feel...
						</p>
						<Button
							variant={'outline'}
							size={'lg'}
							className='h-auto uppercase rounded-full py-2 px-12 mt-6'
						>
							Your <br /> Turn
						</Button>
					</div>

					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className='relative w-[100px] h-[150px] flex flex-col-reverse'
						>
							<figure className='flex flex-col-reverse'>
								<div className='relative w-[75px] h-[125px]'>
									<Image
										src={testimonial.image}
										alt={`Picture of ${testimonial.name}`}
										// sizes="100px"
										fill
										// style={{
										// 	objectFit: "contain",
										// }}
									/>
								</div>
								<figcaption className='font-semibold uppercase'>
									{testimonial.name}, {testimonial.profession}
								</figcaption>
								<figcaption>{testimonial.description}</figcaption>
							</figure>
						</div>
					))}
				</div>
			</section>

			{/* Social Section */}
			<section className='lg:flex-col items-center px-2 gap-4 bg-media-section-gradient bg-cover text-white min-h-fit py-20 lg:py-32'>
				<h1 className='uppercase pt-12'>Nomad&apos;s Land</h1>
				<p className='text-xl lg:text-2xl'>
					People, Places, & Vibes that Interest Us
				</p>
				<Button
					variant={'outline'}
					size={'lg'}
					className='mx-auto rounded-full border-white'
				>
					<Link
						href='https://www.instagram.com/bluenomadworld'
						className='uppercase'
					>
						@bluenomadworld
					</Link>
				</Button>

				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex gap-2 w-full'>
					{Array.from({ length: 5 }).map((_, index) => (
						// <Skeleton key={index} className={"w-[15rem] h-[20rem]"}></Skeleton>
						<Image
							key={index}
							src={socialMediaImages[index % socialMediaImages.length]} // Alternat ebetween image1 and image2
							alt={`Image ${index + 1}`}
							className='w-full h-auto'
							priority
						/>
					))}
				</div>
			</section>
		</>
	);
}
