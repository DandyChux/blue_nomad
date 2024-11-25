import Image from "next/image";
// import EgoHeadshot from '~/assets/Look 5 185.jpg';
import Headshot from "~/assets/Look 4 131.jpg";
import EgoHeadshot from "~/assets/Look 5 185.jpg";
import StudioImage from "~/assets/Look 4 44.jpg";

export default function About() {
	return (
		<section className="p-8 lg:p-16 gap-4 lg:gap-32 lg:flex-col">
			<div className="flex flex-col lg:flex-row">
				<div className="flex flex-col items-center md:items-start md:grid md:grid-cols-[repeat(3,_1fr)] md:[grid-auto-rows:auto] lg:gap-x-10 lg:gap-y-20 flex-1 px-6 lg:px-12">
					<p className="text-xl lg:text-2xl order-3 md:order-none md:col-span-2">
						<span className="text-2xl lg:text-3xl pr-2">Blue Nomad</span> was
						born from the intersection of my global business career and an
						enduring passion for beauty, wellness, and culture a journey that
						has taken me across continents and industries. My path has been
						anything but conventional... from studying biology to working as a
						venture capital investor in New York and Atlanta, to building
						startups across Lagos, Johannesburg, and Paris. Alongside these
						ventures. I immersed myself in skin health, performing over 10,000
						facials as a licensed therapist during residencies at Dermalogica
						Solo and the Four Seasons Tribeca. Through it all, one fundamental
						truth became clear: the wellness industry, as it stands today. is
						missing the mark. It has been confined by narrow ideas of who
						it&apos;s for and what it looks like tethered to familiar images of
						green juices, Pilates, and exorbitantly priced Swiss longevity
						clinics, and regional stories that fail to resonate with a more
						diverse and global audience.
					</p>

					<h1 className="col-start-2 row-start-1 uppercase md:text-end self-center md:self-start justify-self-center text-2xl lg:text-[5rem] lg:leading-[6.5rem] order-1 md:order-none md:col-start-3">
						Our <br /> Sto<em>r</em>y
					</h1>

					<div className="relative w-full h-[500px] order-3 md:order-none md:col-start-1">
						<Image
							src={EgoHeadshot.src}
							alt="Picture of Onyedikachi"
							sizes="100vw"
							fill
							priority
							className="col-start-1 row-start-2 self-end justify-self-start object-cover"
						/>
					</div>

					<div className="[&>p]:text-lg [&>p]:lg:text-xl order-4 md:order-none md:col-start-2 md:col-span-2">
						<p>
							In response, I founded Blue Nomad to reimagine wellness through a
							more inclusive, globally inspired lens. Our first activation a 175
							square foot studio in a historic Gilded Age building near Madison
							Square Park offers bespoke facials and a curated selection of
							local and international brands that embody culture, function, and
							soul. This studio is more than a treatment space; it marks the
							beginning of a broader vision for wellness and invites a
							meaningful dialogue with our audience. In collaboration with
							Brooklyn based Colombian archilect Silvana Vergara Tobin, we
							created a space where artistry meets science and skin health
							becomes a central expression of well being. Each product is
							personally tested, and every protocol thoughtfully developed.
						</p>

						<br />

						<p>
							In an era where wellness has grown more impersonal, dominated by
							large corporations, we aspire to be scaled artisans... honoring
							the craft and care that this industry so desperately needs. Blue
							Nomad invites you to explore the dynamism of wellness. For the
							curious and discerning who are dissatisfied with derivative
							offerings and seck substance over trend, we offer a profound
							alternative a committed and inspired journey to lasting vitality.
						</p>

						<br />

						<p>
							Whether through a visit to our studio, a deep dive into our
							philosophy, or simply as a quiet observer, we welcome you to
							embark on this journey with us.
						</p>

						<div className="flex flex-col text-end">
							<span className="text-2xl lg:text-3xl">
								With L<em>ov</em>e,
							</span>
							<span className="text-2xl lg:text-5xl font-bold uppercase">
								Ònyedikachi
							</span>
							<span className="mt-4 text-3xl lg:text-4xl">
								(b. Akwa Ibom, Nigeria, 1990)
							</span>
						</div>
					</div>
				</div>

				<div className="lg:basis-[30%]">
					<Image
						src={`${Headshot.src}`}
						alt="Picture of the studio"
						className="w-full h-auto"
						width={0}
						height={0}
						sizes="100vw"
						priority
					/>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row">
				<p className="uppercase flex-1 lg:basis-[70%] text-xl lg:text-3xl italic">
					We are all all nomads, dancing the delicate dance between <br />{" "}
					movement and stillness-- <br /> traversing worlds that are physical,
					mental, and spiritual. <br /> We pick up treasures and leave behind
					memories. <br /> Clinging to stories and dreams. <br /> Amidst the
					motion, we seek moments of blue: moments of <br /> clarity <br /> of
					healing, of sublime peace. <br /> This delicate dance is the journey
					of wellness, wholly <br /> individual. <br /> How will you honor those
					moments? <br /> It had better be worthwhile.
				</p>

				<div className="lg:basis-[30%]">
					<Image
						src={StudioImage}
						alt="Picture of the studio"
						sizes="100vw"
						style={{
							width: "100%",
							height: "auto",
						}}
					/>
				</div>
			</div>
		</section>
	);
}
