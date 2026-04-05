<script lang="ts">
	import { getBooking } from "$lib/context/booking.svelte";
	import * as Sheet from "$lib/components/ui/sheet";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar"; // shadcn
	import { apiClient } from "$lib/api";
	import {
		CalendarDate,
		today,
		getLocalTimeZone,
	} from "@internationalized/date";
	import type {
		CatalogListResponse,
		SearchAvailabilityResponse,
	} from "$lib/schemas";

	const booking = getBooking();

	// UI State
	let step = $state(1); // 1: List, 1.5: Detail, 2: Date/Time, 3: Form, 4: Success
	let isLoading = $state(false);
	let errorMsg = $state("");

	// Data State
	let services = $state<any[]>([]);
	let availableSlots = $state<any[]>([]);

	// Selection State
	let selectedService = $state<any>(null);
	let selectedVariationId = $state("");
	let selectedDateValue = $state<CalendarDate | undefined>(undefined);
	let selectedTime = $state(""); // RFC3339

	// Customer State
	let firstName = $state("");
	let lastName = $state("");
	let email = $state("");
	let phone = $state("");

	// Helpers
	const minDate = today(getLocalTimeZone());
	const formatTime = (rfc: string) =>
		new Date(rfc).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	// Square sends duration in milliseconds (sometimes seconds depending on API version)
	// We'll assume seconds for most Appointment variations.
	const getDuration = (variation: any) => {
		const seconds = variation.item_variation_data?.service_duration || 0;
		return seconds / 60; // Returns minutes
	};

	$effect(() => {
		if (booking.isOpen && services.length === 0) loadServices();
	});

	async function loadServices() {
		isLoading = true;
		try {
			const res =
				await apiClient.get<CatalogListResponse>("/booking/services");
			services =
				res.objects?.filter(
					(obj) =>
						obj.type === "ITEM" &&
						obj.item_data?.product_type === "APPOINTMENTS_SERVICE",
				) || [];
		} catch (e) {
			errorMsg = "Failed to load treatments.";
		} finally {
			isLoading = false;
		}
	}

	async function loadAvailability(date: CalendarDate) {
		selectedTime = "";
		isLoading = true;
		errorMsg = "";

		const dateStr = date.toString(); // YYYY-MM-DD
		const startAt = `${dateStr}T00:00:00Z`;
		const endAt = `${dateStr}T23:59:59Z`;

		try {
			const res = await apiClient.post<SearchAvailabilityResponse>(
				"/booking/availability",
				{
					service_variation_id: selectedVariationId,
					start_at: startAt,
					end_at: endAt,
				},
			);
			availableSlots = res.availabilities || [];
		} catch (e) {
			errorMsg = "Error fetching times.";
			availableSlots = [];
		} finally {
			isLoading = false;
		}
	}

	// Trigger availability search when the shadcn calendar value changes
	$effect(() => {
		if (selectedDateValue) loadAvailability(selectedDateValue);
	});

	async function confirmBooking() {
		isLoading = true;
		try {
			await apiClient.post("/booking/create", {
				service_variation_id: selectedVariationId,
				start_at: selectedTime,
				given_name: firstName,
				family_name: lastName,
				email_address: email,
				phone_number: phone,
			});
			step = 4;
		} catch (e) {
			errorMsg = "Slot no longer available. Please try another.";
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		setTimeout(() => {
			step = 1;
			selectedService = null;
			selectedVariationId = "";
			selectedDateValue = undefined;
			selectedTime = "";
			firstName = "";
			lastName = "";
			email = "";
			phone = "";
		}, 300);
	}
</script>

<Sheet.Root
	bind:open={booking.isOpen}
	onOpenChange={(open) => !open && handleClose()}
>
	<Sheet.Content
		side="right"
		class="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 bg-white"
	>
		<Sheet.Header class="p-6 border-b border-gray-100 shrink-0">
			<Sheet.Title class="uppercase text-2xl font-normal tracking-tight">
				{#if step === 1}Treatments
				{:else if step === 1.5}Details
				{:else if step === 2}Schedule
				{:else if step === 3}Details
				{:else}Success{/if}
			</Sheet.Title>
		</Sheet.Header>

		<div class="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
			{#if errorMsg}
				<div
					class="bg-red-50 text-red-600 p-4 text-xs font-source-code-pro"
				>
					{errorMsg}
				</div>
			{/if}

			{#if step === 1}
				<div class="flex flex-col gap-4">
					{#each services as service}
						<button
							class="text-left border border-gray-100 p-6 hover:border-black transition-all"
							onclick={() => {
								selectedService = service;
								step = 1.5;
							}}
						>
							<h3 class="uppercase text-lg mb-1">
								{service.item_data.name}
							</h3>
							<p
								class=" text-xs font-source-code-pro uppercase tracking-widest"
							>
								View Details &rarr;
							</p>
						</button>
					{/each}
				</div>
			{:else if step === 1.5}
				<div class="flex flex-col gap-6">
					<button
						class="text-xs font-source-code-pro uppercase hover:text-black"
						onclick={() => (step = 1)}>&larr; Back</button
					>

					<div class="space-y-4">
						<h2 class="text-3xl uppercase tracking-tighter">
							{selectedService.item_data.name}
						</h2>

						<div
							class="flex gap-6 border-y border-gray-100 py-4 font-source-code-pro text-sm uppercase"
						>
							<div>
								<span class=" block text-[10px]">Duration</span>
								{getDuration(
									selectedService.item_data.variations[0],
								)} MIN
							</div>
							<div>
								<span class=" block text-[10px]"
									>Investment</span
								>
								${selectedService.item_data.variations[0]
									.item_variation_data.price_money.amount /
									100}
							</div>
						</div>

						<p class="leading-relaxed">
							{selectedService.item_data.description ||
								"No description provided."}
						</p>
					</div>

					<Button
						class="w-full uppercase rounded-none h-14 bg-black text-white mt-8"
						onclick={() => {
							selectedVariationId =
								selectedService.item_data.variations[0].id;
							step = 2;
						}}
					>
						Book This Treatment
					</Button>
				</div>
			{:else if step === 2}
				<div class="flex flex-col gap-8">
					<button
						class="text-xs font-source-code-pro uppercase hover:text-black"
						onclick={() => (step = 1.5)}
						>&larr; Back to Details</button
					>

					<div
						class="flex justify-center border-b border-gray-100 pb-8"
					>
						<Calendar
							type="single"
							bind:value={selectedDateValue}
							minValue={minDate}
							class="rounded-none border-none shadow-none"
						/>
					</div>

					{#if selectedDateValue}
						<div class="space-y-4">
							<Label
								class="text-[10px] font-source-code-pro  uppercase tracking-widest"
								>Select an opening</Label
							>
							{#if isLoading}
								<div
									class="animate-pulse text-sm font-source-code-pro uppercase"
								>
									Scanning availability...
								</div>
							{:else if availableSlots.length === 0}
								<p class="text-sm italic">
									Fully booked for this date.
								</p>
							{:else}
								<div class="grid grid-cols-3 gap-2">
									{#each availableSlots as slot}
										<button
											class="border py-3 text-center font-source-code-pro text-xs transition-all {selectedTime ===
											slot.start_at
												? 'bg-black text-white border-black'
												: 'border-gray-100 hover:border-black'}"
											onclick={() =>
												(selectedTime = slot.start_at)}
										>
											{formatTime(slot.start_at)}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<Button
						class="w-full uppercase rounded-none h-14 bg-black"
						disabled={!selectedTime}
						onclick={() => (step = 3)}
					>
						Next Step
					</Button>
				</div>
			{:else if step === 3}
				<div class="flex flex-col gap-6">
					<button
						class="text-xs font-source-code-pro uppercase"
						onclick={() => (step = 2)}>&larr; Change Time</button
					>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<Label class="text-[10px] uppercase"
								>First Name</Label
							><Input
								bind:value={firstName}
								class="rounded-none"
							/>
						</div>
						<div class="space-y-1">
							<Label class="text-[10px] uppercase"
								>Last Name</Label
							><Input
								bind:value={lastName}
								class="rounded-none"
							/>
						</div>
					</div>
					<div class="space-y-1">
						<Label class="text-[10px] uppercase">Email</Label><Input
							bind:value={email}
							class="rounded-none"
						/>
					</div>
					<div class="space-y-1">
						<Label class="text-[10px] uppercase">Phone</Label><Input
							bind:value={phone}
							class="rounded-none"
						/>
					</div>
					<Button
						class="w-full uppercase rounded-none h-14 bg-black"
						onclick={confirmBooking}
						disabled={isLoading}
					>
						{isLoading ? "Securing Slot..." : "Complete Booking"}
					</Button>
				</div>
			{:else}
				<div
					class="flex flex-col items-center justify-center h-full text-center gap-6 pb-20"
				>
					<h2 class="uppercase text-3xl tracking-tighter">
						See you soon.
					</h2>
					<p class=" font-source-code-pro text-sm uppercase">
						Confirmation sent to {email}
					</p>
					<Button
						variant="outline"
						class="rounded-none px-12 border-black"
						onclick={() => booking.close()}>Close</Button
					>
				</div>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
