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
	<div class="absolute inset-0 -z-10">
		<img
			src="/media_section_gradient.png"
			alt="Background"
			class="object-cover object-center w-full h-full"
		/>
	</div>

	<BlogContent {posts} />
</section>
