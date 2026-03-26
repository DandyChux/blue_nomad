<script>
	import { trackEvent } from "$lib/analytics.svelte";
	import Button, { buttonVariants } from "./ui/button/button.svelte";

	let hidden = $state(false);

	function handleClose() {
		hidden = true;
	}

	function handleClick() {
		trackEvent("Clicked Booking Button");
	}
</script>

{#if !hidden}
	<div class="fixed bottom-0 right-2 z-50">
		<div class="relative group">
			<button
				class="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-black hover:bg-transparent hover:text-black border-2 border-black text-white items-center justify-center text-xs flex md:hidden md:group-hover:flex hover:cursor-pointer"
				onclick={handleClose}
				aria-label="Close booking button"
			>
				X
			</button>

			<Button
				variant="link"
				id="booking-button"
				href="https://book.squareup.com/appointments/augj56g525h4rw/location/LSP68REJT9SVH/services"
				class={buttonVariants({
					variant: "default",
					class: "rounded-full no-underline bg-black text-white border-2 border-black uppercase font-source-code-pro font-bold hover:bg-transparent hover:text-black",
					size: "xl",
				})}
				onclick={handleClick}
				rel="noopener noreferrer"
				target="_blank"
			>
				Begin with a <br /> consultation
			</Button>
		</div>
	</div>
{/if}
