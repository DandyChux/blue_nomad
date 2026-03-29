<script>
	import { generateSrcSet } from "$lib/utils";
</script>

<svelte:head>
	<title>Our Story | BLUE NOMAD: A Private Skin Health Studio in NYC</title>
</svelte:head>

<section class="gap-4 lg:gap-32 lg:flex-col pt-40">
	<div class="flex flex-col lg:flex-row">
		<div
			class="flex flex-col items-center md:items-start md:grid md:grid-cols-[repeat(3,_1fr)] md:[grid-auto-rows:auto] lg:gap-x-10 lg:gap-y-20 flex-1 lg:px-12 px-4"
		>
			<p
				class="text-xl lg:text-2xl order-3 pt-10 md:pt-0 md:order-none md:col-span-2 font-spectral"
			>
				<span class="text-2xl lg:text-3xl pr-2">Blue Nomad</span>
				was born at the intersection of my global business career and an enduring
				passion for beauty, wellness, and culture—a journey that has taken
				me across continents and industries. My path has been unconventional:
				from studying biology to working as a venture capital investor in
				New York and Atlanta, to building startups in Lagos, Johannesburg,
				and Paris. Alongside these ventures, I immersed myself in the study
				of skin health, performing thousands of facials as a licensed skin
				therapist during residencies at Dermalogica SoHo and the Four Seasons
				Tribeca. Through it all, one truth became clear: the wellness industry,
				as it stands, is missing the mark. It remains confined by narrow ideas
				of who it is for and what it looks like—tethered to familiar images
				of green juices, Swiss longevity clinics, and regional stories that
				fail to resonate with a more diverse, global audience. In response,
				I founded Blue Nomad, a conceptual approach to wellness that is both
				inclusive and globally inspired.
			</p>

			<h1
				class="col-start-2 row-start-1 uppercase md:text-end self-start justify-self-center text-2xl lg:text-[5rem] lg:leading-[6.5rem] order-1 md:order-none md:col-start-3"
			>
				Our <br />
				Story
			</h1>

			<div
				class="relative w-full h-[500px] order-3 md:order-none md:col-start-1 my-6 md:my-0"
			>
				<img
					src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Onyedika/Onyedika11902.webp"
					srcset={generateSrcSet(
						"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Onyedika/Onyedika11902.webp",
						[500, 1000, 1500, 2000],
						"webp",
						85,
					)}
					alt="Onyedikachi, founder of Blue Nomad"
					class="col-start-1 row-start-2 self-end justify-self-start object-cover w-full h-full"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
				/>
			</div>

			<div
				class="[&>p]:text-xl [&>p]:lg:text-2xl order-4 md:order-none md:col-start-2 md:col-span-2"
			>
				<p class="font-spectral">
					Recognizing the skin as a key indicator of overall
					well-being, our journey begins in an intimate skin health
					studio near Madison Square Park. Here, we offer bespoke,
					seasonally evolving facial treatments paired with curated
					selections of local and international brands that embody
					culture, function, and soul.
				</p>

				<br />

				<p class="font-spectral">
					This studio is not just a place for treatments; it is the
					first step in our broader vision for wellness. In
					collaboration with Brooklyn-based Colombian architect
					Silvana Vergara Tobin, we created a space where artistry
					meets science, and skin health becomes a central expression
					of well-being. Each product is personally tested, and every
					protocol is masterfully crafted to offer a transformative
					experience that transcends the surface.
				</p>

				<br />

				<p class="font-spectral">
					Blue Nomad is an invitation to explore the dynamism of
					wellness. For the curious and discerning who are
					dissatisfied with derivative offerings and seek substance
					over trends, we offer a profound alternative—a committed and
					inspired journey toward lasting vitality.
				</p>

				<br />

				<p class="font-spectral">
					Whether through a visit to our studio, a deep dive into our
					philosophy, or simply as a quiet observer, we welcome you to
					embark on this journey with us.
				</p>

				<div class="flex flex-col text-end mt-4">
					<span class="text-2xl lg:text-3xl">With love,</span>
					<span class="text-2xl lg:text-5xl font-bold uppercase">
						Onyedikachi
					</span>
					<span class="mt-4 text-2xl lg:text-4xl">
						(b. Akwa Ibom, Nigeria, 1990)
					</span>
				</div>
			</div>
		</div>

		<div class="lg:basis-[30%] mt-10 lg:mt-0">
			<img
				src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/interiors2.webp"
				srcset={generateSrcSet(
					"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/interiors2.webp",
					[400, 800, 1200, 1600],
					"webp",
					85,
				)}
				alt="Blue Nomad studio interior"
				class="w-full h-auto"
				width="400"
				height="600"
				sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
			/>
		</div>
	</div>

	<div class="flex flex-col lg:flex-row">
		<p
			class="uppercase flex-1 lg:basis-[70%] text-xl lg:text-3xl italic space-y-2"
		>
			We are all nomads, dancing the delicate dance <br />
			between movement and stillness—
			<br />
			traversing worlds that are physical, mental, and spiritual.
			<br />
			We pick up treasures and leave behind memories.
			<br />
			Clinging to stories and dreams.
			<br />
			Amidst the motion, we seek moments of blue:
			<br />
			moments of clarity
			<br />
			of healing, of sublime peace.
			<br />
			This delicate dance is the journey of wellness,
			<br />
			wholly individual.
			<br />
			How will you honor those moments?
			<br />
			It had better be worthwhile.
		</p>

		<div class="lg:basis-[30%] mt-8 lg:mt-0">
			<img
				src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/interiors3.webp"
				srcset={generateSrcSet(
					"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/interiors3.webp",
					[400, 800, 1200, 1600],
					"webp",
					85,
				)}
				alt="Blue Nomad studio treatment room"
				width="400"
				height="600"
				class="w-full h-auto"
				loading="lazy"
				sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
			/>
		</div>
	</div>
</section>
