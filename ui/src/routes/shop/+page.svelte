<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { Input } from "$lib/components/ui/input";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Select from "$lib/components/ui/select";
	import * as Empty from "$lib/components/ui/empty";
	import * as Popover from "$lib/components/ui/popover";
	import Picture from "$lib/components/picture.svelte";
	import { debounce, cn, generateSrcSet } from "$lib/utils";
	import { getCart } from "$lib/context/cart.svelte";

	let { data } = $props();
	const cart = getCart();

	// --- URL-Based State ---
	let searchQuery = $derived(page.url.searchParams.get("q") ?? "");
	let activeCategory = $derived(page.url.searchParams.get("category") ?? "");
	let currentPage = $derived(
		parseInt(page.url.searchParams.get("page") ?? "1"),
	);
	let perPage = $derived(
		parseInt(page.url.searchParams.get("per_page") ?? "25"),
	);

	function updateFilter(
		key: string,
		value: string | number | boolean | null,
	) {
		const url = new URL(page.url);
		if (value === null || value === "" || value === false) {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, String(value));
		}
		if (key !== "page") url.searchParams.delete("page");
		goto(url, { keepFocus: true, replaceState: true, noScroll: true });
	}

	const debouncedSearch = debounce(
		(query: string) => updateFilter("q", query),
		300,
	);

	let filteredProducts = $derived(
		data.products.filter((product) => {
			const name = product.item_data?.name?.toLowerCase() || "";
			const categoryId = product.item_data?.categories?.[0]?.id || "";
			const matchesSearch = name.includes(searchQuery.toLowerCase());
			const matchesCategory = activeCategory
				? categoryId === activeCategory
				: true;
			return matchesSearch && matchesCategory;
		}),
	);

	let paginatedProducts = $derived(
		filteredProducts.slice(
			(currentPage - 1) * perPage,
			currentPage * perPage,
		),
	);
</script>

<svelte:head>
	<title>Shop | Blue Nomad</title>
</svelte:head>

<section class="min-h-screen w-full flex-col px-0">
	<!-- Header & Filters Bar -->
	<div class="w-full pt-28 lg:pt-36 pb-8 px-6 md:px-12 lg:px-16">
		<h1 class="uppercase text-2xl lg:text-[5rem] font-500 mb-8">Shop</h1>

		<div
			class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
		>
			<!-- Left: Category Filters -->
			<div class="flex flex-wrap items-center gap-3">
				<button
					class={cn(
						"font-source-code-pro text-[11px] uppercase tracking-widest px-4 py-2 border transition-colors rounded-full hover:bg-foreground hover:text-background",
						!activeCategory
							? "bg-foreground text-background border-foreground"
							: "border-border hover:border-foreground",
					)}
					onclick={() => updateFilter("category", null)}
				>
					All
				</button>
				{#each data.categories as category (category.id)}
					<button
						class={cn(
							"font-source-code-pro text-[11px] uppercase tracking-widest px-4 py-2 border transition-colors rounded-full hover:bg-foreground hover:text-background",
							activeCategory === category.id
								? "bg-foreground text-background border-foreground"
								: "border-border hover:border-foreground",
						)}
						onclick={() => updateFilter("category", category.id)}
					>
						{category.name}
					</button>
				{/each}
			</div>

			<!-- Right: Search & Results Count -->
			<div class="flex items-center gap-6">
				<!-- <span
					class="font-source-code-pro text-[11px] uppercase tracking-widest hidden md:inline"
				>
					{filteredProducts.length} Items
				</span> -->
				<Input
					type="text"
					value={searchQuery}
					oninput={(e) => debouncedSearch(e.currentTarget.value)}
					placeholder="Search..."
					class="w-48 md:w-64 border-0 border-b border-border rounded-none bg-transparent font-source-code-pro text-sm focus-visible:ring-0 shadow-none px-0"
				/>
			</div>
		</div>
	</div>

	<!-- Product Grid (Full Width) -->
	<div class="w-full px-4 md:px-8 lg:px-12 py-8">
		{#if paginatedProducts.length === 0}
			<div class="w-full flex justify-center py-32">
				<Empty.Root
					class="border border-dashed border-border w-full max-w-xl min-h-[400px] flex flex-col items-center justify-center bg-transparent"
				>
					<Empty.Header>
						<Empty.Title
							class="uppercase font-source-code-pro font-normal tracking-widest text-sm"
						>
							No products match your filters.
						</Empty.Title>
					</Empty.Header>
				</Empty.Root>
			</div>
		{:else}
			<div
				class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-[1px] bg-transparent"
			>
				{#each paginatedProducts as product (product.id)}
					{@const itemData = product.item_data}
					{@const firstVariation =
						itemData.variations?.[0]?.item_variation_data}
					{@const price = (
						(firstVariation?.price_money?.amount || 0) / 100
					).toFixed(2)}
					{@const isSoldOut = (
						firstVariation?.location_overrides || []
					).some((o) => o.sold_out === true)}

					<a
						href="/shop/{product.id}"
						class="group relative bg-background overflow-hidden flex flex-col"
						aria-label={isSoldOut
							? `${itemData.name} — sold out`
							: itemData.name}
					>
						<div
							class="relative w-full aspect-[3/4] overflow-hidden bg-muted"
						>
							<Picture
								src={product.image_url || ""}
								alt={itemData.name}
								class="w-full h-full object-cover transition-transform duration-700"
								loading="lazy"
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
								sources={product.image_url
									? [
											{
												type: "image/webp",
												srcset: generateSrcSet(
													product.image_url,
													[400, 800, 1200],
													"webp",
													80,
												),
											},
										]
									: []}
							/>

							{#if isSoldOut}
								<span
									class="absolute top-3 left-3 bg-black text-white text-[10px] font-source-code-pro uppercase tracking-widest px-2 py-1"
								>
									Sold Out
								</span>
							{/if}

							<!-- Hover Overlay with Description -->
							<div
								class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 font-source-code-pro"
							>
								<p
									class="text-white text-sm leading-relaxed line-clamp-4"
								>
									{itemData.description ||
										"Tap to view details."}
								</p>
								<span
									class="text-white/70 font-source-code-pro text-[10px] uppercase tracking-widest mt-3"
								>
									View Details &rarr;
								</span>
							</div>
						</div>

						<!-- Name & Price Footer -->
						<div
							class="flex items-center justify-between gap-4 px-4 py-4 bg-transparent"
						>
							<h2
								class="uppercase text-sm tracking-tight leading-tight line-clamp-1"
							>
								{itemData.name}
							</h2>
							<span class="font-source-code-pro text-sm shrink-0"
								>${price}</span
							>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if filteredProducts.length > perPage}
			<div class="mt-12 pt-8 flex justify-center">
				<Pagination.Root
					count={filteredProducts.length}
					{perPage}
					page={currentPage}
				>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton
									onclick={() =>
										updateFilter(
											"page",
											Math.max(1, currentPage - 1),
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
											isActive={currentPage === pg.value}
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
													filteredProducts.length /
														perPage,
												),
												currentPage + 1,
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
</section>
