<script lang="ts">
	import { trackEvent } from "$lib/analytics.svelte";
	import Button, { buttonVariants } from "./ui/button/button.svelte";
	import { page } from "$app/state";

	let hidden = $state(false);

	const pathname = page.url.pathname;

	const blackList = ["/diagnosis"];

	if (blackList.includes(pathname)) {
		hidden = true;
	}

	function handleClose() {
		hidden = true;
	}

	function handleClick() {
		trackEvent("Clicked Diagnostic Quiz");
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
					class: "rounded-full no-underline bg-black text-sm text-white border-2 border-black uppercase font-source-code-pro font-bold hover:bg-transparent hover:text-black h-auto",
					size: "xl",
				})}
				variant="link"
				href="/diagnosis"
				onclick={handleClick}
			>
				<span class="text-center">Skin <br /> Diagnostic</span>
			</Button>
		</div>
	</div>
{/if}
