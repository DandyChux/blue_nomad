<script module lang="ts">
	export type NavItem = {
		label: string;
		href: string;
	};
</script>

<script lang="ts">
	import { MenuIcon } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Sheet from "$lib/components/ui/sheet";
	import { cn, generateSrcSet } from "$lib/utils";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { trackEvent } from "$lib/analytics.svelte";
	import SearchBar from "./search-bar.svelte";

	export const navLinks: NavItem[] = [
		{ label: "Home", href: "/" },
		{ label: "Our Story", href: "/about" },
		{
			label: "Book a Treatment",
			href: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
		},
		{ label: "Shop", href: "https://bluenomadworld.square.site/" },
		{
			label: "Gift Card",
			href: "https://app.squareup.com/gift/ML665NPQYDHTJ/order",
		},
		{ label: "Nomad's Land", href: "/nomadsland" },
	];

	const isExternal = (url: string) =>
		url.startsWith("http://") || url.startsWith("https://");

	function trackClick(label: string) {
		if (label === "Gift Card") {
			trackEvent("Clicked Gift Card");
		} else if (label === "Book a Treatment") {
			trackEvent("Clicked Treatment Booking");
		} else if (label === "Shop") {
			trackEvent("Clicked Shop");
		}
	}

	let isDesktopMenuOpen = $state(false);

	let pathname = $derived(page.url.pathname);
	let isLightPage = $derived(pathname === "/" || pathname === "/nomadsland");
</script>

<header
	class="flex items-center justify-between absolute top-0 w-full bg-transparent p-4 md:p-6 z-1"
>
	<div class="flex items-center">
		<!-- Mobile menu -->
		<Sheet.Root>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<Button
						variant="ghost"
						class="self-start w-auto h-fit md:hidden"
						{...props}
					>
						<MenuIcon
							class={cn(
								"size-6! lg:size-8! xl:size-10! text-black hover:cursor-pointer",
								{
									"text-brand-white": isLightPage,
								},
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

		<!-- Desktop menu toggle -->
		<Button
			variant="ghost"
			class="hidden md:flex self-start w-auto h-fit hover:cursor-pointer hover:bg-transparent"
			onclick={() => (isDesktopMenuOpen = !isDesktopMenuOpen)}
		>
			<!-- {#if isDesktopMenuOpen}
				<MenuIcon
					class={cn(
						"!size-6 lg:!size-8 xl:!size-10 text-black -rotate-90",
						{
							"text-brand-white": isLightPage,
						},
					)}
					strokeWidth={2.5}
				/>
			{:else}
				<MenuIcon
					class={cn("!size-6 lg:!size-8 xl:!size-10 text-black", {
						"text-brand-white": isLightPage,
					})}
					strokeWidth={2.5}
				/>
			{/if} -->
			<MenuIcon
				class={cn("!size-6 lg:!size-8 xl:!size-10 text-black", {
					"text-brand-white": isLightPage,
				})}
				strokeWidth={2.5}
			/>
		</Button>

		<!-- Desktop navigation -->
		<nav
			class={cn("hidden md:flex ml-8", {
				"md:hidden": !isDesktopMenuOpen,
			})}
		>
			<ul
				class={cn("flex gap-8 *:uppercase text-black", {
					"text-brand-white": isLightPage,
				})}
			>
				{#each navLinks as item (item.label)}
					<li
						class="motion-safe:hover:underline motion-safe:hover:underline-offset-2 duration-300 ease-in-out"
					>
						<a
							href={item.href}
							class={cn(
								"font-semibold text-lg font-source-code-pro no-underline",
								{
									"text-brand-white": isLightPage,
								},
							)}
							rel="nofollow noopener noreferrer"
							target={isExternal(item.href)
								? "_blank"
								: undefined}
							onclick={() => {
								trackClick(item.label);
								isDesktopMenuOpen = false;
							}}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<div class="flex max-w-[500px] w-auto items-center justify-end">
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
	</div>
</header>
