import Image from 'next/image';
import Link from 'next/link';
import EgoHeadshot from '~/assets/Ego with text.png';
import Headshot from '~/assets/Look 4 139.jpg';
import OnyedikaHeadshot from '~/assets/Onyedika Portraits/Founder.png';
import TreatmentCards from '~/components/treatment-cards';
import { Button } from '~/components/ui/button';
import { InfiniteMovingCards, MovingCardProps } from '~/components/ui/infinite-moving-cards'

import StudioImage from '~/assets/studio/interiors2.jpg';
import Partners from '~/components/partners';
import Testimonials from '~/components/testimonials';
import ArchitecturalDigestLogo from '~/assets/press logos/ad-logo.svg';
import AltitudeLogo from '~/assets/press logos/attitude-logo.svg';
import ElleDecorLogo from '~/assets/press logos/elle-decor-logo.svg';
import ElleLogo from '~/assets/press logos/elle-logo.svg';
import FlatironLogo from '~/assets/press logos/flatiron-logo.svg';
import HospitalityDesignLogo from '~/assets/press logos/HD-logo.jpg';

export default function Home() {
	const pressBrands: MovingCardProps[] = [
		{
			name: 'Elle',
			image: ElleLogo,
			link: 'https://www.elle.com/nl/interieur/interieur-hotspots/a63482070/wellness-spa-new-york-blue-nomad/'
		},
		{
			name: 'Hospitality Design',
			image: HospitalityDesignLogo,
			link: 'https://hospitalitydesign.com/news/wellness-sustainability/blue-nomad-new-york/'
		},
		{
			name: 'Architectural Digest',
			image: ArchitecturalDigestLogo,
			link: 'https://www.architecturaldigest.com/story/how-to-create-home-spa'
		},
		{
			name: 'Altitude',
			image: AltitudeLogo,
			link: 'https://www.attitude-mag.com/en/blog/all/2025-02-17-blue-nomad-um-espaco-onde-o-design-se-encontra-com-o-bem-estar/'
		},
		{
			name: 'Elle Decor',
			image: ElleDecorLogo,
			link: 'https://www.elledecor.com/it/viaggi/a63820146/spa-bellissima-nel-centro-di-new-york/'
		},
		{
			name: 'Flatiron',
			image: FlatironLogo,
			link: 'https://flatironnomad.nyc/2025/03/05/february-news-roundup-6/'
		},
	]

	return (
		<>
			{/* Hero Section */}
			<section className='p-0 bg-no-repeat xl:bg-cover bg-studio-background text-pale-grey'>
				<div className='flex flex-col m-[auto_0] px-8 pt-16 pb-8 gap-8 lg:gap-12 place-self-center'>
					<p className='uppercase w-full lg:w-11/12 font-normal text-2xl lg:text-4xl'>
						modern <em>wellness</em> <br /> &nbsp;&nbsp;inspired <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;by worlds <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;near, far, and within
					</p>
					<p className='uppercase text-lg lg:text-xl'>
						latest release - a private skin health studio in NYC
					</p>
					<Button className='uppercase self-start rounded-full border-pale-grey' variant='outline' size={'lg'}>
						<Link href='#treatments'>
							Discover
						</Link>
					</Button>
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
							Reimagining wellness by creating <br /> distinctive experiences,
							guiding curious <br /> minds on transformative journeys <br />{' '}
							from urban alcoves to distant escapes.
						</p>

						<h1 className='uppercase text-center text-3xl font-normal lg:text-6xl max-w-[750px]'>
							{' '}
							For the curious & discernin
							<span className='lg:lowercase lg:text-8xl'>g</span>
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
								<span className='lg:lowercase lg:text-6xl'>g</span>
								enuine-each
							</p>{' '}
							<p>with an ethos that</p>
							<p className='pl-[40%] lg:pl-[25%]'>
								<span className='lg:lowercase lg:text-6xl'>g</span>oes skin
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
								<span className='lg:lowercase lg:text-6xl'>g</span>
								enuine-each with an ethos that
							</p>{' '}
							<p></p>
							<p className='pl-[40%] lg:pl-[25%]'>
								<span className='lg:lowercase lg:text-6xl'>g</span>oes skin
								deep.
							</p>
						</blockquote>

						<figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end mt-4'>
							<div className='place-self-end flex flex-col'>
								<p className='text-xl lg:text-2xl self-end'>Onyedikachi</p>
								<small className='lg:text-lg self-end'>Founder</small>
							</div>
							<Link href='/about'>
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
							</Link>
						</figcaption>
					</figure>

					{/* Testimonials */}
					<Testimonials />
				</section>

				{/* Press Section */}
				<section className='min-h-[unset] items-center px-2 relative py-20 lg:flex-col overflow-hidden flex flex-col md:block'>
					<h1 className='uppercase md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:z-20 text-3xl md:text-4xl font-bold md:flex md:items-center md:h-full pl-4 md:pl-8'>
						As Seen In
					</h1>
					<div className='w-full md:ml-[275px] lg:ml-[300px]'>
						<InfiniteMovingCards
							items={pressBrands}
							direction='right'
							speed='normal'
							className="[mask-image:linear-gradient(to_right,transparent_0%,white_20%,white_100%)]"
						/>
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
