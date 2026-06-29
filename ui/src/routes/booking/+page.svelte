<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Empty from "$lib/components/ui/empty";
	import * as Item from "$lib/components/ui/item";
	import * as Card from "$lib/components/ui/card";
	import Picture from "$lib/components/picture.svelte";
	import Rating from "$lib/components/rating.svelte";
	import { generateSrcSet, debounce, cn } from "$lib/utils";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import type { CatalogItem } from "$lib/schemas";
	import Video from "$lib/components/video.svelte";
	import InfiniteMovingCards from "$lib/components/infinite-moving-cards.svelte";
	import { pressBrands } from "$lib";
	import { trackEvent } from "$lib/analytics.svelte.js";

	let { data } = $props();
	const services = $derived(data.services as CatalogItem[]);

	// --- URL-Based State ---
	let searchQuery = $derived(page.url.searchParams.get("q") ?? "");
	let currentPage = $derived(
		parseInt(page.url.searchParams.get("page") ?? "1"),
	);
	const perPage = 5;

	function updateFilter(key: string, value: string | number | null) {
		const url = new URL(page.url);
		if (value === null || value === "") url.searchParams.delete(key);
		else url.searchParams.set(key, String(value));
		if (key !== "page") url.searchParams.delete("page");
		goto(url, { keepFocus: true, replaceState: true, noScroll: true });
	}

	const debouncedSearch = debounce((q: string) => updateFilter("q", q), 300);

	let filteredServices = $derived(
		services.filter((s) => {
			const name = s.item_data?.name?.toLowerCase() || "";
			return name.includes(searchQuery.toLowerCase());
		}),
	);

	let paginatedServices = $derived(
		filteredServices.slice(
			(currentPage - 1) * perPage,
			currentPage * perPage,
		),
	);

	// Split into featured (first) and the rest
	const coreTreatment = $derived(
		paginatedServices.find((s) => s.id === "TWYSCIC46EIMS3SD2A6UMJ5H") ??
			paginatedServices[0] ??
			null,
	);
	const remaining = $derived(
		filteredServices.filter(
			(s) =>
				s.id !== "TWYSCIC46EIMS3SD2A6UMJ5H" &&
				s.id !== "W3E6HQXJJYYRQXT5LXSCVVSF" &&
				s.id !== "TP44ASSCFLTJZRS4THKLJMTF",
		),
	);

	// Helpers
	const getDuration = (s: CatalogItem) =>
		(
			(s.item_data.variations?.[0]?.item_variation_data
				?.service_duration || 0) / 60000
		).toFixed(0);
	const getPrice = (s: CatalogItem) =>
		(
			(s.item_data.variations?.[0]?.item_variation_data?.price_money
				?.amount || 0) / 100
		).toFixed(0);

	// Search bar visibility toggle
	let showSearch = $state(false);

	let featuredTreatmentId = $derived(coreTreatment?.id ?? null);

	const testimonials = [
		{
			quote: "Calming, relaxing, informative, honest. Highly recommend! My skin feels and looks great.",
			author: "Anna, BK",
			rating: 5,
		},
		{
			quote: "Come here for a bespoke and private treatment in a space that feels like…a new home.",
			author: "Siba, Bed-Stuy",
			rating: 5,
		},
		{
			quote: "What an incredible experience! 10/10 recommend!!! I'm hooked.",
			author: "Ron, West Village",
			rating: 5,
		},
	];

	// Intersection Observer to trigger animation on scroll
	let testimonialsEl = $state<HTMLDivElement>();
	let testimonialsVisible = $state(false);

	$effect(() => {
		if (!testimonialsEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					testimonialsVisible = true;
					observer.unobserve(testimonialsEl!);
				}
			},
			{ threshold: 1 },
		);
		observer.observe(testimonialsEl);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Treatments | Blue Nomad</title>
</svelte:head>

<section class="min-h-screen w-full flex flex-col p-0">
	<!-- ======================== -->
	<!-- HERO: Full-bleed Video   -->
	<!-- ======================== -->
	<div class="relative w-full h-[85vh] overflow-hidden bg-black">
		<!-- Video Background -->
		<Video
			poster="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/hero-poster.jpg"
			class="absolute inset-0 w-full h-full object-cover opacity-60"
			sources={[
				{
					src: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/videos/Blue%20Nomad%20-%20Treatment%20V1.webm",
					type: "video/webm",
				},
				{
					src: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/videos/Blue%20Nomad%20-%20Treatment%20V1.mp4",
					type: "video/mp4",
				},
			]}
		/>

		<!-- Gradient Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
		></div>

		<!-- Hero Content -->
		<div
			class="absolute inset-0 text-brand-white flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 lg:pb-24 w-full"
		>
			<p
				class="font-source-code-pro text-[11px] lg:text-[16px] uppercase tracking-[0.3em] text-brand-white/60 mb-4 font-extrabold text-center lg:text-start"
				in:fly={{ y: 10, duration: 600, delay: 200 }}
			>
				Blue Nomad Skin Health Studio
			</p>
			<h1
				class="uppercase text-center lg:text-left text-[32px] lg:text-[72px] tracking-tighter font-light leading-[0.9] mb-6"
				in:fly={{ y: 20, duration: 600, delay: 300 }}
			>
				<span>Your Skin</span>
				<br />
				Our Practice
				<!-- <br />
				<span class="pl-8 md:pl-16">Everything Around</span> -->
			</h1>
			<p
				class="text-brand-white/70 md:text-[18px] max-w-xl leading-relaxed font-light text-center"
				in:fly={{ y: 20, duration: 600, delay: 400 }}
			>
				Personalized treatments designed to restore, protect, and
				support long-term skin health.
			</p>

			<Button
				variant="link"
				href={`/booking/${featuredTreatmentId}`}
				size="xl"
				class={buttonVariants({
					variant: "outline",
					class: "border-brand-white text-brand-white rounded-full mt-10 border self-center px-8 uppercase tracking-wide font-source-code-pro font-light hover:bg-brand-white hover:text-black",
				})}
			>
				Explore Treatments
			</Button>
		</div>
	</div>

	{#if paginatedServices.length === 0}
		<div class="w-full flex justify-center py-32">
			<Empty.Root
				class="border border-dashed w-full max-w-xl min-h-[400px] flex flex-col items-center justify-center bg-transparent"
			>
				<Empty.Header>
					<Empty.Title
						class="uppercase font-source-code-pro font-normal tracking-widest text-sm"
					>
						No treatments found.
					</Empty.Title>
				</Empty.Header>
			</Empty.Root>
		</div>
	{:else}
		<div class="flex flex-col lg:flex-row">
			{#if coreTreatment}
				<Card.Root
					class="relative group w-full p-4 overflow-hidden mx-auto my-10 lg:mx-0 lg:my-0 lg:w-[35%] lg:h-[1100px] lg:rounded-tl-none bg-transparent ring-0 shadow-none"
				>
					<Picture
						src={coreTreatment.image_url || ""}
						alt={coreTreatment.item_data.name}
						class="size-full object-cover object-top"
						loading="eager"
						sizes="(max-width: 768px) 100vw, 50vw"
						sources={coreTreatment.image_url
							? [
									{
										type: "image/webp",
										srcset: generateSrcSet(
											coreTreatment.image_url,
											[400, 600],
											"webp",
											85,
										),
									},
								]
							: []}
					/>

					<!-- <div class="absolute inset-0 bg-black/10" /> -->

					<!-- Mobile only description -->
					<div
						class="absolute inset-0 flex flex-col p-6 text-warm-ivory md:p-8 lg:hidden"
					>
						<div class="flex items-center">
							<h2
								class="font-source-code-pro text-[12px] uppercase font-semibold tracking-wider underline-offset-8 underline"
							>
								Core Treatment
							</h2>
							<p class="uppercase font-semibold ml-auto">
								{getDuration(coreTreatment)} Min — ${getPrice(
									coreTreatment,
								)}
							</p>
						</div>
						<p
							class="uppercase text-[36px] lg:text-[44px] tracking-tighter font-light leading-[0.95] my-4"
						>
							{coreTreatment.item_data.name}
						</p>
						<p
							class="mb-6 font-source-code-pro font-medium line-clamp-3 text-ellipsis"
						>
							{coreTreatment.item_data.description ||
								"A curated experience focused on restoration and results."}
						</p>

						<Button
							variant="link"
							href={`/booking/${coreTreatment.id}`}
							class={buttonVariants({
								variant: "outline",
								class: "rounded-full uppercase border-inherit text-inherit mt-[75%] font-source-code-pro w-fit mx-auto",
								size: "xl",
							})}
							onclick={() =>
								trackEvent("Clicked Treatment", {
									props: {
										treatment: coreTreatment.item_data.name,
									},
								})}
						>
							Book Now
						</Button>
					</div>
				</Card.Root>
				<div
					class="float-right flex-1 px-4 lg:px-8 py-28 lg:py-40 hidden lg:block"
				>
					<h2
						class="font-source-code-pro text-[18px] uppercase font-semibold tracking-wider underline-offset-8 block mb-12 underline"
					>
						Core Treatment
					</h2>
					<p
						class="uppercase text-4xl lg:text-7xl tracking-tighter font-light leading-[0.95] my-4"
					>
						{coreTreatment.item_data.name}
					</p>
					<p
						class="text-lg leading-relaxed mb-6 font-source-code-pro font-medium w-9/10 tracking-widest"
					>
						{coreTreatment.item_data.description ||
							"A curated experience focused on restoration and results."}
					</p>
					<div class="space-y-6 font-source-code-pro">
						<p
							class="text-base uppercase tracking-widest font-semibold"
						>
							{getDuration(coreTreatment)} Min — ${getPrice(
								coreTreatment,
							)}
						</p>
						<Button
							variant="link"
							href={`/booking/${coreTreatment.id}`}
							class={buttonVariants({
								variant: "outline",
								class: "rounded-full uppercase font-source-code-pro",
								size: "xl",
							})}
							onclick={() =>
								trackEvent("Clicked Treatment", {
									props: {
										treatment: coreTreatment.item_data.name,
									},
								})}
						>
							Book Now
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<div
			class="relative overflow-hidden px-6 py-10 md:px-10 md:py-14 lg:px-16 lg:py-20"
		>
			<!-- <div
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-[18%] bottom-10 h-28 rounded-full blur-3xl"
			></div> -->

			<div
				class="mx-auto grid max-w-[1380px] grid-cols-2 items-start gap-x-4 gap-y-4 md:gap-x-8 lg:gap-x-10 lg:gap-y-8"
			>
				<div class="col-start-1 row-start-1 justify-self-start">
					<p
						class="text-[36px] leading-none uppercase tracking-[-0.06em] lg:text-[48px]"
					>
						Before
					</p>
				</div>

				<div class="justify-self-end lg:col-start-2 lg:row-start-1">
					<p
						class="text-left font-source-code-pro text-[12px] font-semibold uppercase leading-[1.35] tracking-[0.2em] lg:text-right lg:text-[1.5rem]"
					>
						10 days after
						<br />
						first facial ST
					</p>
				</div>

				<Picture
					src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/Treatment%20After%20(Former).webp"
					alt="Before facial skin therapy result"
					class="col-start-1 row-start-2 aspect-[0.85] w-full rounded-[15px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.28)_inset]"
					loading="eager"
					width={720}
					height={950}
					sizes="(max-width: 1023px) 50vw, 50vw"
					sources={[
						{
							type: "image/webp",
							srcset: generateSrcSet(
								"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/Treatment%20After%20(Former).webp",
								[480, 768, 1024, 1440],
								"webp",
								85,
							),
						},
					]}
				/>

				<Picture
					src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/Treatment%20After%20Final.webp"
					alt="After 10 days facial skin therapy result"
					class="col-start-2 row-start-2 aspect-[0.85] w-full rounded-[15px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.28)_inset]"
					loading="eager"
					width={720}
					height={950}
					sizes="(max-width: 1023px) 50vw, 50vw"
					sources={[
						{
							type: "image/webp",
							srcset: generateSrcSet(
								"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/Treatment%20After%20Final.webp",
								[480, 768, 1024, 1440],
								"webp",
								85,
							),
						},
					]}
				/>

				<p
					class="max-w-[31rem] font-source-code-pro text-[12px] font-semibold leading-[1.65] tracking-[0.18em] md:text-[1.05rem] lg:col-start-1 lg:row-start-3"
				>
					Our core Facial Skin Therapy, a personalized facial designed
					to improve skin health and appearance.
				</p>

				<div class="col-start-2 row-start-3 justify-self-end">
					<p
						class="text-[36px] leading-none uppercase tracking-[-0.06em] lg:text-[48px]"
					>
						After
					</p>
				</div>

				<Button
					variant="link"
					href={`/booking/${coreTreatment.id}`}
					class={buttonVariants({
						size: "lg",
						variant: "outline",
						class: "col-span-2 col-start-1 row-start-4 mt-6 w-fit place-self-center lg:place-self-end rounded-full px-14 lg:col-span-1 lg:col-start-1 lg:row-start-4 lg:mt-0 uppercase font-source-code-pro",
					})}>Book Facial ST</Button
				>
				<Button
					variant="link"
					href="/shop"
					class={buttonVariants({
						size: "lg",
						variant: "outline",
						class: "hidden w-fit rounded-full px-14 lg:col-start-2 lg:row-start-4 lg:block lg:place-self-start uppercase font-source-code-pro",
					})}>Shop</Button
				>
			</div>
		</div>

		<!-- Press Brands -->
		<InfiniteMovingCards
			items={pressBrands}
			direction="right"
			speed="normal"
			class="mask-[linear-gradient(to_right,transparent_0%,white_20%,white_100%)] w-full max-w-[unset] my-16 hidden lg:block"
		/>

		<span
			class="text-[32px] lg:text-[44px] uppercase text-center font-medium"
			>also available</span
		>
		<div
			class="grid auto-rows-fr grid-cols-1 gap-[1px] lg:grid-cols-4 lg:gap-4 px-4"
			in:fade
		>
			{#each remaining as service (service.id)}
				<Card.Root
					class="group relative flex h-full min-w-0 flex-col bg-background lg:bg-transparent shadow-none ring-0 py-0 rounded-none gap-0 my-2 lg:rounded-lg"
				>
					<a
						href="/booking/{service.id}"
						aria-label={`Book ${service.item_data.name}`}
						class="absolute inset-0 z-10"
					></a>

					<Card.Content class="rounded-lg lg:bg-card p-2">
						<div class="relative aspect-4/5 overflow-hidden">
							<Picture
								src={service.image_url || ""}
								alt={service.item_data.name}
								class="block size-full object-cover"
								loading="lazy"
								sizes="(min-width: 1024px) 25vw, 50vw"
								sources={service.image_url
									? [
											{
												type: "image/webp",
												srcset: generateSrcSet(
													service.image_url,
													[320, 480, 640, 768],
													"webp",
													80,
												),
											},
										]
									: []}
							/>
						</div>
					</Card.Content>

					<Card.Footer
						class="items-center lg:items-start justify-between text-foreground lg:bg-transparent lg:flex-col lg:pt-4"
					>
						<div class="lg:self-end order-2 lg:order-1">
							<span
								class="font-source-code-pro text-[12px] lg:text-[14px] font-bold uppercase"
							>
								{getDuration(service)} min{getPrice(service) !==
								"0"
									? ` — $${getPrice(service)}`
									: " – Member Rate"}
							</span>
						</div>
						<h2
							class="text-[14px] lg:text-[32px] uppercase order-1 lg:order-2 tracking-tight line-clamp-1 text-ellipsis"
						>
							{service.item_data.name}
						</h2>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!-- Press Brands -->
	<InfiniteMovingCards
		items={pressBrands}
		direction="right"
		speed="normal"
		class="mask-[linear-gradient(to_right,transparent_0%,white_20%,white_100%)] w-full max-w-[unset] my-16 lg:hidden"
	/>

	<!-- Testimonials -->
	<div
		class="w-full mb-8 lg:my-12 px-6 md:px-12 lg:px-16 overflow-hidden"
		bind:this={testimonialsEl}
	>
		<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
			{#if testimonialsVisible}
				{#each testimonials as testimonial, i}
					<div
						class="flex flex-col items-center text-center gap-6 font-source-code-pro"
						in:fly={{ y: 40, duration: 600, delay: i * 250 }}
					>
						<p class="text-lg lg:text-xl leading-relaxed">
							{testimonial.quote}
						</p>
						<span
							class=" text-sm font-bold uppercase tracking-[0.2em]"
						>
							{testimonial.author}
						</span>
						<Rating value={testimonial.rating} />
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="relative w-full py-8 px-12 lg:p-20">
		<div class="absolute inset-0 m-0 -z-10">
			<enhanced:img
				src={"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/studio/IMG%20Glass.webp"}
				alt="Background"
				class="object-cover xl:object-cover object-center size-full"
			/>
		</div>

		<div
			class="w-full flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-20 text-center"
		>
			<Item.Root
				variant="outline"
				class="px-8 flex-col lg:flex-row text-cold-ivory border-2 border-warm-ivory rounded-2xl"
			>
				<Item.Header
					class="uppercase text-primary-foreground/70 font-source-code-pro"
					>Membership</Item.Header
				>
				<Item.Content>
					<Item.Title
						class="uppercase text-warm-ivory text-2xl w-full justify-center lg:justify-start"
						>Not a member yet?</Item.Title
					>
					<Item.Description
						class="uppercase text-primary-foreground/75 font-source-code-pro text-lg lg:text-start text-center"
					>
						Member rates on treatments & products
					</Item.Description>
				</Item.Content>
				<Item.Actions class="place-self-center">
					<Button
						variant="link"
						href="/booking/NOOA4AKCT4RI77UR56IEL432"
						class={buttonVariants({
							variant: "outline",
							class: "uppercase border-warm-ivory text-warm-ivory rounded-full px-8",
						})}>Join</Button
					>
				</Item.Actions>
			</Item.Root>

			<Item.Root
				variant={"outline"}
				class="px-8 flex-col lg:flex-row text-cold-ivory border-2 border-warm-ivory rounded-2xl"
			>
				<Item.Header
					class={"uppercase text-primary-foreground/70 font-source-code-pro text-center"}
					>First Visit</Item.Header
				>
				<Item.Content>
					<Item.Title
						class={"uppercase text-warm-ivory text-2xl w-full justify-center lg:justify-start"}
						>Not sure where to start</Item.Title
					>
					<Item.Description
						class={"uppercase text-primary-foreground/75 font-source-code-pro text-lg text-center lg:text-start"}
						>Book a skin health consultation</Item.Description
					>
				</Item.Content>
				<Item.Actions>
					<Button
						variant="link"
						href="/booking/VPBLSPCLMIHKLXHLPE2BY3HL"
						class={buttonVariants({
							variant: "outline",
							class: "uppercase border-warm-ivory text-warm-ivory rounded-full px-8",
						})}>Explore</Button
					>
				</Item.Actions>
			</Item.Root>
		</div>
	</div>
</section>
