import type { PageLoad } from "./$types";
import type { CatalogItem, CatalogListResponse } from "$lib/schemas";
import { apiClient, ApiError } from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
	try {
		const catalog =
			await apiClient.get<CatalogListResponse>("/shop/catalog");
		const allObjects = catalog.objects || [];

		// Build image lookup
		const imageMap = new Map(
			allObjects
				.filter((obj: any) => obj.type === "IMAGE")
				.map((img: any) => [img.id, img.image_data?.url]),
		);

		// Find the specific product by ID
		const product = allObjects.find(
			(obj): obj is CatalogItem =>
				obj.type === "ITEM" &&
				obj.id === params.id &&
				obj.is_deleted !== true &&
				obj.item_data?.ecom_visibility === "VISIBLE" &&
				obj.item_data?.product_type !== "APPOINTMENTS_SERVICE",
		);

		if (!product) {
			error(404, { message: "Product not found" });
		}

		// Resolve ALL image URLs for this product (not just the first one)
		const imageUrls: string[] = (product.item_data?.image_ids || [])
			.map((id) => imageMap.get(id))
			.filter((url): url is string => !!url);

		// Resolve the category name
		const categoryId = product.item_data?.categories?.[0]?.id;
		const categoryObj = categoryId
			? allObjects.find(
					(obj) => obj.type === "CATEGORY" && obj.id === categoryId,
				)
			: undefined;
		const categoryName =
			categoryObj?.type === "CATEGORY"
				? categoryObj.category_data?.name
				: undefined;

		return {
			product: {
				...product,
				image_url:
					imageUrls[0] ||
					"https://via.placeholder.com/800x1000?text=No+Image",
			},
			imageUrls,
			categoryName,
		};
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound) {
			error(404, { message: "Product not found" });
		}
		error(500, { message: "Failed to load product" });
	}
};
