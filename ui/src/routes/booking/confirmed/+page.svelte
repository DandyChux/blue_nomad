<script lang="ts">
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { Button } from "$lib/components/ui/button";
	import { pageTitle } from "../../+layout.svelte";
	import type { BookingSummary } from "$lib/schemas";
	import { trackEvent } from "$lib/analytics.svelte";

	let summary = $state<BookingSummary | null>(null);

	onMount(() => {
		try {
			const stored = localStorage.getItem("bn_booking");
			if (!stored) return;

			const parsed = JSON.parse(stored) as BookingSummary;
			summary = parsed;

			window.dataLayer = window.dataLayer || [];

			window.dataLayer.push({ ecommerce: null });

			window.dataLayer.push({
				event: "booking",
				bookingInfo: {
					currrency: summary.currency,
					value: summary.price,
					transaction_id: summary.bookingId,
					items: [
						{
							item_id: summary.serviceId,
							item_name: summary.service,
							quantity: 1,
							price: summary.price,
						},
					],
				},
			});

			trackEvent("Booking Confirmed", {
				props: {
					bookingId: summary.bookingId ?? "",
					serviceId: summary.serviceId,
					service: summary.service,
					price: summary.price,
					currency: summary.currency,
					date: summary.date,
					time: summary.time,
				},
			});

			localStorage.removeItem("bn_booking");
		} catch {
			// Ignore malformed or unavailable local storage data
		}
	});
</script>

<svelte:head>
	<title>{pageTitle("Booking Request Submitted")}</title>
</svelte:head>

<section
	class="min-h-screen flex flex-col items-center justify-center text-center gap-12 px-6"
	in:fly={{ y: 20, duration: 800 }}
>
	<h2 class="uppercase text-3xl lg:text-5xl tracking-tight font-light">
		Appointment <br /> Confirmed
	</h2>

	<div
		class="font-source-code-pro uppercase text-[11px] tracking-[0.2em] space-y-2"
	>
		<!-- {#if summary}
			<p class="text-foreground">Submitted for {summary.name}</p>
			<p class="text-foreground/80">{summary.service}</p>
			<p class="text-foreground/80">
				{summary.date} &mdash; {summary.time}
			</p>
		{/if} -->
		<p class="text-foreground/60 pt-2">
			We look forward to caring for your skin.
		</p>
	</div>

	<Button
		href="/booking"
		variant="outline"
		class="rounded-none px-12 h-16 border-border uppercase font-source-code-pro text-xs tracking-widest hover:bg-foreground hover:text-background hover:border-foreground transition-all mt-8"
	>
		Back to Treatments
	</Button>
</section>
