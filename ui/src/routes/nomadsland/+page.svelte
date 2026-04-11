<script lang="ts">
	import BlogContent from "$lib/components/blog-content.svelte";
	import { pageTitle } from "../+layout.svelte";

	let { data } = $props();
	let posts = $derived(data.posts);
</script>

<svelte:head>
	<title>{pageTitle("Nomad's Land")}</title>
</svelte:head>

<section
	class="mx-auto pt-32 px-4 lg:px-10 lg:flex-col text-brand-white relative bg-media-section-gradient bg-center bg-no-repeat bg-cover"
>
	<BlogContent {posts} />
</section>
