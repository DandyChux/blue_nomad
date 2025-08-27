import Image from 'next/image';
import Link from 'next/link';
// import TreatmentCards from '~/components/treatment-cards';
import { Button } from '~/components/ui/button';
import { InfiniteMovingCards, MovingCardProps } from '~/components/ui/infinite-moving-cards'
import HeroText from '~/assets/MODERN_WELLNESS.png'

import Partners from '~/components/partners';
// import Testimonials from '~/components/testimonials';
import { Skeleton } from '~/components/ui/skeleton';
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() => import("../components/testimonials"), {
	loading: () => <Skeleton className="h-40 w-full" />
})

const TreatmentCards = dynamic(() => import("../components/treatment-cards"), {
	loading: () => (
		<div className='flex flex-col md:flex-row items-center'>
			<Skeleton className="h-40 w-full flex-1" />
			<Skeleton className="h-40 w-full flex-1" />
			<Skeleton className="h-40 w-full flex-1" />
		</div>
	)
})

export default function Home() {
	const pressBrands: MovingCardProps[] = [
		{
			name: 'Elle',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/elle-logo.svg',
			link: 'https://www.elle.com/nl/interieur/interieur-hotspots/a63482070/wellness-spa-new-york-blue-nomad/'
		},
		{
			name: 'Hospitality Design',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/HD-logo.png',
			link: 'https://hospitalitydesign.com/news/wellness-sustainability/blue-nomad-new-york/'
		},
		{
			name: 'Architectural Digest',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/ad-logo.svg',
			link: 'https://www.architecturaldigest.com/story/how-to-create-home-spa'
		},
		{
			name: 'Altitude',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/attitude-logo.svg',
			link: 'https://www.attitude-mag.com/en/blog/all/2025-02-17-blue-nomad-um-espaco-onde-o-design-se-encontra-com-o-bem-estar/'
		},
		{
			name: 'Elle Decor',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/elle-decor-logo.svg',
			link: 'https://www.elledecor.com/it/viaggi/a63820146/spa-bellissima-nel-centro-di-new-york/'
		},
		{
			name: 'Flatiron',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/flatiron-logo.svg',
			link: 'https://flatironnomad.nyc/2025/03/05/february-news-roundup-6/'
		},
		{
			name: 'House and Garden',
			image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/house-and-garden.svg',
			link: 'https://www.houseandgarden.co.za/'
		}
	]

	return (
		<>
			{/* Hero Section */}
			<section className='relative p-0 text-brand-white'>
				<div className="absolute inset-0 -z-10">
					<Image
						src="/studio_background.jpg"
						alt="Background"
						fill
						priority
						fetchPriority='high'
						placeholder="blur"
						blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYiPjwvcmVjdD48L3N2Zz4="
						className="object-cover xl:object-cover object-center"
						sizes="100vw"
					/>
				</div>

				<div className='flex flex-col m-[auto_0] pl-14 md:pl-8 pt-16 pb-8 gap-8 lg:gap-12 place-self-center'>
					<p className='uppercase w-full md:w-auto text-2xl lg:text-4xl'>
						<span>modern wellness</span> <br />
						<span className='pl-4 md:pl-8'>inspired</span> <br />
						<span className='pl-8 md:pl-16'>by worlds</span> <br />
						<span className='pl-12 md:pl-24'>near, far, and within</span>
					</p>
					<Button variant={'outline'} className='uppercase self-start rounded-full h-auto py-2 border-brand-white md:text-brand-white hover:border-black' size={'lg'}>
						<Link href='#treatments'>
							Discover <br /> skin health
						</Link>
					</Button>
				</div>
			</section>

			{/* Our Story Section */}
			<section className='py-12 px-8 lg:items-center'>
				<div className='relative flex-1'>
					<Image
						src={'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Christian/Look%204%20139.webp'}
						alt=''
						width={400}
						height={600}
						quality={85}
						sizes="(max-width: 768px) 100vw, 400px"
						className='w-full h-auto'
					/>
				</div>

				<div className='flex-[1_1_30%] flex flex-col items-center gap-10 mt-6'>
					<p className='text-center text-xl lg:text-3xl'>
						Reimagining wellness by creating <br /> distinctive experiences,
						guiding curious <br /> minds on transformative journeys <br />{' '}
						from urban alcoves to distant escapes.
					</p>

					<p className='uppercase text-center text-3xl lg:text-6xl max-w-[750px]'>
						{' '}
						For the curious & discernin
						<span className='lowercase text-[2.5rem] lg:text-8xl'>g</span>
					</p>

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
					Tradition meets science for skin health and well-being
				</p>
				<TreatmentCards />

				{/* Partners Section */}
				<Partners />
			</section>

			{/* Testimonial Section */}
			<section className='lg:flex-col px-4 md:px-8 lg:px-12 mb-20'>
				<figure className='flex flex-col mb-12 lg:mb-16'>
					<blockquote className='uppercase text-base lg:text-5xl hidden md:block break-keep'>
						<p>I seek out brands</p>{' '}
						<p className='pl-[5%] lg:pl-[10%]'>
							From diverse origins, curating those
						</p>{' '}
						<p>
							That are efficacious, cultured, and{' '}
							<span className='lowercase lg:text-6xl'>g</span>
							enuine-each
						</p>{' '}
						<p>with an ethos that</p>
						<p className='pl-[40%] lg:pl-[25%]'>
							<span className='lowercase lg:text-6xl'>g</span>oes skin
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
							<span className='lowercase text-xl lg:text-6xl'>g</span>
							enuine-each with an ethos that
						</p>{' '}
						<p></p>
						<p className='pl-[40%] lg:pl-[25%]'>
							<span className='lowercase text-xl lg:text-6xl'>g</span>oes skin
							deep.
						</p>
					</blockquote>

					<figcaption className='flex flex-col-reverse md:flex-row gap-2 place-self-end mt-4 lg:mt-0'>
						<div className='place-self-end flex flex-col'>
							<p className='text-xl lg:text-2xl self-end'>Onyedikachi</p>
							<small className='lg:text-lg self-end'>Founder</small>
						</div>
						<Link href='/about'>
							<Image
								src={'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Onyedika/Founder.webp'}
								alt='Onyedikachi'
								width={250}
								height={300}
								sizes="(max-width: 768px) 80vw, 250px"
								placeholder='blur'
								blurDataURL='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ij48L3JlY3Q+PHJlY3Qgd2lkdGg9IjYwJSIgaGVpZ2h0PSI2MCUiIHg9IjIwJSIgeT0iMjAlIiBmaWxsPSIjZWVlZWVlIiBvcGFjaXR5PSIwLjQiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC4yOzAuNTswLjIiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9yZWN0Pjwvc3ZnPg=='
							/>
						</Link>
					</figcaption>
				</figure>

				{/* Testimonials */}
				<Testimonials />
			</section>

			{/* Press Section */}
			<section className='min-h-[unset] items-center p-2 relative lg:py-20 lg:flex-col overflow-hidden flex flex-col md:block'>
				<h1 className='uppercase md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:z-20 text-3xl md:text-4xl md:flex md:items-center md:h-full pl-4 md:pl-8'>
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
		</>
	);
}
