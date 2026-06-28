<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { getCart } from "$lib/context/cart.svelte";
	import { pageTitle } from "../../+layout.svelte";

	const cart = getCart();

	// As soon as this page mounts in the browser, empty their bag
	$effect(() => {
		cart.clear();
	});
</script>

<svelte:head>
	<title>{pageTitle("Order Confirmed")}</title>
</svelte:head>

<section
	class="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center"
>
	<div class="max-w-xl flex flex-col items-center gap-8">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-black mb-4"
		>
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>

		<h1 class="uppercase text-4xl lg:text-5xl tracking-tight">Thank you</h1>

		<p class="text-lg lg:text-xl mb-2">
			Your order has been received. A confirmation email with your receipt
			and pickup details will arrive shortly.
		</p>

		<p class="font-source-code-pro text-sm uppercase tracking-widest mb-8">
			Your journey to skin health awaits
		</p>

		<div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
			<Button
				href="/shop"
				class="uppercase rounded-full h-12 px-8 bg-black text-white hover:bg-black/80 font-source-code-pro"
			>
				Return to Shop
			</Button>
			<Button
				href="/"
				variant="outline"
				class="uppercase rounded-full h-12 px-8 border-black hover:bg-gray-50 font-source-code-pro"
			>
				Back to Home
			</Button>
		</div>
	</div>
</section>
