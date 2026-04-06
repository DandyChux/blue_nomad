<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar";
	import { apiClient } from "$lib/api";
	import {
		today,
		getLocalTimeZone,
		type DateValue,
	} from "@internationalized/date";
	import { fade, fly } from "svelte/transition";
	import type {
		CatalogListResponse,
		SearchAvailabilityResponse,
		CatalogItem,
	} from "$lib/schemas";
	import Picture from "$lib/components/picture.svelte";
	import { generateSrcSet } from "$lib/utils.js";

	let { data } = $props();
	const services = $derived(data.services as CatalogItem[]);

	const booking = $state({
		step: 1,
		isLoading: false,
		error: "",
		slots: [] as any[],
		selection: {
			service: null as CatalogItem | null,
			variationId: "",
			date: undefined as DateValue | undefined,
			time: "",
		},
		customer: {
			first: "",
			last: "",
			email: "",
			phone: "",
		},
	});

	const minDate = today(getLocalTimeZone());
	const formatTime = (rfc: string) =>
		new Date(rfc).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	const displayStep = $derived(
		booking.step === 1.5 ? 2 : booking.step > 1 ? booking.step + 1 : 1,
	);

	async function confirmBooking() {
		booking.isLoading = true;
		try {
			await apiClient.post("/booking/create", {
				service_variation_id: booking.selection.variationId,
				start_at: booking.selection.time,
				given_name: booking.customer.first,
				family_name: booking.customer.last,
				email_address: booking.customer.email,
				phone_number: booking.customer.phone,
			});
			booking.step = 4;
		} catch (e) {
			booking.error = "Slot no longer available.";
		} finally {
			booking.isLoading = false;
		}
	}

	async function loadAvailability(date: DateValue) {
		booking.selection.time = "";
		booking.isLoading = true;
		try {
			const res = await apiClient.post<SearchAvailabilityResponse>(
				"/booking/availability",
				{
					service_variation_id: booking.selection.variationId,
					start_at: `${date.toString()}T00:00:00Z`,
					end_at: `${date.toString()}T23:59:59Z`,
				},
			);
			booking.slots = res.availabilities || [];
		} catch (e) {
			booking.error = "Error fetching times.";
		} finally {
			booking.isLoading = false;
		}
	}

	$effect(() => {
		if (booking.selection.date) loadAvailability(booking.selection.date);
	});

	$effect(() => {
		// This tracks booking.step automatically
		if (booking.step) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	});

	$inspect(services);
</script>

<section class="min-h-screen items-start !p-0">
	<div
		class="w-full flex flex-col max-w-[1600px] mx-auto pt-24 lg:pt-32 px-6 md:px-12 lg:px-24 mb-20"
	>
		{#if booking.step < 4}
			<div
				class="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-border pb-8 gap-4 w-full"
				in:fade
			>
				<h1
					class="uppercase text-5xl lg:text-7xl tracking-tighter font-light leading-none"
				>
					{#if booking.step === 1}Treatments
					{:else if booking.step === 1.5}The Experience
					{:else if booking.step === 2}Select Time
					{:else}Details{/if}
				</h1>
				<div
					class="font-source-code-pro text-xs uppercase tracking-widest text-muted-foreground pb-2"
				>
					Step 0{displayStep} &mdash; 04
				</div>
			</div>
		{/if}

		<div class="w-full max-w-6xl mx-auto">
			{#if booking.step === 1}
				<div class="flex flex-col border-t border-border" in:fade>
					{#each services as service}
						{@const duration =
							service.item_data.variations?.[0]
								.item_variation_data?.service_duration || 0}
						{@const price =
							(service.item_data.variations?.[0]
								?.item_variation_data?.price_money?.amount ||
								0) / 100}

						<button
							class="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-border text-left transition-all duration-500 ease-out"
							onclick={() => {
								booking.selection.service = service;
								booking.step = 1.5;
							}}
						>
							<Picture
								src={service.image_url ? service.image_url : ""}
								alt={service.item_data.name}
								width={160}
								height={160}
								class="max-w-full h-auto"
								sizes="(max-width: 768px) 16vw, 160px"
								sources={[
									{
										type: "image/webp",
										srcset: generateSrcSet(
											service.image_url!,
											[400, 800],
											"webp",
											80,
										),
									},
								]}
							/>
							<div class="max-w-2xl">
								<h3
									class="text-3xl md:text-4xl uppercase tracking-tight font-light group-hover:text-muted-foreground transition-colors"
								>
									{service.item_data.name}
								</h3>
								<p
									class="font-source-code-pro text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-3"
								>
									{(duration / 60000).toFixed(0)} Min &nbsp;&mdash;&nbsp;
									${price}
								</p>
							</div>
							<div
								class="mt-6 md:mt-0 font-source-code-pro text-xs uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
							>
								Explore &rarr;
							</div>
						</button>
					{/each}
				</div>
			{:else if booking.step === 1.5}
				<div
					in:fly={{ y: 20, duration: 600 }}
					class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24"
				>
					<div class="lg:col-span-5 space-y-8">
						<button
							onclick={() => (booking.step = 1)}
							class="font-source-code-pro text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
						>
							&larr; Back to Treatments
						</button>

						<h2
							class="text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9]"
						>
							{booking.selection.service?.item_data.name}
						</h2>

						<div
							class="flex gap-12 py-6 border-y border-border font-source-code-pro text-[11px] uppercase tracking-[0.2em]"
						>
							<div>
								<span class="block text-muted-foreground mb-2"
									>Duration</span
								>
								{(booking.selection.service?.item_data
									.variations?.[0].item_variation_data
									?.service_duration || 0) / 60000} Min
							</div>
							<div>
								<span class="block text-muted-foreground mb-2"
									>Investment</span
								>
								${(booking.selection.service?.item_data
									.variations?.[0]?.item_variation_data
									?.price_money?.amount || 0) / 100}
							</div>
						</div>
					</div>

					<div
						class="lg:col-span-7 flex flex-col justify-between pt-2"
					>
						<p
							class="text-xl md:text-2xl leading-relaxed font-light text-muted-foreground"
						>
							{booking.selection.service?.item_data.description ||
								"A curated experience focused on restoration and results."}
						</p>

						<Button
							class="w-full uppercase rounded-none h-16 bg-foreground text-background hover:bg-foreground/80 text-sm font-source-code-pro tracking-widest mt-12"
							onclick={() => {
								booking.selection.variationId =
									booking.selection.service?.item_data
										.variations?.[0]?.id || "";
								booking.step = 2;
							}}
						>
							Select Date
						</Button>
					</div>
				</div>
			{:else if booking.step === 2}
				<div class="w-full" in:fade>
					<button
						onclick={() => (booking.step = 1.5)}
						class="font-source-code-pro text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12"
					>
						&larr; Back to Experience
					</button>

					<div
						class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-24"
					>
						<div
							class="flex justify-center p-8 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-border"
						>
							<Calendar
								type="single"
								bind:value={booking.selection.date}
								minValue={minDate}
								class="border-0 shadow-none bg-transparent font-harmony"
							/>
						</div>

						<div class="flex flex-col h-full">
							<div
								class="flex items-center justify-between border-b border-border pb-4 mb-6"
							>
								<Label
									class="text-[10px] font-source-code-pro uppercase tracking-widest text-muted-foreground"
								>
									Available Times
								</Label>
							</div>

							<div class="flex-grow">
								{#if !booking.selection.date}
									<div
										class="h-full min-h-[200px] flex items-center justify-center text-center text-xs font-source-code-pro uppercase text-muted-foreground tracking-widest"
									>
										Select a date to <br /> view availability
									</div>
								{:else if booking.isLoading}
									<div class="grid grid-cols-2 gap-3">
										{#each Array(6) as _}
											<div
												class="h-12 bg-border/50 animate-pulse"
											></div>
										{/each}
									</div>
								{:else if booking.slots.length === 0}
									<div
										class="h-full min-h-[200px] flex items-center justify-center text-center text-xs font-source-code-pro uppercase text-muted-foreground tracking-widest"
									>
										No availability on <br /> this date
									</div>
								{:else}
									<div class="grid grid-cols-3 gap-3">
										{#each booking.slots as slot}
											<button
												class="py-4 border font-source-code-pro text-[11px] tracking-wider transition-all duration-300
												{booking.selection.time === slot.start_at
													? 'bg-foreground text-background border-foreground'
													: 'border-border hover:border-foreground text-foreground bg-transparent'}"
												onclick={() =>
													(booking.selection.time =
														slot.start_at)}
											>
												{formatTime(slot.start_at)}
											</button>
										{/each}
									</div>
								{/if}
							</div>

							<Button
								class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm mt-8 disabled:opacity-20 transition-opacity"
								disabled={!booking.selection.time}
								onclick={() => (booking.step = 3)}
							>
								Continue
							</Button>
						</div>
					</div>
				</div>
			{:else if booking.step === 3}
				<div in:fade class="max-w-2xl mx-auto w-full">
					<button
						onclick={() => (booking.step = 2)}
						class="font-source-code-pro text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12"
					>
						&larr; Back to Calendar
					</button>

					<div class="text-center mb-16 space-y-4">
						<h2 class="uppercase text-4xl tracking-tighter">
							{booking.selection.service?.item_data.name}
						</h2>
						<p
							class="font-source-code-pro text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
						>
							{new Date(
								booking.selection.time,
							).toLocaleDateString(undefined, {
								weekday: "long",
								month: "long",
								day: "numeric",
							})}
							&nbsp;&mdash;&nbsp;
							{formatTime(booking.selection.time)}
						</p>
					</div>

					<div class="space-y-10">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-10">
							<div class="space-y-2">
								<Label
									class="text-[10px] font-source-code-pro uppercase tracking-widest text-muted-foreground"
									>First Name</Label
								>
								<Input
									bind:value={booking.customer.first}
									class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
								/>
							</div>
							<div class="space-y-2">
								<Label
									class="text-[10px] font-source-code-pro uppercase tracking-widest text-muted-foreground"
									>Last Name</Label
								>
								<Input
									bind:value={booking.customer.last}
									class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-muted-foreground"
								>Email Address</Label
							>
							<Input
								type="email"
								bind:value={booking.customer.email}
								class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
							/>
						</div>

						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-muted-foreground"
								>Phone Number</Label
							>
							<Input
								type="tel"
								bind:value={booking.customer.phone}
								class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
								placeholder="Optional"
							/>
						</div>

						<Button
							class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm mt-8 disabled:opacity-20 transition-opacity"
							onclick={confirmBooking}
							disabled={booking.isLoading ||
								!booking.customer.first ||
								!booking.customer.email}
						>
							{booking.isLoading
								? "Securing..."
								: "Confirm Booking"}
						</Button>
					</div>
				</div>
			{:else}
				<div
					class="flex flex-col items-center justify-center py-32 text-center gap-12 w-full"
					in:fly={{ y: 20, duration: 800 }}
				>
					<h2
						class="uppercase text-7xl lg:text-[9rem] tracking-tighter leading-[0.85] font-light"
					>
						See <br /> You <br /> Soon.
					</h2>

					<div
						class="font-source-code-pro uppercase text-[11px] tracking-[0.2em] space-y-2 text-muted-foreground"
					>
						<p class="text-foreground">
							Confirmed for {booking.customer.first}
						</p>
						<p>Details have been sent to your inbox</p>
					</div>

					<Button
						href="/"
						variant="outline"
						class="rounded-none px-12 h-16 border-border uppercase font-source-code-pro text-xs tracking-widest hover:bg-foreground hover:text-background hover:border-foreground transition-all mt-8"
					>
						Return Home
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
