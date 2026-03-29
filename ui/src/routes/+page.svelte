<script lang="ts">
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import InfiniteMovingCards, {
		type MovingCardProps,
	} from "$lib/components/infinite-moving-cards.svelte";
	import StudioBackground from "$lib/assets/studio_background.jpg?enhanced";
	import TreatmentCards from "$lib/components/treatment-cards.svelte";
	import Partners from "$lib/components/partners.svelte";
	import Testimonials from "$lib/components/testimonials.svelte";
	import { SITE_TITLE } from "./+layout.svelte";
	import { generateSrcSet } from "$lib/utils";

	const pressBrands: MovingCardProps[] = [
		{
			name: "Elle",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/elle-logo.svg",
			link: "https://www.elle.com/nl/interieur/interieur-hotspots/a63482070/wellness-spa-new-york-blue-nomad/",
		},
		{
			name: "Hospitality Design",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/HD-logo.png",
			link: "https://hospitalitydesign.com/news/wellness-sustainability/blue-nomad-new-york/",
		},
		{
			name: "Architectural Digest",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/ad-logo.svg",
			link: "https://www.architecturaldigest.com/story/how-to-create-home-spa",
		},
		{
			name: "Altitude",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/attitude-logo.svg",
			link: "https://www.attitude-mag.com/en/blog/all/2025-02-17-blue-nomad-um-espaco-onde-o-design-se-encontra-com-o-bem-estar/",
		},
		{
			name: "Elle Decor",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/elle-decor-logo.svg",
			link: "https://www.elledecor.com/it/viaggi/a63820146/spa-bellissima-nel-centro-di-new-york/",
		},
		{
			name: "Flatiron",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/flatiron-logo.svg",
			link: "https://flatironnomad.nyc/2025/03/05/february-news-roundup-6/",
		},
		{
			name: "House and Garden",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/house-and-garden.svg",
			link: "https://www.houseandgarden.co.za/",
		},
		{
			name: "Archello",
			image: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/archello.svg",
			link: "https://archello.com",
		},
	];
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
</svelte:head>

<!-- Hero Section -->
<section
	class="relative p-0 text-brand-white bg-studio-background bg-cover bg-no-repeat bg-center"
>
	<div
		class="flex flex-col m-[auto_0] pl-14 md:pl-8 pt-16 pb-8 gap-8 lg:gap-12 place-self-center"
	>
		<p class="uppercase w-full md:w-auto text-2xl lg:text-4xl">
			<span>modern wellness</span>
			<br />
			<span class="pl-4 md:pl-8">inspired</span>
			<br />
			<span class="pl-8 md:pl-16">by worlds</span>
			<br />
			<span class="pl-12 md:pl-24">near, far, and within</span>
		</p>
		<!-- <div
			class="flex flex-col text-2xl lg:text-4xl uppercase"
			style="--indent: 1.5rem"
		>
			<p>modern wellness</p>
			<p style="margin-inline-start: calc(var(--indent) + 8px)">
				inspired
			</p>
			<p style="margin-inline-start: calc(var(--indent) + 36px)">
				by worlds
			</p>
			<p style="margin-inline-start: calc(var(--indent) + 48px)">
				near, far, and within
			</p>
		</div> -->

		<Button
			variant="outline"
			class="uppercase self-start rounded-full h-auto py-2 px-8 border-brand-white md:text-brand-white hover:border-black text-center font-source-code-pro"
			size="lg"
			href="#treatments"
		>
			Discover <br />
			skin health
		</Button>
	</div>
</section>

<!-- Our Story Section -->
<section class="py-12 px-8 lg:items-center">
	<div class="relative flex-1">
		<img
			src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Christian/Look%204%20139.webp"
			srcset={generateSrcSet(
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Christian/Look%204%20139.webp",
				[400, 800, 1200, 1600],
				"webp",
				85,
			)}
			alt=""
			width="400"
			height="600"
			class="w-full h-auto"
			loading="lazy"
			sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
		/>
	</div>

	<div class="flex-[1_1_30%] flex flex-col items-center gap-10 mt-6">
		<p class="text-center text-xl lg:text-3xl">
			Reimagining wellness by creating <br />
			distinctive experiences, guiding curious
			<br />
			minds on transformative journeys
			<br />
			from urban alcoves to distant escapes.
		</p>

		<p class="uppercase text-center text-3xl lg:text-6xl max-w-[750px]">
			For the curious & discernin
			<span class="lowercase text-[2.5rem] lg:text-8xl">g</span>
		</p>

		<Button
			variant="link"
			href="/about"
			class={buttonVariants({
				variant: "outline",
				class: "uppercase rounded-full h-auto text-center font-source-code-pro tracking-tight",
				size: "xl",
			})}
		>
			Our <br />
			story
		</Button>
	</div>
</section>

<!-- Treatments Section -->
<section class="lg:flex-col items-center" id="treatments">
	<h1 class="uppercase">Treatments</h1>
	<p class="text-lg lg:text-xl text-center">
		Tradition meets science for skin health and well-being
	</p>
	<TreatmentCards />
	<Partners />
</section>

<!-- Testimonial Section -->
<section class="lg:flex-col px-4 md:px-8 lg:px-12 mb-20">
	<figure class="flex flex-col mb-12 lg:mb-16">
		<!-- Desktop blockquote -->
		<blockquote
			class="uppercase text-base lg:text-5xl hidden md:block break-keep"
		>
			<p>I seek out brands</p>
			<p class="pl-[5%] lg:pl-[10%]">
				From diverse origins, curating those
			</p>
			<p>
				That are efficacious, cultured, and
				<span class="lowercase lg:text-6xl">g</span>
				enuine-each
			</p>
			<p>with an ethos that</p>
			<p class="pl-[40%] lg:pl-[25%]">
				<span class="lowercase lg:text-6xl">g</span>
				oes skin deep.
			</p>
		</blockquote>

		<!-- Mobile blockquote -->
		<blockquote class="md:hidden uppercase text-base lg:text-5xl">
			<p>I seek out brands</p>
			<p class="pl-[5%] lg:pl-[10%]">
				From diverse origins, curating those
			</p>
			<p>
				That are efficacious, cultured, and
				<span class="lowercase text-xl lg:text-6xl">g</span>
				enuine-each with an ethos that
			</p>
			<p class="pl-[40%] lg:pl-[25%]">
				<span class="lowercase text-xl lg:text-6xl">g</span>
				oes skin deep.
			</p>
		</blockquote>

		<figcaption
			class="flex flex-col-reverse md:flex-row gap-2 place-self-end mt-4 lg:mt-0"
		>
			<div class="place-self-end flex flex-col">
				<p class="text-xl lg:text-2xl self-end">Onyedikachi</p>
				<small class="lg:text-lg self-end">Founder</small>
			</div>
			<a href="/about">
				<img
					src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Onyedika/Founder.webp"
					srcset={generateSrcSet(
						"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Onyedika/Founder.webp",
						[250, 500, 750, 1000],
						"webp",
						85,
					)}
					alt="Onyedikachi"
					width="250"
					height="300"
					loading="lazy"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
				/>
			</a>
		</figcaption>
	</figure>

	<Testimonials />
</section>

<!-- Press Section -->
<section
	class="min-h-[unset] items-center p-2 relative lg:py-20 lg:flex-col overflow-hidden flex flex-col md:block"
>
	<h1
		class="uppercase md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:z-20 text-3xl md:text-4xl md:flex md:items-center md:h-full pl-4 md:pl-8"
	>
		As Seen In
	</h1>
	<div class="w-full md:ml-[275px] lg:ml-[300px]">
		<InfiniteMovingCards
			items={pressBrands}
			direction="right"
			speed="normal"
			class="mask-[linear-gradient(to_right,transparent_0%,white_20%,white_100%)]"
		/>
	</div>
</section>
