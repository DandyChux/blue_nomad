import Image from 'next/image';
import Link from 'next/link';
import EgoHeadshot from '~/assets/Ego with text.png';
import Headshot from '~/assets/Look 4 139.jpg';
import OnyedikaHeadshot from '~/assets/Onyedika Portraits/Founder.png';
import TreatmentCards from '~/components/treatment-cards';
import { Button } from '~/components/ui/button';

import StudioImage from '~/assets/studio/interiors2.jpg';
import Partners from '~/components/partners';
import Testimonials from '~/components/testimonials';

export default function Home() {
	return (
		<>
			{/* Hero Section */}
			<section className='p-0 bg-hero-section-gradient bg-no-repeat 2xl:bg-cover'>
				<div className='flex flex-col flex-1 items-center px-8 pt-16 pb-8 gap-8 lg:gap-12 place-self-center'>
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

					<Button className='uppercase' variant='outline' size={'xl'}>
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
					className='flex flex-col lg:flex-row flex-1 place-items-center p-4 pl-12 md:pl-8 lg:pl-20 [background-position-y:40%] lg:bg-center min-h-[50dvh] md:min-h-[75dvh] lg:min-h-0'
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
							Reimagining wellness by creating <br /> timesless experiences,
							guiding curious <br /> minds on transformative journeys <br />{' '}
							from urban alcoves to distant escapes.
						</p>

						<h1 className='uppercase text-center text-3xl font-normal lg:text-6xl max-w-[750px]'>
							{' '}
							For the curious & discernin
							<span className='lowercase text-4xl lg:text-8xl'>g</span>
						</h1>

						<Button className='uppercase' variant={'outline'} size={'xl'}>
							<Link href='/about'>
								Our <br /> story
							</Link>
						</Button>
					</div>
				</section>

				{/* Treatments Section */}
				<section className='lg:flex-col items-center' id='treatments'>
					<h1 className='uppercase'>Treatments</h1>
					<p className='text-lg lg:text-xl text-center'>
						Exploring tradition and science for an experience that is both
						functional and soulful
					</p>
					<TreatmentCards />

					{/* Partners Section */}
					<Partners />
				</section>

				{/* Testimonial Section */}
				<section className='lg:flex-col px-4 md:px-8 lg:px-12 pb-20'>
					<figure className='flex flex-col'>
						<blockquote className='uppercase text-base lg:text-5xl hidden md:block'>
							<p>I seek out brands</p>{' '}
							<p className='pl-[5%] lg:pl-[10%]'>
								From diverse origins, curating those
							</p>{' '}
							<p>
								That are efficacious, cultured, and{' '}
								<span className='lowercase text-lg lg:text-6xl'>g</span>
								enuine-each
							</p>{' '}
							<p>with an ethos that</p>
							<p className='pl-[40%] lg:pl-[25%]'>
								<span className='lowercase text-lg lg:text-6xl'>g</span>oes skin
								deep.
							</p>
						</blockquote>
						<blockquote className='md:hidden uppercase text-base lg:text-5xl'>
							<p>I seek out brands</p>{' '}
							<p className='pl-[5%] lg:pl-[10%]'>
								From diverse origins, curating those
							</p>{' '}
							<p>
								That are efficacious, cultured, and{' '}
								<span className='lowercase text-lg lg:text-6xl'>g</span>
								enuine-each with an ethos that
							</p>{' '}
							<p></p>
							<p className='pl-[40%] lg:pl-[25%]'>
								<span className='lowercase text-lg lg:text-6xl'>g</span>oes skin
								deep.
							</p>
						</blockquote>

						<figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end mt-4'>
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
					<Testimonials />
				</section>

				{/* Social Section */}
				{/* <section className='lg:flex-col items-center px-2 gap-4 bg-media-section-gradient bg-cover lg:bg-top bg-no-repeat text-white min-h-fit pt-0 pb-8 lg:pb-32'>
					<h1 className='uppercase pt-12'>Nomad&apos;s Land</h1>
					<p className='text-xl lg:text-2xl'>
						People, Places, and Ideas that Interest Us
					</p>
					<Button
						variant={'outline'}
						size={'xl'}
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
