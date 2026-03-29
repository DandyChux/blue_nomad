<script lang="ts">
	import { getBooking } from "$lib/context/booking.svelte";
	import * as Sheet from "$lib/components/ui/sheet";

	const booking = getBooking();

	// Your exact Square booking link
	const SQUARE_BOOKING_URL =
		"https://book.squareup.com/appointments/augj56g525h4rw/location/LSP68REJT9SVH/services";
</script>

<Sheet.Root bind:open={booking.isOpen}>
	<Sheet.Content
		side="right"
		class="w-full sm:max-w-2xl flex flex-col p-0 bg-brand-white border-l-0 shadow-2xl"
	>
		<Sheet.Header class="p-6 border-b border-gray-200 text-left shrink-0">
			<Sheet.Title class="uppercase text-2xl font-normal"
				>Book a Treatment</Sheet.Title
			>
		</Sheet.Header>

		<div class="flex-grow w-full relative bg-white">
			{#if booking.isOpen}
				<iframe
					src={SQUARE_BOOKING_URL}
					title="Square Appointments Booking Widget"
					class="absolute top-0 left-0 w-full h-full border-none"
				></iframe>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
