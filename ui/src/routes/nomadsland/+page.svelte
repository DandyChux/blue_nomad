<script lang="ts">
	import BlogContent from "$lib/components/blog-content.svelte";
	import type { Post } from "$lib/components/blog-content.svelte";
	import apiClient from "$lib/api";
	import { onMount } from "svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Nomad's Land | BLUE NOMAD: A Private Skin Health Studio in NYC</title
	>
</svelte:head>

<section
	class="mx-auto pt-32 px-4 lg:px-10 lg:flex-col text-brand-white relative"
>
	<div class="absolute inset-0 -z-10">
		<img
			src="/media_section_gradient.png"
			alt="Background"
			class="object-cover object-center w-full h-full"
		/>
	</div>

	{#if loading}
		<div class="text-center py-32">
			<p class="text-xl animate-pulse">Loading posts...</p>
		</div>
	{:else}
		<BlogContent {posts} />
	{/if}
</section>
