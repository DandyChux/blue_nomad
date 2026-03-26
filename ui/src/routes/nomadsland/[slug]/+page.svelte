<script lang="ts">
	import { renderPortableText } from "$lib/portable-text.js";

	let { data } = $props();
</script>

<!-- {#if data}
	<article>
		<h1>{data.post.title}</h1>
		{#if data.post.body}
			<PortableText
				value={data.post.body}
				components={{

				}}
			/>
		{/if}
	</article>
{/if} -->
{#if data}
	<article
		class="px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh text-secondary-foreground"
	>
		<h1 class="uppercase mb-8 leading-12">{data.post.title}</h1>

		{#if data.post.body}
			<div class="prose max-w-none font-spectral leading-7">
				{@html renderPortableText(data.post.body)}
			</div>
		{/if}
	</article>
{/if}
