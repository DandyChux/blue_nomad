<script module lang="ts">
	export type NavItem = {
		label: string;
		href: string;
	};

	export const navLinks: NavItem[] = [
		{ label: "Our Story", href: "/about" },
		{
			label: "Book a Treatment",
			href: "/booking",
		},
		{ label: "Shop", href: "/shop" },
		{ label: "Nomad's Land", href: "/nomadsland" },
	];
</script>

<script lang="ts">
	import { icons, MenuIcon } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Sheet from "$lib/components/ui/sheet";
	import { cn, generateSrcSet } from "$lib/utils";
	import { page } from "$app/state";
	import { trackEvent } from "$lib/analytics.svelte";
	import SearchBar from "./search-bar.svelte";
	import { getCart } from "$lib/context/cart.svelte";
	import Picture from "./picture.svelte";

	let pathname = $derived(page.url.pathname);
	let position = $derived(page.data.navbar?.position ?? "fixed");
	let isLightPage = $derived(page.data.navbar?.variant === "light");
	let scrolled = $state(false);
	let useLightNav = $derived(isLightPage && !scrolled);
	let navTextClass = $derived(
		useLightNav ? "text-brand-white" : "text-black",
	);
	let logoSrc = $derived(
		useLightNav
			? "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-white.svg"
			: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.svg",
	);

	const cart = getCart();

	// const SCROLL_THRESHOLD = 40;
	const SCROLL_THRESHOLD = window.innerHeight;

	function handleScroll() {
		scrolled = window.scrollY > SCROLL_THRESHOLD;
	}

	const isExternal = (url: string) =>
		url.startsWith("http://") || url.startsWith("https://");

	function trackClick(label: string) {
		if (label === "Gift Card") {
			trackEvent("Clicked Gift Card");
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="flex items-center justify-between top-0 w-full bg-transparent backdrop-blur p-4 md:p-6 z-1"
	class:fixed={position === "fixed"}
	class:absolute={position === "absolute"}
	class:scrolled
>
	<div class="flex w-full items-center">
		<!-- Mobile menu icon -->
		<a href="/">
			<Picture
				src={useLightNav
					? "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-small-white.svg"
					: "https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-small.svg"}
				alt="Blue Nomad Logo"
				class="w-6 lg:hidden"
				loading="eager"
			/>
		</a>

		<!-- Mobile menu -->
		<Sheet.Root>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<Button
						variant="ghost"
						class="self-start w-auto h-fit ml-auto md:hidden"
						{...props}
					>
						<MenuIcon
							class={cn(
								"size-6! lg:size-8! xl:size-10! text-black hover:cursor-pointer transition-colors duration-300",
								navTextClass,
							)}
							strokeWidth={2.5}
						/>
					</Button>
				{/snippet}
			</Sheet.Trigger>
			<Sheet.Content
				side="left"
				class="md:hidden shadow-none bg-black text-white border-none pl-4"
			>
				<Sheet.Header>
					<Sheet.Title class="sr-only">Navigation Menu</Sheet.Title>
				</Sheet.Header>
				<nav class="flex flex-col gap-4 mt-8">
					{#each navLinks as item (item.label)}
						<a
							href={item.href}
							rel="nofollow noopener noreferrer"
							target={isExternal(item.href)
								? "_blank"
								: undefined}
							class="font-source-code-pro uppercase text-lg"
							onclick={() => trackClick(item.label)}
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Desktop navigation -->
		<a href="/">
			<Picture
				src={logoSrc}
				alt="Blue Nomad Logo"
				class="w-44 h-auto hidden lg:block"
				loading="eager"
			/>
		</a>
		<nav class="hidden md:flex ml-auto">
			<ul
				class={cn(
					"flex gap-8 *:uppercase text-black transition-colors duration-300",
					navTextClass,
				)}
			>
				{#each navLinks as item (item.label)}
					<li
						class="motion-safe:hover:underline motion-safe:hover:underline-offset-2 duration-300 ease-in-out"
					>
						<a
							href={item.href}
							class={"font-medium text-lg font-source-code-pro no-underline"}
							rel="nofollow noopener noreferrer"
							target={isExternal(item.href)
								? "_blank"
								: undefined}
							onclick={() => {
								trackClick(item.label);
							}}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<!-- <div class="flex max-w-[500px] w-auto items-center justify-end">
		{#if pathname === "/shop"}
			<Button onclick={() => cart.toggle()} variant="outline">
				Cart ({cart.items.length})
			</Button>
		{/if}
		{#if pathname === "/nomadsland"}
			<div class="flex items-center mr-2"><SearchBar /></div>
			<Button
				variant="ghost"
				class="hidden sm:inline-flex text-brand-white hover:text-white hover:bg-black rounded-full hover:cursor-pointer font-source-code-pro"
				href="#subscription-form"
			>
				Get Our Newsletter
			</Button>
		{:else if pathname === "/"}
			<a href="/" class="no-underline block">
				<img
					src="https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-light.png"
					srcset={generateSrcSet(
						"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad-light.png",
						[400, 800, 1200, 1600],
						"webp",
						85,
					)}
					alt="Blue Nomad Logo"
					class="w-full h-auto sm:max-w-[300px]"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
				/>
			</a>
		{/if}
	</div> -->
</header>

<style>
	header.scrolled {
		background: transparent;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom-color: rgba(255, 255, 255, 0.06);
	}
</style>
