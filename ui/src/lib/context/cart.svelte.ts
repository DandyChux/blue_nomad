import type { CatalogItem, CatalogVariation } from "$lib/schemas";
import { getContext, setContext } from "svelte";

type CartItem = {
	cartItemId: string;
	id: string;
	productId: string;
	name: string;
	variationName: string;
	price: number;
	quantity: number;
	maxQuantity: number | null;
	imageUrl: string;
};

export class CartState {
	items = $state<CartItem[]>([]);
	isOpen = $state(false);

	// Total price across all lines (price * quantity)
	total = $derived(
		this.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
	);

	/**
	 * Adds (or increments) a variation in the cart.
	 *
	 * - If the variation is already in the cart, bumps the quantity by one.
	 * - Caps the quantity at `maxQuantity` when stock info is available.
	 *
	 * @param maxQuantity - Optional available stock count for the variation.
	 *                      Pass `null` when the variation is not inventory-tracked.
	 * @returns true if the item was added/incremented, false if it was already
	 *          at (or above) its stock cap.
	 */
	add(
		product: CatalogItem,
		variation: CatalogVariation,
		maxQuantity: number | null = null,
	): boolean {
		const priceCents =
			variation.item_variation_data?.price_money?.amount || 0;

		// Merge duplicates: find an existing line for this variation
		const existing = this.items.find((i) => i.id === variation.id);

		if (existing) {
			if (maxQuantity !== null) existing.maxQuantity = maxQuantity;
			if (
				existing.maxQuantity !== null &&
				existing.quantity >= existing.maxQuantity
			) {
				return false;
			}
			existing.quantity += 1;
			this.isOpen = true;
			return true;
		}

		if (maxQuantity !== null && maxQuantity <= 0) return false;

		const safeId =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: Math.random().toString(36).substring(2, 15);

		this.items.push({
			cartItemId: safeId,
			id: variation.id,
			productId: product.id,
			name: product.item_data.name,
			variationName: variation.item_variation_data.name,
			price: priceCents / 100,
			quantity: 1,
			maxQuantity,
			imageUrl: product.image_url || "",
		});

		this.isOpen = true;
		return true;
	}

	setQuantity(cartItemId: string, quantity: number) {
		const item = this.items.find((i) => i.cartItemId === cartItemId);
		if (!item) return;
		let next = Math.max(1, Math.floor(quantity));
		if (item.maxQuantity !== null) next = Math.min(next, item.maxQuantity);
		item.quantity = next;
	}

	increment(cartItemId: string): boolean {
		const item = this.items.find((i) => i.cartItemId === cartItemId);
		if (!item) return false;
		if (item.maxQuantity !== null && item.quantity >= item.maxQuantity) {
			return false;
		}
		item.quantity += 1;
		return true;
	}

	decrement(cartItemId: string) {
		const item = this.items.find((i) => i.cartItemId === cartItemId);
		if (!item) return;
		if (item.quantity <= 1) {
			this.remove(cartItemId);
			return;
		}
		item.quantity -= 1;
	}

	remove(cartItemId: string) {
		this.items = this.items.filter(
			(item) => item.cartItemId !== cartItemId,
		);
	}

	clear() {
		this.items = [];
	}

	toggle() {
		this.isOpen = !this.isOpen;
	}

	close() {
		this.isOpen = false;
	}
}

const CART_KEY = Symbol("cart");

export function initCart() {
	return setContext(CART_KEY, new CartState());
}

export function getCart() {
	return getContext<CartState>(CART_KEY);
}
