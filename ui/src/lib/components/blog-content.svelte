<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { Card, CardContent } from "$lib/components/ui/card";
	import type { Post } from "$lib/schemas/post";
	import { page } from "$app/state";
	import { generateSrcSet } from "$lib/utils";

	let {
		posts,
	}: {
		posts: Post[];
	} = $props();

	let selectedCategories = $state<string[]>([]);
	let searchQuery = $derived(page.url.searchParams.get("q") ?? "");

	// Define exact category order
	const categoryOrder = [
		"Skin",
		"Scent & Body",
		"Self",
		"Culture",
		"People & Community",
		"Place",
	];

	let uniqueCategories = $derived([
		...new Set(posts.flatMap((p) => p.categories || []).filter(Boolean)),
	]);
	let allCategories = $derived(
		uniqueCategories.sort((a, b) => {
			const indexA = categoryOrder.findIndex(
				(cat) => cat.toLocaleLowerCase() === a.toLowerCase(),
			);
			const indexB = categoryOrder.findIndex(
				(cat) => cat.toLocaleLowerCase() === b.toLowerCase(),
			);

			// If both categories are in the defined list, sort by their order
			if (indexA !== -1 && indexB !== -1) {
				return indexA - indexB;
			}

			// If only a is in the defined list, it comes first
			if (indexA !== -1) return -1;
			if (indexB !== -1) return 1;

			return a.localeCompare(b);
		}),
	);

	let filteredPosts = $derived(
		posts
			.filter((post) => {
				const matchesCategory =
					selectedCategories.length === 0 ||
					post.categories.some((c) => selectedCategories.includes(c));

				const matchesSearch =
					!searchQuery ||
					post.title
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					post.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase());

				return matchesCategory && matchesSearch;
			})
			.sort((a, b) => {
				if (a.datetime && b.datetime) {
					return (
						new Date(b.datetime).getTime() -
						new Date(a.datetime).getTime()
					);
				}
				return 0;
			}),
	);

	let rows = $derived.by(() => {
		const result: Post[][] = [];
		for (let i = 0; i < filteredPosts.length; i += 2) {
			result.push(filteredPosts.slice(i, i + 2));
		}
		return result;
	});

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter(
				(c) => c !== category,
			);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function observeRow(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.classList.add("opacity-100", "translate-y-0");
					node.classList.remove("opacity-0", "translate-y-8");
					observer.unobserve(node);
				}
			},
			{ threshold: 0.1 },
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			},
		};
	}
</script>

<!-- Preload LCP image if exists -->
{#if posts.length > 0 && posts[0].imageUrl}
	<link rel="preload" as="image" href={posts[0].imageUrl} />
{/if}

<div class="text-center">
	<h1 class="mb-8 uppercase">Nomad's <em>L</em>and</h1>

	<!-- Category filters -->
	<div
		class="flex flex-col md:flex-row items-center md:justify-center my-6 mx-auto space-x-6"
	>
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each allCategories as category (category)}
				<Badge
					class="cursor-pointer uppercase hover:underline text-sm sm:text-base hover:bg-transparent hover:text-cold-ivory rounded-md h-auto"
					variant={selectedCategories.includes(category)
						? "default"
						: "ghost"}
					onclick={() => toggleCategory(category)}
				>
					{category}
				</Badge>
			{/each}
			<!-- {#if selectedCategories.length > 0}
				<button
					class="px-4 py-1.5 rounded-full text-sm font-medium uppercase font-harmony text-brand-white/70 hover:text-brand-white transition-colors"
					onclick={() => (selectedCategories = [])}
				>
					Clear filters
				</button>
			{/if} -->
		</div>
	</div>
</div>

<div class="grid gap-8">
	{#if filteredPosts.length === 0}
		<div class="py-16 sm:py-24">
			<div class="mx-auto px-6 lg:px-8">
				<div class="text-center py-12">
					<h3 class="text-xl lg:text-2xl font-semibold mb-2">
						No posts available yet
					</h3>
					<p class="text-lg lg:text-xl">
						Please check back later for new content!
					</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="py-16 sm:py-24">
			<div class="mx-auto px-6 lg:px-8">
				{#each rows as row, rowIndex (rowIndex)}
					<div
						use:observeRow
						class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-16 opacity-0 translate-y-8 transition-all duration-[1500ms] ease-in-out"
						style:transition-delay="{rowIndex * 200}ms"
					>
						{#each row as post, index (post.title)}
							<div class={index % 2 === 1 ? "md:mt-24" : ""}>
								<Card
									class="overflow-hidden transition-transform duration-300 bg-transparent border-none shadow-none rounded-none ring-0"
								>
									<a href="/nomadsland/{post.file}">
										<div
											class="relative aspect-video w-full"
										>
											<img
												src={post.imageUrl}
												srcset={generateSrcSet(
													post.imageUrl,
													[400, 800, 1200, 1600],
													"webp",
													85,
												)}
												alt={post.title}
												class="object-contain w-full h-full"
												loading="lazy"
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
											/>
										</div>
										<CardContent class="pt-4">
											<div
												class="inline-flex items-center gap-x-4"
											>
												{#each post.categories as category (category)}
													<Badge
														variant="ghost"
														class="lowercase text-sm text-brand-white hover:text-white"
													>
														{category}
													</Badge>
												{/each}
											</div>
											<h3
												class="mb-2 text-xl leading-6 text-brand-white group-hover/card:text-cold-ivory"
											>
												{post.title}
											</h3>
											{#if post.author}
												<p
													class="text-sm text-brand-white group-hover/card:text-cold-ivory"
												>
													By {post.author.name}
												</p>
											{/if}
											{#if (rowIndex * 2 + index) % 4 === 0}
												<p
													class="text-base text-brand-white group-hover/card:text-cold-ivory mt-2 font-spectral font-normal"
												>
													{post.description}
												</p>
											{/if}
										</CardContent>
									</a>
								</Card>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
