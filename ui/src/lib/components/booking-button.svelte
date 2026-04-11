<script lang="ts">
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
				id="booking-button"
				class={buttonVariants({
					variant: "default",
					class: "rounded-full no-underline bg-black text-white border-2 border-black uppercase font-source-code-pro font-bold hover:bg-transparent hover:text-black h-auto md:[writing-mode:horizontal-tb] [writing-mode:sideways-lr] text-[10px] tracking-[0.1em] px-3 py-6 md:px-12 md:py-2 md:text-sm md:tracking-normal",
					size: "xl",
				})}
				variant="link"
				href="/diagnosis"
				onclick={handleClick}
			>
				<span class="md:hidden">Skin Diagnostic</span>
				<span class="hidden md:inline text-center"
					>Skin <br /> Diagnostic</span
				>
			</Button>
		</div>
	</div>
{/if}
