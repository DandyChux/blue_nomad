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

		const categories = allObjects
			.filter((obj) => obj.type === "CATEGORY")
			.filter((cat) => cat.category_data.name !== "Treatments")
			.map((cat) => ({
				id: cat.id,
				name: cat.category_data?.name || "Unknown Category",
			}));

		const products = allObjects
			.filter((obj): obj is CatalogItem => {
				if (obj.type !== "ITEM") return false;

				if (obj.is_deleted) return false;

				if (obj.item_data.ecom_visibility !== "VISIBLE") return false;

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
