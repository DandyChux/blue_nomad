<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { fly } from "svelte/transition";
	import { pageTitle } from "../../+layout.svelte";

	// Read the booking summary saved before redirect
	let summary = $state<{
		name: string;
		service: string;
		date: string;
		time: string;
	} | null>(null);

	$effect(() => {
		try {
			const stored = localStorage.getItem("bn_booking");
			if (stored) {
				summary = JSON.parse(stored);
				localStorage.removeItem("bn_booking");
			}
		} catch {
			// noop
		}
	});
</script>

<svelte:head>
	<title>{pageTitle("Booking Confirmed")}</title>
</svelte:head>

<section
	class="min-h-screen flex flex-col items-center justify-center text-center gap-12 px-6"
	in:fly={{ y: 20, duration: 800 }}
>
	<h2
		class="uppercase text-7xl lg:text-[9rem] tracking-tighter leading-[0.85] font-light"
	>
		See <br /> You <br /> Soon.
	</h2>

	<div
		class="font-source-code-pro uppercase text-[11px] tracking-[0.2em] space-y-2"
	>
		{#if summary}
			<p class="text-foreground">
				Confirmed for {summary.name}
			</p>
			<p class="text-foreground/80">
				{summary.service}
			</p>
			<p class="text-foreground/80">
				{summary.date} &mdash; {summary.time}
			</p>
		{/if}
		<p class="text-foreground/60 pt-2">
			A confirmation email with your booking details is on its way
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
