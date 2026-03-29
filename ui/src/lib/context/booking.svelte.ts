import { getContext, setContext } from "svelte";

export class BookingState {
	isOpen = $state(false);

	toggle() {
		this.isOpen = !this.isOpen;
	}

	open() {
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}
}

const BOOKING_KEY = Symbol("booking");

export function initBooking() {
	return setContext(BOOKING_KEY, new BookingState());
}

export function getBooking() {
	return getContext<BookingState>(BOOKING_KEY);
}
