<script lang="ts">
	import { page } from "$app/state";
	import { pageTitle } from "../../+layout.svelte";
	import { Button, buttonVariants } from "$lib/components/ui/button";

	const name = $derived(page.url.searchParams.get("name") || "");
</script>

<svelte:head>
	<title>{pageTitle("Diagnostic Submitted")}</title>
</svelte:head>

<section class="flex flex-col items-center justify-center text-center px-6">
	<div class="max-w-lg">
		<h1 class="uppercase tracking-tight mb-4">
			{#if name}
				Thank You Kindly, {name}
			{:else}
				Thank You Kindly
			{/if}
		</h1>

		<p
			class="font-spectral text-xs uppercase tracking-[0.15em] leading-loose mb-12"
		>
			Your skin assessment and recommendations will follow via email
			shortly. Please allow up to 6 hours for delivery. We may follow up
			with additional questions if needed.
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<Button
				variant="link"
				href="/booking"
				class={buttonVariants({
					variant: "outline",
					class: "uppercase rounded-full h-auto py-3 px-10 border-foreground text-foreground font-source-code-pro text-[10px] tracking-[0.15em] hover:bg-foreground hover:text-background transition-all",
				})}
			>
				Book a <br /> Treatment
			</Button>

			<Button
				variant="link"
				href="/shop"
				class={buttonVariants({
					class: "uppercase rounded-full h-auto py-3 px-10 font-spectral text-[10px] tracking-[0.15em]",
				})}
			>
				Shop <br /> skin care
			</Button>
		</div>
	</div>
</section>
