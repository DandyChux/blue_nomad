import Image from 'next/image';
import OnyedikaImage from '~/assets/Onyedika Portraits/Onyedika11902.png';
import InteriorImage from '~/assets/studio/interiors2.jpg';
import StudioImage from '~/assets/studio/interiors3.jpg';

export default function About() {
	return (
		<section className='gap-4 lg:gap-32 lg:flex-col pt-32'>
			<div className='flex flex-col lg:flex-row'>
				<div className='flex flex-col items-center md:items-start md:grid md:grid-cols-[repeat(3,_1fr)] md:[grid-auto-rows:auto] lg:gap-x-10 lg:gap-y-20 flex-1 px-6 lg:px-12'>
					<p className='text-xl lg:text-2xl order-3 md:order-none md:col-span-2'>
						<span className='text-2xl lg:text-3xl pr-2'>Blue Nomad</span> was
						born from the intersection of my global business career and an
						enduring passion for beauty, wellness, and culture--a journey that
						has taken me across continents and industries. My path has been
						unconventional - from studying biology to working as a venture
						capital investor in New York and Atlanta, to building startups
						across Lagos, Johannesburg, and Paris. Alongside these ventures, I
						immersed myself in skin health, performing over 10,000 facials as a
						licensed therapist during residencies at Dermalogica SoHo and the
						Four Seasons Tribeca. Through it all, one fundamental truth became
						clear: the wellness industry, as it stands today, is missing the
						mark. It has been confined by narrow ideas of who it is for and what
						it looks like—tethered to familiar images of green juices, Pilates,
						exclusive Swiss longevity clinics, and regional stories that fail to
						resonate with a more diverse and global audience.
					</p>

					<h1 className='col-start-2 row-start-1 uppercase md:text-end self-center md:self-start justify-self-center text-2xl lg:text-[5rem] lg:leading-[6.5rem] order-1 md:order-none md:col-start-3'>
						Our <br /> Sto<em>r</em>y
					</h1>

					<div className='relative w-full h-[500px] order-3 md:order-none md:col-start-1'>
						<Image
							src={OnyedikaImage.src}
							alt='Picture of Onyedikachi'
							sizes='100vw'
							fill
							priority
							className='col-start-1 row-start-2 self-end justify-self-start object-cover'
						/>
					</div>

					<div className='[&>p]:text-lg [&>p]:lg:text-xl order-4 md:order-none md:col-start-2 md:col-span-2'>
						<p>
							In response, I founded Blue Nomad to reimagine wellness through a
							more inclusive, globally inspired lens. Our first experience—a
							175-square-foot skin health studio in a historic Gilded Age
							building near Madison Square Park—offers bespoke facial treatments
							and a curated selection of local and international brands that
							embody culture, function, and soul. This studio is not just a
							place for treatments; it is the first step in a broader vision for
							wellness, inviting a meaningful dialogue with our audience. In
							collaboration with Brooklyn-based Colombian architect Silvana
							Vergara Tobin, we created a space where artistry meets science,
							and skin health becomes a central expression of well-being. Each
							product is personally tested, and every protocol is masterfully
							crafted to offer a transformative experience that transcends the
							surface.
						</p>

						<br />

						<p>
							In an era where wellness has grown impersonal—dominated by large
							corporations and restrictive niche plays—we aspire to be scaled
							artisans, honoring the craft and care that this industry so
							desperately needs, with a vision to reach as many people as
							possible. Blue Nomad is an invitation to explore the dynamism of
							wellness. For the curious and discerning who are dissatisfied with
							derivative offerings and seek substance over trends, we offer a
							profound alternative—a committed and inspired journey toward
							lasting vitality.
						</p>

						<br />

						<p>
							Whether through a visit to our studio, a deep dive into our
							philosophy, or simply as a quiet observer, we welcome you to
							embark on this journey with us.
						</p>

						<div className='flex flex-col text-end'>
							<span className='text-2xl lg:text-3xl'>
								With L<em>ov</em>e,
							</span>
							<span className='text-2xl lg:text-5xl font-bold uppercase'>
								Onyedikachi
							</span>
							<span className='mt-4 text-3xl lg:text-4xl'>
								(b. Akwa Ibom, Nigeria, 1990)
							</span>
						</div>
					</div>
				</div>

				<div className='lg:basis-[30%]'>
					<Image
						src={`${InteriorImage.src}`}
						alt='Picture of the studio'
						className='w-full h-auto'
						width={0}
						height={0}
						sizes='100vw'
						priority
					/>
				</div>
			</div>

			<div className='flex flex-col lg:flex-row'>
				<p className='uppercase flex-1 lg:basis-[70%] text-xl lg:text-3xl italic'>
					We are all all nomads, dancing the delicate dance between movement and
					stillness–– <br /> traversing worlds that are physical, mental, and
					spiritual. <br /> We pick up treasures and leave behind memories.{' '}
					<br /> Clinging to stories and dreams. <br /> Amidst the motion, we
					seek moments of blue: moments of <br /> clarity <br /> of healing, of
					sublime peace. <br /> This delicate dance is the journey of wellness,
					wholly <br /> individual. <br /> How will you honor those moments?{' '}
					<br /> It had better be worthwhile.
				</p>

				<div className='lg:basis-[30%]'>
					<Image
						src={StudioImage}
						alt='Picture of the studio'
						sizes='100vw'
						style={{
							width: '100%',
							height: 'auto',
						}}
					/>
				</div>
			</div>
		</section>
	);
}
