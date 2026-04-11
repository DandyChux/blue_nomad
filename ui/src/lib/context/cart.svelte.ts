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
};

export class CartState {
	items = $state<CartItem[]>([]);
	isOpen = $state(false);

	// Total price derived from state
	total = $derived(this.items.reduce((sum, item) => sum + item.price, 0));

	add(product: CatalogItem, variation: CatalogVariation) {
		// Square uses cents (e.g., 1500 = $15.00)
		const priceCents =
			variation.item_variation_data?.price_money?.amount || 0;

		// Bulletproof ID generator for local network testing
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
		});

		// Automatically open the cart when an item is added
		this.isOpen = true;
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
