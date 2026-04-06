<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { getCart } from "$lib/context/cart.svelte";
	import type { CatalogItem as CatalogObject } from "$lib/schemas";
	import { generateSrcSet } from "$lib/utils";

	type CatalogItem = Extract<CatalogObject, { type: "ITEM" }>;

	type Props = {
		product: CatalogItem;
	};

	let { product }: Props = $props();
	const cart = getCart();

	// Safely extract Square's nested data
	const itemData = $derived(product.item_data || {});

	// Default to the first variation for the price display
	const firstVariation = $derived(itemData.variations?.[0]);
	const priceCents = $derived(
		firstVariation?.item_variation_data?.price_money?.amount || 0,
	);
	const price = $derived((priceCents / 100).toFixed(2));

	const imageUrl = $derived(product.image_url);
</script>

<div class="flex flex-col h-full group">
	<div
		class="relative w-full aspect-4/5 bg-gray-100 mb-6 overflow-hidden rounded-lg"
	>
		<img
			src={imageUrl}
			srcset={generateSrcSet(imageUrl || "")}
			alt={itemData.name}
			class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
			loading="lazy"
		/>
	</div>

	<div class="flex flex-col flex-grow">
		<div class="flex justify-between items-start gap-4 mb-2">
			<h2 class="uppercase text-lg leading-tight">
				{itemData.name || "Unnamed Product"}
			</h2>
			<span class="font-source-code-pro">${price}</span>
		</div>

		<p class="text-foreground/80 text-sm line-clamp-2 mb-6">
			{itemData.description}
		</p>

		<Button
			variant="outline"
			class="uppercase rounded-full w-full mt-auto font-source-code-pro tracking-tight transition-colors hover:bg-card hover:text-card-foreground"
			onclick={() => cart.add(product, firstVariation)}
		>
			Add to bag
		</Button>
	</div>
</div>
