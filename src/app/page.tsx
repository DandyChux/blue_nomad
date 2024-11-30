import Image from 'next/image';
import Link from 'next/link';
import EgoHeadshot from '~/assets/Ego with text.png';
import Headshot from '~/assets/Look 4 139.jpg';
import OnyedikaHeadshot from '~/assets/Onyedika Portraits/Founder.png';
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

import StudioImage from '~/assets/studio/interiors2.jpg';

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

type TestimonialProps = {
	name: string;
	profession: string;
	image: string;
	description: string;
};

const testimonials: TestimonialProps[] = [
	{
		name: 'Andie',
		profession: 'fashion producer',
		description: 'Rediscover what feels good',
		image: AndieImage.src,
	},
	{
		name: 'Gohar',
		profession: 'artist',
		description: 'Feel inspired',
		image: GoharImage.src,
	},
	{
		name: 'Kevin',
		profession: 'model',
		description: 'Refresh from within',
		image: KevinImage.src,
	},
	{
		name: 'Silvana',
		profession: 'architect + interior designer',
		description: 'Relax and unwind',
		image: SilvanaImage.src,
	},
	{
		name: 'Mawatle',
		profession: 'marketer',
		description: 'Embrace my authentic self',
		image: MawatleImage.src,
	},
	{
		name: 'Ron',
		profession: 'founder',
		description: 'Feel energized!',
		image: RonImage.src,
	},
];

const socialMediaImages = [SocialMediaImage1, SocialMediaImage2];

export default function Home() {
	// Define ellipse dimensions
	const ovalWidth = 1050;
	const ovalHeight = 600;
	const radiusX = ovalWidth / 2;
	const radiusY = ovalHeight / 2;

	// Define separate dimensions for logos
	const logoOvalWidth = 950;
	const logoOvalHeight = 450;
	const logoRadiusX = logoOvalWidth / 2;
	const logoRadiusY = logoOvalHeight / 2;

	const θ_gap_center = Math.PI / 2; // 90 degrees
	const θ_gap_size = Math.PI / 6; // 30-degree gap
	const θ_gap_start = θ_gap_center - θ_gap_size / 2;
	const θ_gap_end = θ_gap_center + θ_gap_size / 2;
	const θ_total = 2 * Math.PI - θ_gap_size;

	return (
		<>
			{/* Hero Section */}
			<section className='p-0 bg-hero-section-gradient bg-no-repeat'>
				<div className='flex flex-col flex-1 items-center px-8 pt-16 pb-8 md:pt-0 gap-8 lg:gap-12 place-self-center'>
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

					<Button
						className='uppercase rounded-full h-auto py-2 px-12'
						variant='outline'
						size={'lg'}
					>
						<Link href='#treatments'>
							Discover our <br /> first offering
						</Link>
					</Button>

					<div className='relative w-[250px] h-[300px]'>
						<Image
							src={StudioImage.src}
							alt='Image of the studio'
							fill
							sizes='250px'
							// style={{
							// 	objectFit: 'cover',
							// }}
							placeholder='empty'
							priority
						/>
					</div>

					<h1 className='uppercase text-center w-full lg:w-3/5 font-normal text-2xl lg:text-3xl'>
						A Private Skin Health <br className='lg:hidden' /> Studio in NYC
					</h1>
				</div>

				<div
					className='flex flex-col lg:flex-row flex-1 place-items-center p-4 pl-12 md:pl-8 lg:pl-20 [background-position-y:40%] lg:bg-center min-h-[50dvh] lg:min-h-0'
					style={{
						backgroundImage: `url('${EgoHeadshot.src}')`,
						backgroundSize: 'cover',
						backgroundRepeat: 'no-repeat',
					}}
				>
					{/* <p className='uppercase text-2xl lg:text-3xl xl:text-4xl mx-auto lg:mx-0 text-black'>
						Modern <em>Wellness</em> <br />
						Inspired <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By{' '}
						<em>Worlds</em> near, <br />
						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Far,{' '}
						and Within
					</p> */}
				</div>
			</section>

			<div className='bg-background-gradient bg-no-repeat bg-cover bg-top'>
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
							priority
						/>
					</div>

					<div className='flex-[1_1_30%] flex flex-col items-center gap-10 mt-6'>
						<p className='text-center text-xl lg:text-3xl'>
							Reimagines wellness by creating <br /> timesless experiences,
							guiding curious <br /> minds on transformative journeys <br />{' '}
							from urban alcoves to distant escapes.
						</p>

						<h1 className='uppercase text-center text-3xl font-normal lg:text-6xl max-w-[750px]'>
							{' '}
							For the curious & discerning
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
					<h1 className='uppercase'>Treatments</h1>
					<p className='text-lg lg:text-xl'>
						Exploring tradition and science for an experience that is both
						functional and soulful
					</p>
					<TreatmentCards />

					{/* Partners Section */}
					<div className='mt-8 pt-12 md:px-4 lg:px-8 w-full md:flex-col'>
						<p className='lg:text-2xl uppercase text-end'>
							Some Favorites From Near &amp; Far:
						</p>
						<h1 className='uppercase text-lg lg:text-[3rem] text-end my-2 lg:my-6'>
							Our In-Studio Curation
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
								const x = Math.cos(θ) * logoRadiusX;
								const y = Math.sin(θ) * logoRadiusY;

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
											sizes='150px'
											width={250}
											height={80}
											className='w-full h-auto'
										/>
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
				</section>

				{/* Testimonial Section */}
				<section className='lg:flex-col px-4 md:px-8 lg:px-12 pb-20'>
					<figure className='flex flex-col'>
						<blockquote className='uppercase text-base lg:text-5xl hidden md:block'>
							<p>I seek out brands</p>{' '}
							<p className='pl-[5%] lg:pl-[10%]'>
								From diverse origins, curating those
							</p>{' '}
							<p>That are efficacious, cultured, & genuine-each</p>{' '}
							<p>with an ethos that</p>
							<p className='pl-[40%] lg:pl-[25%]'>goes skin deep.</p>
						</blockquote>
						<blockquote className='md:hidden uppercase text-base lg:text-5xl'>
							<p>I seek out brands</p>{' '}
							<p className='pl-[5%] lg:pl-[10%]'>
								From diverse origins, curating those
							</p>{' '}
							<p>
								That are efficacious, cultured, & genuine-each with an ethos
								that
							</p>{' '}
							<p></p>
							<p className='pl-[40%] lg:pl-[25%]'>goes skin deep.</p>
						</blockquote>

						<figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end'>
							<div className='place-self-end flex flex-col'>
								<p className='text-xl lg:text-2xl self-end'>Onyedikachi</p>
								<small className='lg:text-lg self-end'>Founder</small>
							</div>
							<Image
								src={OnyedikaHeadshot}
								alt='Onyedikachi'
								width={250}
								height={300}
								placeholder='empty'
								priority
								// sizes='100vw'
								// className='w-full h-auto'
							/>
						</figcaption>
					</figure>

					{/* Testimonials */}
					<div className='relative w-full h-[750px] self-center hidden md:block mt-32'>
						<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
							<h2 className='uppercase text-xl md:text-2xl lg:text-4xl'>
								Earned Love
							</h2>
							<p className='text-lg md:text-xl lg:text-2xl'>
								Blue Nomad makes me...
							</p>
							<Button
								variant={'outline'}
								size={'lg'}
								className='h-auto uppercase rounded-full py-2 px-12 mt-6 hidden md:block'
							>
								<Link href='#treatments'>
									Your <br /> Turn
								</Link>
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
										<div className='relative w-[125px] h-[200px]'>
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
										<figcaption className='font-semibold uppercase mt-5 font-source-code-pro'>
											{testimonial.name}, {testimonial.profession}
										</figcaption>
										<figcaption className='font-source-code-pro'>
											{testimonial.description}
										</figcaption>
									</figure>
								</div>
							);
						})}
					</div>

					{/* Stacked layout for mobile */}
					<div className='flex flex-col items-center gap-4 mt-16 md:hidden relative'>
						{/* Central text/CTA */}
						<div className='flex flex-col items-center'>
							<h2 className='uppercase text-xl md:text-2xl lg:text-4xl'>
								Earned Love
							</h2>
							<p className='text-lg md:text-xl lg:text-2xl'>
								Blue Nomad makes me ...
							</p>
						</div>

						<div className='grid grid-cols-2 gap-4 w-full'>
							{testimonials.map((testimonial, index) => (
								<div key={index} className='relative w-full h-auto'>
									<figure className='flex flex-col items-center mx-auto'>
										<div className='relative w-[125px] h-[150px] my-2'>
											<Image
												src={testimonial.image}
												alt={`Picture of ${testimonial.name}`}
												// sizes="100px"
												fill
												style={{
													objectFit: 'contain',
												}}
											/>
										</div>
										<figcaption className='font-semibold uppercase text-center'>
											{testimonial.name}, {testimonial.profession}
										</figcaption>
										<figcaption className='text-center'>
											{testimonial.description}
										</figcaption>
									</figure>
								</div>
							))}
						</div>

						<Button
							variant={'outline'}
							size={'lg'}
							className='h-auto uppercase rounded-full py-2 px-12 mt-6'
						>
							<Link href='#treatments'>
								Your <br /> Turn
							</Link>
						</Button>
					</div>
				</section>

				{/* Social Section */}
				{/* <section className='lg:flex-col items-center px-2 gap-4 bg-media-section-gradient bg-cover lg:bg-top bg-no-repeat text-white min-h-fit pt-0 pb-8 lg:pb-32'>
					<h1 className='uppercase pt-12'>Nomad&apos;s Land</h1>
					<p className='text-xl lg:text-2xl'>
						People, Places, and Ideas that Interest Us
					</p>
					<Button
						variant={'outline'}
						size={'lg'}
						className='mx-auto rounded-full border-white py-6'
					>
						<Link
							href='https://www.instagram.com/bluenomadworld'
							className='uppercase'
						>
							@bluenomadworld
						</Link>
					</Button>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-2 w-full'>
						{Array.from({ length: 5 }).map((_, index) => (
							// <Skeleton key={index} className={"w-[15rem] h-[20rem]"}></Skeleton>
							<div key={index} className='relative w-full h-[350px]'>
								<Image
									src={socialMediaImages[index % socialMediaImages.length]} // Alternat ebetween image1 and image2
									alt={`Image ${index + 1}`}
									// sizes="100vw"
									fill
									priority
									style={{
										objectFit: 'cover',
									}}
								/>
							</div>
						))}
					</div>
				</section> */}
			</div>
		</>
	);
}
