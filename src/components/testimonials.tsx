import { Image } from './ui/image';
import { useViewport } from '~/lib/useViewport';
import { Button } from './ui/button';

import { roundTo } from '~/lib/utils';

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
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Andie%201.webp',
	},
	{
		name: 'Gohar',
		profession: 'artist',
		description: 'Feel inspired',
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Gohar.webp',
	},
	{
		name: 'Kevin',
		profession: 'model',
		description: 'Refresh from within',
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Kevin.webp',
	},
	{
		name: 'Silvana',
		profession: 'architect + interior designer',
		description: 'Relax and unwind',
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Tobin-162.webp',
	},
	{
		name: 'Mawatle',
		profession: 'marketer',
		description: 'Embrace my authentic self',
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Mawatle%201.webp',
	},
	{
		name: 'Ron',
		profession: 'Tech founder',
		description: 'Feel energized!',
		image: 'https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/testimonial/Ron%201.webp',
	},
];

export default function Testimonials() {
	// Define ellipse dimensions
	const { width } = useViewport();
	const totalTestimonials = testimonials.length;
	const ovalWidth = width * 0.7;
	const ovalHeight = 600;
	const radiusX = ovalWidth / 2;
	const radiusY = ovalHeight / 2;

	return (
		<>
			{/* Desktop Layout */}
			<div className='relative w-full h-[750px] self-center hidden md:block mt-32'>
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
					<h2 className='font-medium uppercase text-xl md:text-2xl lg:text-4xl'>
						Earned Love
					</h2>
					<p className='text-lg md:text-xl lg:text-2xl'>
						Blue Nomad makes me...
					</p>
					<Button
						variant='outline'
						size='xl'
						className='h-auto uppercase rounded-full py-2 px-12 mt-6 hidden md:block'
					>
						<a href='#treatments'>
							Your <br /> Turn
						</a>
					</Button>
				</div>

				{testimonials.map((testimonial, index) => {
					const θ = (2 * Math.PI * index) / totalTestimonials;
					let x = Math.cos(θ) * radiusX;
					let y = Math.sin(θ) * radiusY;

					// Round x and y to 3 decimals
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
							<figure
								className='flex flex-col items-center'
								style={{
									transform: 'translate(-50%, -50%)',
								}}
							>
								<div className='relative w-[125px] h-[200px]'>
									<Image
										src={testimonial.image}
										alt={`Picture of ${testimonial.name}`}
										style={{
											objectFit: 'cover',
										}}
										loading='lazy'
									/>
								</div>
								<figcaption className='font-[700] uppercase mt-5 font-source-code-pro'>
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

			{/* Mobile Layout */}
			<div className='flex flex-col items-center gap-4 mt-16 md:hidden relative'>
				<div className='flex flex-col items-center'>
					<h2 className='font-medium uppercase text-xl md:text-2xl lg:text-4xl'>
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
								<div className='relative w-[125px] h-[200px] my-2'>
									<Image
										src={testimonial.image}
										alt={`Picture of ${testimonial.name}`}
										sizes="(max-width: 768px) 125px, 125px"
										style={{
											objectFit: 'cover',
										}}
									/>
								</div>
								<figcaption className='font-[700] uppercase text-center font-source-code-pro'>
									{testimonial.name}, {testimonial.profession}
								</figcaption>
								<figcaption className='text-center font-source-code-pro'>
									{testimonial.description}
								</figcaption>
							</figure>
						</div>
					))}
				</div>

				<Button
					variant='outline'
					size='xl'
					className='h-auto uppercase rounded-full py-2 px-12 mt-6'
				>
					<a href='#treatments'>
						Your <br /> Turn
					</a>
				</Button>
			</div>
		</>
	);
}
