<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar";
	import Picture from "$lib/components/picture.svelte";
	import { generateSrcSet } from "$lib/utils";
	import { apiClient } from "$lib/api";
	import {
		today,
		getLocalTimeZone,
		type DateValue,
	} from "@internationalized/date";
	import { fade, fly } from "svelte/transition";
	import type {
		AvailabilitySlot,
		SearchAvailabilityResponse,
	} from "$lib/schemas";

	let { data } = $props();

	const service = $derived(data.service);
	const itemData = $derived(service.item_data);
	const imageUrls = $derived(data.imageUrls);
	const variation = $derived(itemData.variations?.[0]);
	const duration = $derived(
		(variation?.item_variation_data?.service_duration || 0) / 60000,
	);
	const priceCents = $derived(
		variation?.item_variation_data?.price_money?.amount || 0,
	);
	const price = $derived((priceCents / 100).toFixed(0));

	let activeImageIndex = $state(0);

	// Booking flow state
	const booking = $state({
		step: 1 as 1 | 2 | 3 | 4,
		isLoading: false,
		error: "",
		slots: [] as any[],
		date: undefined as DateValue | undefined,
		time: "",
		selectedSlot: undefined as AvailabilitySlot | undefined,
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

	async function loadAvailability(date: DateValue) {
		booking.time = "";
		booking.selectedSlot = undefined;
		booking.isLoading = true;
		try {
			const res = await apiClient.post<SearchAvailabilityResponse>(
				"/booking/availability",
				{
					service_variation_id: variation?.id,
					start_at: `${date.toString()}T00:00:00Z`,
					end_at: `${date.toString()}T23:59:59Z`,
				},
			);
			booking.slots = res.availabilities || [];
		} catch {
			booking.error = "Error fetching times.";
		} finally {
			booking.isLoading = false;
		}
	}

	$effect(() => {
		if (booking.date) loadAvailability(booking.date);
	});

	$effect(() => {
		if (booking.step) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	});

	async function confirmBooking() {
		booking.isLoading = true;
		booking.error = "";

		const teamMemberId =
			booking.selectedSlot?.appointment_segments?.[0]?.team_member_id;

		if (!teamMemberId) {
			booking.error =
				"Missing appointment details. Please select a time slot again.";
			booking.isLoading = false;
			return;
		}

		try {
			const result = await apiClient.post<{
				booking_id: string;
				checkout_url: string;
			}>("/booking/create", {
				service_variation_id: variation?.id,
				team_member_id: teamMemberId,
				start_at: booking.time,
				given_name: booking.customer.first,
				family_name: booking.customer.last,
				email_address: booking.customer.email,
				phone_number: booking.customer.phone,
				service_name: itemData.name,
				price_cents: priceCents,
			});

			if (result.checkout_url) {
				// Persist summary for the confirmation page
				localStorage.setItem(
					"bn_booking",
					JSON.stringify({
						name: booking.customer.first,
						service: itemData.name,
						date: new Date(booking.time).toLocaleDateString(
							undefined,
							{
								weekday: "long",
								month: "long",
								day: "numeric",
							},
						),
						time: formatTime(booking.time),
					}),
				);
				// Redirect to Square-hosted checkout (same pattern as shop)
				window.location.href = result.checkout_url;
			}
		} catch {
			booking.error =
				"Could not complete booking. The slot may no longer be available.";
		} finally {
			booking.isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{itemData.name} | Blue Nomad Booking</title>
</svelte:head>

<section class="min-h-screen pt-28 lg:pt-36 px-6 md:px-12 lg:px-16 pb-20">
	<!-- Back Link -->
	<a
		href="/booking"
		class="inline-block font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors mb-10"
	>
		&larr; Back to Treatments
	</a>

	<div
		class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
	>
		<!-- Left: Image Gallery (Sticky on Desktop) -->
		<div class="flex flex-col gap-4 lg:sticky lg:top-36 lg:self-start">
			<div class="relative w-full aspect-[3/4] bg-muted overflow-hidden">
				{#key activeImageIndex}
					<div in:fade={{ duration: 300 }} class="absolute inset-0">
						<Picture
							src={imageUrls[activeImageIndex] ||
								service.image_url}
							alt="{itemData.name} - Image {activeImageIndex + 1}"
							class="w-full h-full object-cover"
							loading="eager"
							sizes="(max-width: 1024px) 100vw, 50vw"
							sources={imageUrls[activeImageIndex]
								? [
										{
											type: "image/webp",
											srcset: generateSrcSet(
												imageUrls[activeImageIndex],
												[600, 1000, 1400],
												"webp",
												85,
											),
										},
									]
								: []}
						/>
					</div>
				{/key}
			</div>

			{#if imageUrls.length > 1}
				<div class="flex gap-2 overflow-x-auto no-scrollbar">
					{#each imageUrls as url, i}
						<button
							class="shrink-0 w-20 h-20 border-2 overflow-hidden transition-colors {activeImageIndex ===
							i
								? 'border-foreground'
								: 'border-transparent hover:border-border'}"
							onclick={() => (activeImageIndex = i)}
						>
							<Picture
								src={url}
								alt="{itemData.name} thumbnail {i + 1}"
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Right: Service Details + Booking Flow -->
		<div class="flex flex-col gap-8 lg:py-8">
			<!-- Service Info (Always Visible) -->
			<div class="space-y-6 border-b border-border pb-8">
				<h1
					class="uppercase text-4xl lg:text-5xl tracking-tighter font-light leading-[0.95]"
				>
					{itemData.name}
				</h1>

				<div
					class="flex gap-8 font-source-code-pro text-[11px] uppercase tracking-[0.2em]"
				>
					<span>{duration.toFixed(0)} Min</span>
					<span>${price}</span>
				</div>

				{#if itemData.description}
					<p class="text-base leading-relaxed text-foreground/80">
						{itemData.description}
					</p>
				{/if}
			</div>

			<!-- Step Indicator -->
			<div
				class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80"
			>
				Step 0{booking.step} — 03
			</div>

			<!-- Step 1: Calendar -->
			{#if booking.step === 1}
				<div class="space-y-6" in:fade>
					<h2 class="uppercase text-2xl tracking-tighter font-light">
						Select a Date
					</h2>

					<div
						class="flex justify-center p-8 bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-border"
					>
						<Calendar
							type="single"
							bind:value={booking.date}
							minValue={minDate}
							class="border-0 shadow-none bg-transparent"
						/>
					</div>

					{#if booking.date}
						<div class="space-y-4" in:fade>
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
							>
								Available Times
							</Label>

							{#if booking.isLoading}
								<div class="grid grid-cols-3 gap-3">
									{#each Array(6) as _}
										<div
											class="h-12 bg-border/50 animate-pulse"
										></div>
									{/each}
								</div>
							{:else if booking.slots.length === 0}
								<p
									class="text-center text-xs font-source-code-pro uppercase tracking-widest text-foreground/80 py-8"
								>
									No availability on this date
								</p>
							{:else}
								<div class="grid grid-cols-3 gap-3">
									{#each booking.slots as slot}
										<button
											class="py-4 border font-source-code-pro text-[11px] tracking-wider transition-all duration-300
												{booking.time === slot.start_at
												? 'bg-foreground text-background border-foreground'
												: 'border-border hover:border-foreground text-foreground bg-transparent'}"
											onclick={() => {
												booking.time = slot.start_at;
												booking.selectedSlot = slot;
											}}
										>
											{formatTime(slot.start_at)}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<Button
						class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm disabled:opacity-20 transition-opacity"
						disabled={!booking.time}
						onclick={() => (booking.step = 2)}
					>
						Continue
					</Button>
				</div>

				<!-- Step 2: Customer Details -->
			{:else if booking.step === 2}
				<div class="space-y-8" in:fade>
					<button
						onclick={() => (booking.step = 1)}
						class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
					>
						&larr; Back to Calendar
					</button>

					<h2 class="uppercase text-2xl tracking-tighter font-light">
						Your Details
					</h2>

					<p
						class="font-source-code-pro text-[11px] uppercase tracking-[0.2em] text-foreground/80"
					>
						{new Date(booking.time).toLocaleDateString(undefined, {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
						&mdash; {formatTime(booking.time)}
					</p>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
								>First Name</Label
							>
							<Input
								bind:value={booking.customer.first}
								class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
							/>
						</div>
						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
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
							class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
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
							class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
							>Phone Number</Label
						>
						<Input
							type="tel"
							bind:value={booking.customer.phone}
							placeholder="Optional"
							class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
						/>
					</div>

					<Button
						class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm disabled:opacity-20 transition-opacity"
						onclick={() => (booking.step = 3)}
						disabled={!booking.customer.first ||
							!booking.customer.email}
					>
						Review Booking
					</Button>
				</div>

				<!-- Step 3: Review & Confirm -->
			{:else if booking.step === 3}
				<div class="space-y-8" in:fade>
					<button
						onclick={() => (booking.step = 2)}
						class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
					>
						&larr; Back to Details
					</button>

					<h2 class="uppercase text-2xl tracking-tighter font-light">
						Review & Confirm
					</h2>

					<div
						class="space-y-4 border border-border p-6 font-source-code-pro text-[11px] uppercase tracking-[0.2em]"
					>
						<div
							class="flex justify-between py-2 border-b border-border"
						>
							<span class="text-foreground/80">Treatment</span>
							<span>{itemData.name}</span>
						</div>
						<div
							class="flex justify-between py-2 border-b border-border"
						>
							<span class="text-foreground/80">Date</span>
							<span
								>{new Date(booking.time).toLocaleDateString(
									undefined,
									{
										weekday: "short",
										month: "long",
										day: "numeric",
									},
								)}</span
							>
						</div>
						<div
							class="flex justify-between py-2 border-b border-border"
						>
							<span class="text-foreground/80">Time</span>
							<span>{formatTime(booking.time)}</span>
						</div>
						<div
							class="flex justify-between py-2 border-b border-border"
						>
							<span class="text-foreground/80">Duration</span>
							<span>{duration.toFixed(0)} Min</span>
						</div>
						<div class="flex justify-between py-2">
							<span class="text-foreground/80">Price</span>
							<span>${price}</span>
						</div>
					</div>

					{#if booking.error}
						<p class="text-red-500 text-sm font-source-code-pro">
							{booking.error}
						</p>
					{/if}

					<Button
						class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm disabled:opacity-20 transition-opacity"
						onclick={confirmBooking}
						disabled={booking.isLoading}
					>
						{booking.isLoading
							? "Securing Appointment..."
							: "Confirm Booking"}
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
