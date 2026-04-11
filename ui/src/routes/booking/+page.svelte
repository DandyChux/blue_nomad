<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Empty from "$lib/components/ui/empty";
	import Picture from "$lib/components/picture.svelte";
	import { generateSrcSet, debounce, cn } from "$lib/utils";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import type { CatalogItem } from "$lib/schemas";
	import Video from "$lib/components/video.svelte";
	import InfiniteMovingCards from "$lib/components/infinite-moving-cards.svelte";
	import { pressBrands } from "../+page.svelte";

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
	const featured = $derived(
		paginatedServices.find((s) => s.id === "TWYSCIC46EIMS3SD2A6UMJ5H") ??
			paginatedServices[0] ??
			null,
	);
	const remaining = $derived(paginatedServices.slice(1));

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

	let featuredTreatmentId = $derived(featured?.id ?? null);

	const testimonials = [
		{
			quote: "Calming, relaxing, informative, honest. Highly recommend! My skin feels and looks great.",
			author: "Anna, BK",
		},
		{
			quote: "Come here for a bespoke and private treatment in a space that feels like…a new home.",
			author: "Siba, Bed-Stuy",
		},
		{
			quote: "What an incredible experience! 10/10 recommend!!! I'm hooked.",
			author: "Ron, West Village",
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
			src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/videos/Blue%20Nomad%20-%20Treatment%20V1.webm"
		/>

		<!-- Gradient Overlay -->
		<div
			class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
		></div>

		<!-- Hero Content -->
		<div
			class="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 lg:pb-24 max-w-5xl"
		>
			<p
				class="font-source-code-pro text-[11px] uppercase tracking-[0.3em] text-white/60 mb-4"
				in:fly={{ y: 10, duration: 600, delay: 200 }}
			>
				Blue Nomad Skin Health Studio
			</p>
			<h1
				class="uppercase text-5xl md:text-7xl lg:text-8xl tracking-tighter font-light text-white leading-[0.9] mb-6"
				in:fly={{ y: 20, duration: 600, delay: 300 }}
			>
				Your skin <br />Our practice
			</h1>
			<p
				class="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed font-light"
				in:fly={{ y: 20, duration: 600, delay: 400 }}
			>
				Personalized treatments designed to restore, protect, and
				support long-term skin health.
			</p>

			<!-- Scroll Indicator -->
			<div class="mt-12 flex items-center gap-3" in:fade={{ delay: 800 }}>
				<div class="w-[1px] h-12 bg-white/40 animate-pulse"></div>
				<a
					class="font-source-code-pro text-[10px] uppercase tracking-widest text-white/40 underline"
					href={`/booking/${featuredTreatmentId}`}
				>
					Book a Treatment
				</a>
			</div>
		</div>
	</div>

	<!-- ======================== -->
	<!-- FILTER BAR               -->
	<!-- ======================== -->
	<!-- <div
		class="w-full px-6 md:px-12 lg:px-16 py-6 border-border flex items-center justify-between"
	>
		<p
			class="font-source-code-pro text-[11px] uppercase tracking-widest text-muted-foreground"
		>
			{filteredServices.length} Treatments
		</p>

		<div class="flex items-center gap-4">
			{#if showSearch}
				<div in:fly={{ x: 20, duration: 300 }}>
					<Input
						type="text"
						value={searchQuery}
						oninput={(e) => debouncedSearch(e.currentTarget.value)}
						placeholder="Search..."
						autofocus
						class="w-48 md:w-64 border-0 border-b border-border rounded-none bg-transparent font-source-code-pro text-sm focus-visible:ring-0 shadow-none px-0"
					/>
				</div>
			{/if}
			<button
				class="font-source-code-pro text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
				onclick={() => {
					showSearch = !showSearch;
					if (!showSearch) debouncedSearch("");
				}}
			>
				{showSearch ? "Close" : "Search"}
			</button>
		</div>
	</div> -->

	<div class="px-6 md:px-8 lg:px-12 pt-6">
		<h4 class="text-base uppercase font-source-code-pro tracking-widest">
			Treatments
		</h4>
		<p class="text-2xl text-foreground/70">
			Advanced skin therapy, tailored to your skin.
		</p>
	</div>

	<!-- ======================== -->
	<!-- TREATMENT GRID            -->
	<!-- ======================== -->
	<div class="w-full px-4 md:px-8 lg:px-12 py-8 lg:py-12">
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
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
				in:fade
			>
				<!-- FEATURED: First treatment spans 2 cols + 2 rows -->
				{#if featured}
					<a
						href="/booking/{featured.id}"
						class="group relative overflow-hidden md:col-span-2 md:row-span-2 flex flex-col bg-background"
					>
						<div
							class="relative w-full aspect-square md:aspect-auto md:h-full min-h-[500px] overflow-hidden bg-muted"
						>
							<Picture
								src={featured.image_url || ""}
								alt={featured.item_data.name}
								class="w-full h-full object-cover transition-transform duration-1000"
								loading="eager"
								sizes="(max-width: 768px) 100vw, 50vw"
								sources={featured.image_url
									? [
											{
												type: "image/webp",
												srcset: generateSrcSet(
													featured.image_url,
													[600, 1000, 1600],
													"webp",
													85,
												),
											},
										]
									: []}
							/>

							<!-- Gradient overlay (always visible, intensifies on hover) -->
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-all duration-700"
							></div>

							<!-- Content pinned to bottom -->
							<div
								class="absolute bottom-0 left-0 right-0 p-8 lg:p-10"
							>
								<span
									class="font-source-code-pro text-[10px] uppercase tracking-[0.3em] text-white/50 block mb-3"
								>
									Core Treatment
								</span>
								<h2
									class="uppercase text-3xl lg:text-4xl tracking-tighter text-white font-light leading-[0.95] mb-3"
								>
									{featured.item_data.name}
								</h2>
								<p
									class="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-md mb-4 font-source-code-pro"
								>
									{featured.item_data.description ||
										"A curated experience focused on restoration and results."}
								</p>
								<div
									class="flex items-center gap-6 font-source-code-pro"
								>
									<span
										class="text-[11px] uppercase tracking-widest text-white/80"
									>
										{getDuration(featured)} Min — ${getPrice(
											featured,
										)}
									</span>
									<span
										class="text-[10px] uppercase tracking-widest text-white/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
									>
										Book Now &rarr;
									</span>
								</div>
							</div>
						</div>
					</a>
				{/if}

				<!-- REMAINING: Standard cards -->
				{#each remaining as service, index (service.id)}
					{@const isAlternate = index % 3 === 0}
					<a
						href="/booking/{service.id}"
						class={cn(
							"group relative overflow-hidden flex flex-col",
							{
								"bg-card text-primary-foreground": isAlternate,
								"bg-secondary text-secondary-foreground":
									!isAlternate,
							},
						)}
					>
						<div
							class="relative w-full aspect-[3/4] overflow-hidden bg-muted"
						>
							<Picture
								src={service.image_url || ""}
								alt={service.item_data.name}
								class="w-full h-full object-cover transition-transform duration-700"
								loading="lazy"
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
								sources={service.image_url
									? [
											{
												type: "image/webp",
												srcset: generateSrcSet(
													service.image_url,
													[400, 800],
													"webp",
													80,
												),
											},
										]
									: []}
							/>

							<!-- Hover Overlay -->
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5"
							>
								<p
									class="text-white text-sm leading-relaxed line-clamp-3 font-source-code-pro"
								>
									{service.item_data.description ||
										"Tap to explore this treatment."}
								</p>
								<span
									class="text-white/60 font-source-code-pro text-[10px] uppercase tracking-widest mt-3"
								>
									Book Now &rarr;
								</span>
							</div>
						</div>

						<!-- Footer -->
						<div class="px-4 py-4 flex flex-col gap-1">
							<h2
								class="uppercase text-sm tracking-wide leading-tight line-clamp-1 font-extrabold"
							>
								{service.item_data.name}
							</h2>
							<span
								class="font-source-code-pro text-[11px] font-bold"
							>
								{getDuration(service)} min — ${getPrice(
									service,
								)}
							</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if filteredServices.length > perPage}
			<div class="mt-16 pt-8 flex justify-center">
				<Pagination.Root
					count={filteredServices.length}
					{perPage}
					page={currentPage}
				>
					{#snippet children({ pages, currentPage: current })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton
									onclick={() =>
										updateFilter(
											"page",
											Math.max(1, current - 1),
										)}
								/>
							</Pagination.Item>
							{#each pages as pg (pg.key)}
								{#if pg.type === "ellipsis"}
									<Pagination.Item
										><Pagination.Ellipsis
										/></Pagination.Item
									>
								{:else}
									<Pagination.Item>
										<Pagination.Link
											page={pg}
											isActive={current === pg.value}
											onclick={() =>
												updateFilter("page", pg.value)}
										>
											{pg.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton
									onclick={() =>
										updateFilter(
											"page",
											Math.min(
												Math.ceil(
													filteredServices.length /
														perPage,
												),
												current + 1,
											),
										)}
								/>
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		{/if}
	</div>

	<!-- Testimonials -->
	<div
		class="w-full py-24 lg:py-32 px-6 md:px-12 lg:px-16 overflow-hidden"
		bind:this={testimonialsEl}
	>
		<p
			class="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground text-center mb-16"
		>
			Earned Love
		</p>

		<div
			class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
		>
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
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<InfiniteMovingCards
		items={pressBrands}
		direction="right"
		speed="normal"
		class="mask-[linear-gradient(to_right,transparent_0%,white_20%,white_100%)] max-w-[unset]"
	/>
</section>
