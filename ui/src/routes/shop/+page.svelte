<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { Input } from "$lib/components/ui/input";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Select from "$lib/components/ui/select";
	import * as Empty from "$lib/components/ui/empty";
	import * as Accordion from "$lib/components/ui/accordion";
	import ProductCard from "$lib/components/product-card.svelte";
	import { debounce, cn } from "$lib/utils";

	let { data } = $props();

	// --- 1. URL-Based State (Including Pagination) ---
	let searchQuery = $derived(page.url.searchParams.get("q") ?? "");
	let activeCategory = $derived(page.url.searchParams.get("category") ?? "");
	let minPrice = $derived(page.url.searchParams.get("min") ?? "");
	let maxPrice = $derived(page.url.searchParams.get("max") ?? "");
	let inStockOnly = $derived(
		page.url.searchParams.get("in_stock") === "true",
	);

	// Pagination specific state
	let currentPage = $derived(
		parseInt(page.url.searchParams.get("page") ?? "1"),
	);
	let perPage = $derived(
		parseInt(page.url.searchParams.get("per_page") ?? "25"),
	);

	// --- 2. Filter Update Logic ---
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

		// IMPORTANT: If changing any filter OTHER than the page itself, reset to page 1
		if (key !== "page") {
			url.searchParams.delete("page");
		}

		goto(url, { keepFocus: true, replaceState: true, noScroll: true });
	}

	const debouncedSearch = debounce(
		(query: string) => updateFilter("q", query),
		300,
	);
	const debouncedPrice = debounce(
		(key: string, value: string) => updateFilter(key, value),
		500,
	);

	// --- 3. Derived Filtered & Paginated Data ---
	let filteredProducts = $derived(
		data.products.filter((product) => {
			const name = product.item_data?.name?.toLowerCase() || "";
			const priceCents =
				product.item_data?.variations?.[0]?.item_variation_data
					?.price_money?.amount || 0;
			const price = priceCents / 100;
			const categoryId = product.item_data?.categories?.[0]?.id || "";

			const matchesSearch = name.includes(searchQuery.toLowerCase());
			const matchesCategory = activeCategory
				? categoryId === activeCategory
				: true;
			const matchesMin = minPrice ? price >= parseFloat(minPrice) : true;
			const matchesMax = maxPrice ? price <= parseFloat(maxPrice) : true;

			return matchesSearch && matchesCategory && matchesMin && matchesMax;
		}),
	);

	// Slice the filtered array based on current page and per-page limit
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

<section
	class="pt-32 px-4 md:px-8 lg:px-12 min-h-screen max-w-[1800px] mx-auto gap-8"
>
	<div
		class="flex flex-col md:flex-row justify-between mb-12 border-b border-gray-200 pb-8 gap-6"
	>
		<div>
			<h1 class="uppercase text-3xl lg:text-5xl mb-2">Shop</h1>
			<p class="text-lg font-source-code-pro">
				Complimentary Shipping on US Orders $150+
			</p>
		</div>

		<div class="w-full md:w-80">
			<Input
				type="text"
				value={searchQuery}
				oninput={(e) => debouncedSearch(e.currentTarget.value)}
				placeholder="SEARCH PRODUCTS..."
				class="w-full border-b border-black py-2 rounded-none bg-transparent uppercase font-source-code-pro text-sm focus-visible:ring-0 focus-visible:outline-none border-x-0 border-t-0 shadow-none px-0"
			/>
		</div>
	</div>

	<div
		class="flex flex-col lg:grid lg:grid-cols-[16rem_1fr] lg:items-start gap-12 w-full"
	>
		<aside class="flex flex-col gap-8 font-source-code-pro text-sm">
			<!-- <h3 class="font-medium text-sm">Browse by category</h3> -->
			<Accordion.Root type="multiple">
				<Accordion.Item value="category">
					<Accordion.Trigger class="font-semibold text-sm"
						>Browse by category</Accordion.Trigger
					>
					<Accordion.Content class="flex flex-col gap-3">
						{#each data.categories as category (category.id)}
							<button
								class={cn(
									"text-left hover:underline",
									activeCategory === category.id &&
										"font-bold underline",
								)}
								onclick={() =>
									updateFilter("category", category.id)}
							>
								{category.name}
							</button>
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>

			<hr class="border-gray-200" />

			<!-- <div class="flex flex-col gap-4">
				<h3 class="font-medium text-sm">Price range ($)</h3>
				<div class="flex items-center gap-4">
					<div class="flex flex-col gap-1 w-full">
						<label
							for="min-price"
							class="text-xs  font-source-code-pro"
							>Min price</label
						>
						<Input
							id="min-price"
							type="number"
							min="0"
							value={minPrice}
							oninput={(e) =>
								debouncedPrice("min", e.currentTarget.value)}
							class="rounded-none font-source-code-pro h-10"
						/>
					</div>
					<span class="mt-5">-</span>
					<div class="flex flex-col gap-1 w-full">
						<label
							for="max-price"
							class="text-xs  font-source-code-pro"
							>Max price</label
						>
						<Input
							id="max-price"
							type="number"
							min="0"
							value={maxPrice}
							oninput={(e) =>
								debouncedPrice("max", e.currentTarget.value)}
							class="rounded-none font-source-code-pro h-10"
						/>
					</div>
				</div>
			</div>

			<hr class="border-gray-200" /> -->

			<Accordion.Root type="multiple">
				<Accordion.Item value="availability">
					<Accordion.Trigger class="font-semibold text-sm"
						>Availability</Accordion.Trigger
					>
					<Accordion.Content class="flex items-center space-x-2">
						<Checkbox
							id="in-stock"
							checked={inStockOnly}
							onCheckedChange={(v) => updateFilter("in_stock", v)}
							class="rounded-none"
						/>
						<Label
							for="in-stock"
							class="font-source-code-pro font-normal text-sm cursor-pointer"
							>In stock</Label
						>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</aside>

		<div class="w-full flex flex-col min-h-[800px]">
			<div
				class="flex justify-between items-center mb-8 border-b border-gray-100 pb-4"
			>
				<p class=" text-sm font-source-code-pro">
					Showing {paginatedProducts.length > 0
						? (currentPage - 1) * perPage + 1
						: 0} -
					{Math.min(currentPage * perPage, filteredProducts.length)} of
					{filteredProducts.length} results
				</p>

				<div class="flex items-center gap-3">
					<span class="text-sm font-source-code-pro"
						>Items per page:</span
					>
					<Select.Root
						type="single"
						value={String(perPage)}
						onValueChange={(v) => updateFilter("per_page", v)}
					>
						<Select.Trigger
							class="w-[80px] h-8 font-source-code-pro text-sm rounded-none border-gray-300"
						>
							{perPage}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="10" label="10">10</Select.Item>
							<Select.Item value="25" label="25">25</Select.Item>
							<Select.Item value="50" label="50">50</Select.Item>
							<Select.Item value="100" label="100"
								>100</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			{#if paginatedProducts.length === 0}
				<div class="w-full flex flex-col pb-20 flex-grow">
					<Empty.Root
						class="border border-dashed border-gray-400/40 w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-transparent"
					>
						<Empty.Header>
							<Empty.Media variant="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
									/>
								</svg>
							</Empty.Media>
							<Empty.Title
								class="uppercase font-source-code-pro  font-normal tracking-widest text-sm"
							>
								No products match your filters.
							</Empty.Title>
						</Empty.Header>
					</Empty.Root>
				</div>
			{:else}
				<div
					class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mb-16 content-start flex-grow h-[calc(100vh-400px)] overflow-y-auto"
				>
					{#each paginatedProducts as product (product.id)}
						<ProductCard {product} />
					{/each}
				</div>

				{#if filteredProducts.length > perPage}
					<div
						class="mt-auto border-t border-gray-200 pt-8 flex justify-center"
					>
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
													Math.max(
														1,
														currentPage - 1,
													),
												)}
										/>
									</Pagination.Item>

									{#each pages as page (page.key)}
										{#if page.type === "ellipsis"}
											<Pagination.Item>
												<Pagination.Ellipsis />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link
													{page}
													isActive={currentPage ===
														page.value}
													onclick={() =>
														updateFilter(
															"page",
															page.value,
														)}
												>
													{page.value}
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
			{/if}
		</div>
	</div>
</section>
