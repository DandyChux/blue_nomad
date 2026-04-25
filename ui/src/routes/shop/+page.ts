import type { PageLoad } from "./$types";
import type { CatalogItem, CatalogListResponse } from "$lib/schemas";
import { apiClient, ApiError } from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
	try {
		const catalog =
			await apiClient.get<CatalogListResponse>("/shop/catalog");
		const allObjects = catalog.objects || [];

		const imageMap = new Map(
			allObjects
				.filter((obj: any) => obj.type === "IMAGE")
				.map((img: any) => [img.id, img.image_data?.url]),
		);

		// Build a category -> minimum ordinal map from items so the filter bar
		// reflects the dashboard's ordering.
		const categoryOrdinal = new Map<string, number>();
		for (const obj of allObjects) {
			if (obj.type !== "ITEM") continue;
			for (const c of obj.item_data?.categories ?? []) {
				const prev = categoryOrdinal.get(c.id);
				if (prev === undefined || c.ordinal < prev) {
					categoryOrdinal.set(c.id, c.ordinal);
				}
			}
		}

		const categories = allObjects
			.filter((obj) => obj.type === "CATEGORY")
			.filter((cat) => cat.category_data.name !== "Treatments")
			.map((cat) => ({
				id: cat.id,
				name: cat.category_data?.name || "Unknown Category",
				ordinal:
					categoryOrdinal.get(cat.id) ?? Number.POSITIVE_INFINITY,
			}))
			.sort((a, b) => a.ordinal - b.ordinal);

		const products = allObjects
			.filter((obj): obj is CatalogItem => {
				if (obj.type !== "ITEM") return false;
				if (obj.is_deleted) return false;
				if (obj.item_data.ecom_visibility !== "VISIBLE") return false;
				if (obj.item_data.product_type === "APPOINTMENTS_SERVICE")
					return false;

				return true;
			})
			.map((product) => {
				const primaryImageId = product.item_data?.image_ids?.[0];
				const primaryImageUrl = primaryImageId
					? imageMap.get(primaryImageId)
					: "https://via.placeholder.com/400x500?text=No+Image";

				return {
					...product,
					image_url: primaryImageUrl,
				};
			});

		return { products, categories };
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound) {
			error(404, { message: "Catalog not found" });
		}
		error(500, { message: "Failed to load catalog" });
	}
};
