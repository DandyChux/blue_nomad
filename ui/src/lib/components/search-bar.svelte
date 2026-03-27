<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { tick } from "svelte";
	import { cn, debounce } from "$lib/utils";
	import { Input } from "./ui/input";
	import { Button } from "./ui/button";

	let currentQuery = $derived(page.url.searchParams.get("q") ?? "");
	// UI State: Auto-expand on load if there's already a query in the URL
	let isExpanded = $state(!!page.url.searchParams.get("q"));
	let inputRef: HTMLInputElement | null = $state(null);

	function updateUrl(query: string, replaceHistory: boolean) {
		const url = new URL(page.url);

		if (query) {
			url.searchParams.set("q", query);
		} else {
			url.searchParams.delete("q");
		}

		goto(url, { keepFocus: true, replaceState: replaceHistory });
	}

	const debouncedSearch = debounce((query: string) => {
		updateUrl(query, true);
	}, 300);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		debouncedSearch(target.value.trim());
	}

	function handleSearch(event: Event) {
		event.preventDefault();

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const query = formData.get("search")?.toString().trim() ?? "";

		updateUrl(query, false);
	}

	async function handleExpand(event: Event) {
		if (!isExpanded) {
			event.preventDefault(); // Prevent form submission
			isExpanded = true;

			// Wait for the DOM to update, then focus the input
			await tick();
			inputRef?.focus();
		}
	}

	function handleBlur(event: FocusEvent) {
		// Auto-collapse if the input loses focus AND is empty
		if (!currentQuery && isExpanded) {
			// Prevent collapsing if they are clicking the submit button itself
			const relatedTarget = event.relatedTarget as HTMLElement;
			if (!relatedTarget?.closest(".search-form")) {
				isExpanded = false;
			}
		}
	}
</script>

<form
	onsubmit={handleSearch}
	class="search-form flex h-10 items-center justify-end"
>
	<div
		class={cn(
			"relative flex items-center transition-all duration-300 ease-in-out",
			isExpanded ? "w-64" : "w-10",
		)}
	>
		<Input
			bind:ref={inputRef}
			type="search"
			name="search"
			placeholder="Search..."
			bind:value={currentQuery}
			oninput={handleInput}
			onblur={handleBlur}
			class={cn(
				"absolute right-0 h-10 pr-10 transition-all duration-300 border-white text-white",
				isExpanded
					? "w-full opacity-100"
					: "w-10 opacity-0 cursor-pointer border-transparent bg-transparent shadow-none",
			)}
			tabindex={isExpanded ? 0 : -1}
		/>

		<Button
			type={isExpanded ? "submit" : "button"}
			variant="ghost"
			size="icon"
			onclick={handleExpand}
			aria-label="Search"
			class="absolute right-0 top-0 -translate-y-1/2 z-10 h-10 w-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
		>
			<SearchIcon class="size-5 text-white/80" />
		</Button>
	</div>
</form>
