<script lang="ts">
	import { page } from "$app/state";
	import { cn } from "$lib/utils";
	// Assuming you are using shadcn-svelte based on your previous prompt
	import { Button } from "$lib/components/ui/button";
	import { Share2 } from "@lucide/svelte";

	// 1. Define Svelte 5 Props using an interface
	interface Props {
		title: string;
		description?: string;
		class?: string;
		[key: string]: any; // Allow rest attributes like HTMLDivElement props
	}

	// 2. Destructure props using the $props() rune
	let {
		title,
		description = "",
		class: className,
		...rest
	}: Props = $props();

	// 3. Use `page` to get the full URL, and $derived so it updates if the route changes
	let fullUrl = $derived(page.url.href);

	let encodedUrl = $derived(encodeURIComponent(fullUrl));
	let encodedTitle = $derived(encodeURIComponent(title));
	let encodedDescription = $derived(encodeURIComponent(description));

	function shareOnTwitter() {
		window.open(
			`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			"_blank",
		);
	}

	function shareOnFacebook() {
		window.open(
			`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			"_blank",
		);
	}

	function shareOnLinkedIn() {
		window.open(
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedDescription}&title=${encodedTitle}`,
			"_blank",
		);
	}
</script>

<div class={cn("my-6 flex items-center gap-2", className)} {...rest}>
	<span class="flex items-center gap-1 text-sm font-medium">
		<Share2 size={16} /> Share:
	</span>

	<Button
		variant="outline"
		size="sm"
		class="cursor-pointer rounded-full"
		onclick={shareOnTwitter}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-brand-x"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M4 4l11.733 16h4.267l-11.733 -16z" />
			<path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
		</svg>
		<span class="sr-only">Share on X(Twitter)</span>
	</Button>

	<Button
		variant="outline"
		size="sm"
		class="cursor-pointer rounded-full"
		onclick={shareOnFacebook}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path
				d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"
			/>
		</svg>
		<span class="sr-only">Share on Facebook</span>
	</Button>

	<Button
		variant="outline"
		size="sm"
		class="cursor-pointer rounded-full"
		onclick={shareOnLinkedIn}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M8 11v5" /><path d="M8 8v.01" />
			<path d="M12 16v-5" />
			<path d="M16 16v-3a2 2 0 1 0 -4 0" />
			<path
				d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z"
			/>
		</svg>
		<span class="sr-only">Share on LinkedIn</span>
	</Button>
</div>
