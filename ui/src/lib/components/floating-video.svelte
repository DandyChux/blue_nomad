<script lang="ts">
	let {
		src,
		poster = undefined,
	}: {
		/** Video source URL */
		src: string;
		/** Optional poster image */
		poster?: string;
	} = $props();

	let expanded = $state(false);
	let hidden = $state(true);
	let videoEl = $state<HTMLVideoElement | null>(null);

	$effect(() => {
		const timer = setTimeout(() => (hidden = false), 2500);
		return () => clearTimeout(timer);
	});

	function expand() {
		expanded = true;
		if (videoEl) {
			videoEl.muted = false;
		}
	}

	function collapse() {
		expanded = false;
		if (videoEl) {
			videoEl.muted = true;
		}
	}

	function close() {
		hidden = true;
		if (videoEl) {
			videoEl.pause();
			videoEl.muted = true;
		}
	}
</script>

{#if !hidden}
	<!-- Backdrop — only when expanded -->
	{#if expanded}
		<button
			class="fixed inset-0 z-40 bg-black/40 cursor-default"
			onclick={collapse}
			aria-label="Close video"
		></button>
	{/if}

	<div class="fixed bottom-4 left-4 z-50">
		<div
			class="relative group transition-all duration-500 ease-out
				{expanded ? 'w-[min(520px,88vw)]' : 'w-36 md:w-44'}"
		>
			<!-- Close / dismiss button -->
			<button
				class="absolute -top-2 -right-2 z-20 h-6 w-6 bg-black hover:bg-transparent hover:text-black border-2 border-black text-white items-center justify-center text-xs font-source-code-pro hover:cursor-pointer transition-colors rounded-full
					{expanded ? 'flex' : 'flex md:hidden md:group-hover:flex'}"
				onclick={close}
				aria-label="Close video"
			>
				X
			</button>

			<!-- Minimize button — only when expanded -->
			{#if expanded}
				<button
					class="absolute -top-2 -right-10 z-20 h-6 w-6 bg-black hover:bg-transparent hover:text-black border-2 border-black text-white items-center justify-center text-xs font-source-code-pro flex hover:cursor-pointer transition-colors"
					onclick={collapse}
					aria-label="Minimize video"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-3 h-3"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="4 14 10 14 10 20" />
						<polyline points="20 10 14 10 14 4" />
						<line x1="14" y1="10" x2="21" y2="3" />
						<line x1="3" y1="21" x2="10" y2="14" />
					</svg>
				</button>
			{/if}

			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={videoEl}
				{src}
				{poster}
				autoplay
				loop
				muted
				playsinline
				controls={expanded}
				preload="metadata"
				class="w-full block bg-black max-h-[70dvh] rounded-xl"
			></video>

			<!-- Click-to-expand overlay — only when collapsed -->
			{#if !expanded}
				<button
					class="absolute inset-0 z-10 cursor-pointer group/overlay flex items-center justify-center"
					onclick={expand}
					aria-label="Expand video"
				>
					<div
						class="absolute inset-0 bg-black/0 group-hover/overlay:bg-black/20 transition-colors duration-300"
					></div>
					<div
						class="relative opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-8 h-8 text-white drop-shadow-md"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				</button>
			{/if}
		</div>
	</div>
{/if}
