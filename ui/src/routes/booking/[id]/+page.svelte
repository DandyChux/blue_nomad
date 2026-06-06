<script lang="ts">
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Calendar } from "$lib/components/ui/calendar";
	import Picture from "$lib/components/picture.svelte";
	import { generateSrcSet } from "$lib/utils";
	import { apiClient, ApiError } from "$lib/api";
	import {
		today,
		getLocalTimeZone,
		type DateValue,
	} from "@internationalized/date";
	import { fade } from "svelte/transition";
	import type {
		AvailabilitySlot,
		SearchAvailabilityResponse,
	} from "$lib/schemas";
	import {
		loadSquare,
		type SquareCard,
		type SquarePayments,
	} from "$lib/square-payments";
	import { onMount } from "svelte";

	interface PaymentConfig {
		application_id: string;
		location_id: string;
	}

	interface CreateBookingRequestResponse {
		request_id: string;
		status: string;
	}

	interface AuthorizeBookingResponse {
		request_id: string;
		booking_id?: string;
		status: string;
		booking_status?: string;
	}

	let { data } = $props();

	// Booking flow state
	const booking = $state({
		step: 1 as 1 | 2 | 3 | 4,
		isLoading: false,
		error: "",
		slots: [] as AvailabilitySlot[],
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

	function normalizePhone(raw: string): string {
		const trimmed = raw.trim();
		if (!trimmed) return "";

		if (trimmed.startsWith("+")) {
			const digits = "+" + trimmed.slice(1).replace(/\D/g, "");
			if (/^\+\d{9,16}$/.test(digits)) return digits;
			return "";
		}

		const digits = trimmed.replace(/\D/g, "");

		// US 10-digit
		if (digits.length === 10) {
			return `+1${digits}`;
		}

		// US 11-digit starting with 1
		if (digits.length === 11 && digits.startsWith("1")) {
			return `+${digits}`;
		}

		return "";
	}

	const normalizedPhone = $derived(normalizePhone(booking.customer.phone));

	const phoneValidationMessage = $derived(
		booking.customer.phone && !normalizedPhone
			? "Enter a valid mobile number"
			: "",
	);

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
	const selectedDateLabel = $derived(
		booking.time
			? new Date(booking.time).toLocaleDateString(undefined, {
					weekday: "long",
					month: "long",
					day: "numeric",
				})
			: "",
	);
	const canContinueFromDetails = $derived(
		Boolean(
			booking.customer.first &&
			booking.customer.last &&
			booking.customer.email &&
			normalizedPhone &&
			booking.time,
		),
	);

	let activeImageIndex = $state(0);
	let cardContainer = $state<HTMLDivElement | null>(null);
	let squareCard: SquareCard | null = null;
	let squarePayments: SquarePayments | null = null;

	const payment = $state({
		config: null as PaymentConfig | null,
		configLoading: true,
		initializing: false,
		submitting: false,
		cardReady: false,
		error: "",
		requestId: "",
	});

	const minDate = today(getLocalTimeZone());
	const formatTime = (rfc: string) =>
		new Date(rfc).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	onMount(() => {
		void loadPaymentConfig();

		return () => {
			void destroyCard();
		};
	});

	$effect(() => {
		if (booking.date) {
			void loadAvailability(booking.date);
		}
	});

	$effect(() => {
		if (
			booking.step !== 3 ||
			!payment.config ||
			!cardContainer ||
			payment.initializing ||
			payment.cardReady ||
			squareCard
		) {
			return;
		}

		void initializeCard();
	});

	$effect(() => {
		if (booking.step === 3) return;
		if (!squareCard) return;
		void destroyCard();
	});

	$effect(() => {
		if (booking.step) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	});

	async function loadPaymentConfig() {
		payment.configLoading = true;
		payment.error = "";

		try {
			payment.config =
				await apiClient.get<PaymentConfig>("/booking/config");
		} catch (err) {
			payment.error =
				err instanceof ApiError
					? err.userMessage
					: "Unable to load secure payment form.";
		} finally {
			payment.configLoading = false;
		}
	}

	async function loadAvailability(date: DateValue) {
		booking.time = "";
		booking.selectedSlot = undefined;
		booking.isLoading = true;
		booking.error = "";
		resetPendingRequest();

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
		} catch (err) {
			booking.error =
				err instanceof ApiError
					? err.userMessage
					: "Error fetching times.";
			booking.slots = [];
		} finally {
			booking.isLoading = false;
		}
	}

	function selectSlot(slot: AvailabilitySlot) {
		booking.time = slot.start_at;
		booking.selectedSlot = slot;
		booking.error = "";
		resetPendingRequest();
	}

	function goToDetails() {
		if (!booking.time) return;
		booking.step = 2;
	}

	function goBackToCalendar() {
		booking.step = 1;
		resetPendingRequest();
	}

	function goToPayment() {
		if (!canContinueFromDetails) return;
		booking.error = "";
		payment.error = "";
		booking.step = 3;
	}

	function goBackToDetails() {
		booking.step = 2;
		resetPendingRequest();
	}

	function resetPendingRequest() {
		payment.requestId = "";
		payment.error = "";
	}

	async function initializeCard() {
		if (!payment.config || !cardContainer) return;

		payment.initializing = true;
		payment.error = "";

		try {
			const Square = await loadSquare(payment.config.application_id);
			squarePayments = Square.payments(
				payment.config.application_id,
				payment.config.location_id,
			);
			squareCard = await squarePayments.card();
			await squareCard.attach(cardContainer);
			payment.cardReady = true;
		} catch (err) {
			payment.error =
				err instanceof Error
					? err.message
					: "Unable to initialize secure card entry.";
		} finally {
			payment.initializing = false;
		}
	}

	async function destroyCard() {
		payment.cardReady = false;

		if (squareCard?.destroy) {
			try {
				await squareCard.destroy();
			} catch {
				// noop
			}
		}

		squareCard = null;
		squarePayments = null;
	}

	async function ensureBookingRequest() {
		if (payment.requestId) return payment.requestId;

		const teamMemberId =
			booking.selectedSlot?.appointment_segments?.[0]?.team_member_id;
		const serviceVariationVersion =
			booking.selectedSlot?.appointment_segments?.[0]
				?.service_variation_version;

		if (!teamMemberId || !serviceVariationVersion) {
			throw new Error(
				"Missing appointment details. Please select your appointment time again.",
			);
		}

		const result = await apiClient.post<CreateBookingRequestResponse>(
			"/booking/request",
			{
				service_variation_id: variation?.id,
				team_member_id: teamMemberId,
				service_variation_version: serviceVariationVersion,
				start_at: booking.time,
				given_name: booking.customer.first,
				family_name: booking.customer.last,
				email_address: booking.customer.email,
				phone_number: normalizedPhone,
				service_name: itemData.name,
				price_cents: priceCents,
			},
		);

		payment.requestId = result.request_id;
		return result.request_id;
	}

	async function submitBooking() {
		if (!squareCard || !squarePayments) {
			payment.error =
				"Secure card form is not ready yet. Please try again.";
			return;
		}

		booking.isLoading = true;
		payment.submitting = true;
		booking.error = "";
		payment.error = "";

		try {
			const requestId = await ensureBookingRequest();
			const tokenResult = await squareCard.tokenize();

			if (tokenResult.status !== "OK" || !tokenResult.token) {
				throw new Error(
					tokenResult.errors?.[0]?.message ||
						"Your card details could not be verified.",
				);
			}

			let verificationToken: string | undefined;
			if (squarePayments.verifyBuyer) {
				const verificationResult = await squarePayments.verifyBuyer(
					tokenResult.token,
					{
						amount: (priceCents / 100).toFixed(2),
						currencyCode: "USD",
						intent: "CHARGE",
						billingContact: {
							givenName: booking.customer.first,
							familyName: booking.customer.last,
							email: booking.customer.email,
							phone: normalizedPhone,
						},
					},
				);
				verificationToken = verificationResult.token;
			}

			await apiClient.post<AuthorizeBookingResponse>(
				`/booking/requests/${requestId}/authorize`,
				{
					source_id: tokenResult.token,
					verification_token: verificationToken,
				},
			);

			saveConfirmationSummary();
			await goto("/booking/confirmed");
		} catch (err) {
			if (err instanceof ApiError) {
				payment.error = err.isConflict
					? "That time slot is no longer available. Please choose another."
					: err.userMessage;

				if (err.isConflict) {
					payment.requestId = "";
					booking.time = "";
					booking.selectedSlot = undefined;
					booking.step = 1;
				}
			} else {
				payment.error =
					err instanceof Error
						? err.message
						: "Could not complete booking. Please try again.";
			}
		} finally {
			booking.isLoading = false;
			payment.submitting = false;
		}
	}

	function saveConfirmationSummary() {
		localStorage.setItem(
			"bn-booking",
			JSON.stringify({
				name: booking.customer.first,
				service: itemData.name,
				date: selectedDateLabel,
				time: formatTime(booking.time),
			}),
		);
	}
</script>

<svelte:head>
	<title>{itemData.name} | Blue Nomad Booking</title>
</svelte:head>

<section class="min-h-screen pt-28 lg:pt-36 px-6 md:px-12 lg:px-16 pb-20">
	<a
		href="/booking"
		class="inline-block font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors mb-10"
	>
		&larr; Back to Treatments
	</a>

	<div
		class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
	>
		<div class="flex flex-col gap-4 lg:sticky lg:top-36 lg:self-start">
			<div class="relative w-full aspect-3/4 bg-muted overflow-hidden">
				{#key activeImageIndex}
					<div in:fade={{ duration: 300 }} class="absolute inset-0">
						<Picture
							src={imageUrls[activeImageIndex] ||
								service.image_url}
							alt={`${itemData.name} - Image ${activeImageIndex + 1}`}
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
					{#each imageUrls as url, i (url)}
						<button
							class={`shrink-0 w-20 h-20 border-2 overflow-hidden transition-colors ${activeImageIndex === i ? "border-foreground" : "border-transparent hover:border-border"}`}
							onclick={() => (activeImageIndex = i)}
						>
							<Picture
								src={url}
								alt={`${itemData.name} thumbnail ${i + 1}`}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-8 lg:py-8">
			<div class="space-y-6 border-b border-border pb-8">
				<h1 class="uppercase font-light leading-[0.95]">
					{itemData.name}
				</h1>

				<div
					class="flex gap-8 font-source-code-pro text-[11px] uppercase tracking-[0.2em]"
				>
					<span>{duration.toFixed(0)} Min</span>
					<span>${price}</span>
				</div>

				{#if itemData.description}
					<p
						class="text-base leading-relaxed text-black font-spectral"
					>
						{itemData.description}
					</p>
				{/if}
			</div>

			<div
				class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80"
			>
				Step 0{booking.step} — 03
			</div>

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
									{#each Array.from( { length: 6 }, ) as _, index (index)}
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
									{#each booking.slots as slot (slot.start_at)}
										<button
											class={`py-4 border font-source-code-pro text-[11px] tracking-wider transition-all duration-300 ${booking.time === slot.start_at ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground text-foreground bg-transparent"}`}
											onclick={() => selectSlot(slot)}
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
						onclick={goToDetails}
					>
						Continue
					</Button>
				</div>
			{:else if booking.step === 2}
				<div class="space-y-8" in:fade>
					<button
						onclick={goBackToCalendar}
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
						{selectedDateLabel} &mdash; {formatTime(booking.time)}
					</p>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
							>
								First Name
							</Label>
							<Input
								bind:value={booking.customer.first}
								class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
							/>
						</div>
						<div class="space-y-2">
							<Label
								class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
							>
								Last Name
							</Label>
							<Input
								bind:value={booking.customer.last}
								class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label
							class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
						>
							Email Address
						</Label>
						<Input
							type="email"
							bind:value={booking.customer.email}
							class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
						/>
					</div>

					<div class="space-y-2">
						<Label
							class="text-[10px] font-source-code-pro uppercase tracking-widest text-foreground/80"
						>
							Phone Number
						</Label>
						<Input
							type="tel"
							inputmode="tel"
							autocomplete="tel"
							bind:value={booking.customer.phone}
							required
							placeholder="(555) 555-5555"
							class="rounded-none border-0 border-b border-border bg-transparent px-0 h-12 focus-visible:ring-0 focus-visible:border-foreground shadow-none text-lg"
						/>
						{#if phoneValidationMessage}
							<p
								class="text-destructuive text-xs font-source-code-pro uppercase tracking-wide"
							>
								{phoneValidationMessage}
							</p>
						{/if}
					</div>

					<Button
						class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm disabled:opacity-20 transition-opacity"
						onclick={goToPayment}
						disabled={!canContinueFromDetails}
					>
						Continue to Payment
					</Button>
				</div>
			{:else if booking.step === 3}
				<div class="space-y-8" in:fade>
					<button
						onclick={goBackToDetails}
						class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
					>
						&larr; Back to Details
					</button>

					<h2 class="uppercase text-2xl tracking-tighter font-light">
						Payment & Confirm
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

					<div
						class="space-y-3 border border-border/50 p-6 bg-black/5 dark:bg-white/5"
					>
						<h3
							class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80"
						>
							Payment Details
						</h3>

						<p class="text-sm leading-relaxed text-foreground/70">
							Enter your card details below to secure your
							appointment request. Your payment method is
							collected securely on-site and your appointment is
							only created in Square after authorization succeeds.
						</p>

						{#if payment.configLoading}
							<div
								class="h-20 border border-border/60 animate-pulse"
							></div>
						{:else if payment.error && !payment.cardReady && !payment.submitting}
							<p class="text-red-500 text-sm">{payment.error}</p>
						{:else}
							<div
								bind:this={cardContainer}
								class="min-h-[110px] border border-border bg-background px-4 py-3"
							></div>
						{/if}
					</div>

					<div
						class="space-y-3 border border-border/50 p-6 bg-black/5 dark:bg-white/5"
					>
						<h3
							class="font-source-code-pro text-[10px] uppercase tracking-widest text-foreground/80"
						>
							Cancellation Policy
						</h3>
						<p class="text-sm leading-relaxed text-foreground/70">
							Cancellations or reschedules must be made at least
							<strong class="text-foreground">24 hours</strong> before
							your appointment. Late cancellations or no-shows may be
							subject to a fee equal to the full service price. By continuing,
							you agree to these terms.
						</p>
					</div>

					{#if payment.error && (payment.cardReady || payment.submitting)}
						<p class="text-red-500 text-sm font-source-code-pro">
							{payment.error}
						</p>
					{/if}

					<Button
						class="w-full uppercase rounded-none h-16 bg-foreground text-background tracking-widest font-source-code-pro text-sm disabled:opacity-20 transition-opacity"
						onclick={submitBooking}
						disabled={booking.isLoading ||
							payment.configLoading ||
							payment.initializing ||
							payment.submitting ||
							!payment.cardReady}
					>
						{payment.submitting
							? "Securing Appointment..."
							: "Secure Appointment"}
					</Button>
				</div>
			{/if}
		</div>
	</div>
</section>
