<script lang="ts">
	import { renderPortableText } from "$lib/portable-text";
	import ShareLinks from "$lib/components/share-links.svelte";
	import { pageTitle } from "../../+layout.svelte";

	let { data } = $props();
	let post = $derived(data.post);
	let formattedDate = $derived(new Date(post.date).toLocaleDateString());
</script>

<svelte:head>
	<title>{pageTitle(post.title)}</title>
	<meta name="description" content={post.description ?? ""} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description ?? ""} />
	<meta property="og:image" content={post.mainImage?.asset?.url ?? ""} />
	<meta property="og:type" content="article" />
	<meta property="article:published_time" content={post.date} />
	<meta property="article:author" content={post.authorName} />
</svelte:head>

{#if data}
	<article
		class="px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh text-secondary-foreground"
	>
		<nav class="mb-8">
			<a href="/nomadsland" class="hover:underline"> ← Back to posts </a>
		</nav>
		<h1 class="uppercase mb-8 leading-12">{post.title}</h1>
		<p>{post.authorName}</p>
		<span>{formattedDate}</span>

		<ShareLinks
			title={post.title}
			description={post.description || ""}
			class="w-full justify-end"
		/>

		{#if post.mainImage}
			<div class="mb-8 relative aspect-4/3 max-w-[750px] mx-auto">
				<enhanced:img
					src={`${post.mainImage.asset.url}?w=800`}
					alt={post.mainImage.alt || ""}
					class="object-contain h-full w-full rounded-md"
					fetchpriority="high"
					placeholder="blur"
				/>
			</div>
		{/if}

		{#if post.body}
			<div class="prose max-w-none font-spectral leading-7">
				{@html renderPortableText(post.body)}
			</div>
		{/if}
	</article>
{/if}
