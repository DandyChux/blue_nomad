<script lang="ts">
	import { getCart } from "$lib/context/cart.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Sheet from "$lib/components/ui/sheet";
	import apiClient, { ApiError } from "$lib/api";
	import Picture from "./picture.svelte";
	import { toast } from "svelte-sonner";

	const cart = getCart();
	let isCheckingOut = $state(false);
	let itemCount = $derived(
		cart.items.reduce((sum, item) => sum + item.quantity, 0),
	);

	type StockErrorBody = {
		error?: string;
		message?: string;
		variation_id?: string;
		requested?: number;
		available?: number;
	};

	async function handleCheckout() {
		if (cart.items.length === 0) return;

		isCheckingOut = true;
		try {
			const response = await apiClient.post<{ url?: string }>(
				"/checkout",
				{
					items: cart.items.map((i) => ({
						id: i.id,
						quantity: i.quantity,
					})),
				},
			);

			if (response.url) {
				window.location.href = response.url;
			} else {
				toast.error("Checkout failed. Please try again.");
			}
		} catch (err) {
			if (err instanceof ApiError && err.isConflict) {
				const body = err.body<StockErrorBody>();
				const line = cart.items.find(
					(i) => i.id === body?.variation_id,
				);
				const name = line
					? `${line.name}${line.variationName ? ` (${line.variationName})` : ""}`
					: "An item in your bag";

				if (
					body &&
					typeof body.available === "number" &&
					typeof body.requested === "number"
				) {
					// Clamp the cart so the user can retry cleanly
					if (line && body.available > 0) {
						cart.setQuantity(line.cartItemId, body.available);
					} else if (line) {
						cart.remove(line.cartItemId);
					}

					toast.error(
						`${name} only has ${body.available} left (you requested ${body.requested}). Your bag has been updated — please review and try again.`,
					);
				} else {
					toast.error(
						err.userMessage ||
							"Some items in your bag are no longer available.",
					);
				}
			} else if (err instanceof ApiError) {
				toast.error(err.userMessage);
			} else {
				console.error("Checkout error:", err);
				toast.error("Checkout failed. Please try again.");
			}
		} finally {
			isCheckingOut = false;
		}
	}
</script>

<Sheet.Root bind:open={cart.isOpen}>
	<Sheet.Content
		side="right"
		class="w-full sm:max-w-md flex flex-col p-0 bg-brand-white border-l-0 shadow-2xl"
	>
		<Sheet.Header class="p-6 border-b border-gray-200 text-left">
			<Sheet.Title class="uppercase text-2xl font-normal">
				Your Bag
			</Sheet.Title>
			{#if itemCount > 0}
				<p
					class="mt-1 font-source-code-pro text-xs uppercase tracking-wide"
				>
					{itemCount}
					{itemCount === 1 ? "item" : "items"}
				</p>
			{/if}
		</Sheet.Header>

		<div class="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
			{#if cart.items.length === 0}
				<div
					class="h-full flex flex-col items-center justify-center text-center"
				>
					<p class="uppercase font-source-code-pro mb-4">
						Your bag is empty.
					</p>
					<Button
						variant="outline"
						class="uppercase rounded-full font-source-code-pro border-black hover:bg-black hover:text-white"
						onclick={() => cart.close()}
					>
						Continue Shopping
					</Button>
				</div>
			{:else}
				{#each cart.items as item (item.cartItemId)}
					<div class="flex gap-4">
						<div
							class="w-20 h-24 bg-muted shrink-0 overflow-hidden"
						>
							{#if item.imageUrl}
								<Picture
									src={item.imageUrl}
									alt={item.name}
									class="w-full h-full object-cover"
									loading="lazy"
									sizes="80px"
								/>
							{/if}
						</div>

						<div class="flex flex-col flex-grow justify-between">
							<div>
								<div class="flex justify-between gap-4">
									<h3 class="uppercase text-sm leading-tight">
										{item.name}
									</h3>
									<span class="font-source-code-pro text-sm"
										>${item.price.toFixed(2)}</span
									>
								</div>
								<p class="text-xs mt-1">
									{item.variationName}
								</p>
							</div>
							<div
								class="mt-3 flex items-center justify-between gap-4"
							>
								<div
									class="flex items-center gap-2 rounded-full border border-black px-1 py-1"
								>
									<Button
										variant="ghost"
										size="icon-xs"
										class="rounded-full font-source-code-pro text-sm hover:bg-transparent hover:text-black"
										aria-label={`Decrease quantity of ${item.name}`}
										onclick={() =>
											cart.decrement(item.cartItemId)}
									>
										−
									</Button>
									<span
										class="min-w-6 text-center font-source-code-pro text-xs"
									>
										{item.quantity}
									</span>
									<Button
										variant="ghost"
										size="icon-xs"
										class="rounded-full font-source-code-pro text-sm hover:bg-transparent hover:text-black"
										aria-label={`Increase quantity of ${item.name}`}
										onclick={() =>
											cart.increment(item.cartItemId)}
										disabled={item.maxQuantity !== null &&
											item.quantity >= item.maxQuantity}
									></Button>
								</div>

								<button
									class="text-xs uppercase text-left hover:text-black transition-colors underline underline-offset-4"
									onclick={() => cart.remove(item.cartItemId)}
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		{#if cart.items.length > 0}
			<Sheet.Footer
				class="p-6 border-t border-gray-200 bg-gray-50 mt-auto sm:flex-col gap-0"
			>
				<div
					class="flex justify-between items-center mb-6 uppercase w-full"
				>
					<span>Subtotal</span>
					<span class="font-source-code-pro"
						>${cart.total.toFixed(2)}</span
					>
				</div>

				<Button
					class="w-full uppercase rounded-full h-12 bg-black text-white hover:bg-black/80 font-source-code-pro tracking-tight"
					href="/checkout"
					onclick={handleCheckout}
					disabled={isCheckingOut}
				>
					{isCheckingOut ? "Preparing bag..." : "Checkout"}
				</Button>
				<p class="text-center text-xs mt-4 font-source-code-pro w-full">
					Taxes calculated at checkout.
				</p>

				<div
					class="mt-4 rounded-md border border-border bg-muted/30 p-4 text-left"
				>
					<p
						class="font-source-code-pro text-[11px] uppercase tracking-widest"
					>
						In-studio pickup
					</p>
					<p
						class="mt-2 text-sm leading-relaxed text-muted-foreground"
					>
						Orders are available for in-studio pickup or NYC
						delivery.
					</p>
				</div>
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
