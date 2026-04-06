import type { PageLoad } from "./$types";
import { type CatalogItem, type CatalogListResponse } from "$lib/schemas";
import { apiClient, ApiError } from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ url }) => {
	try {
		const res =
			await apiClient.get<CatalogListResponse>("/booking/services");

		const allObjects = res.objects || [];

		// 1. Create a map of image IDs to their URLs
		const imageMap = new Map(
			allObjects
				.filter((obj: any) => obj.type === "IMAGE")
				.map((img: any) => [img.id, img.image_data?.url]),
		);

		// 2. Filter the services and map over them to attach the image URL
		const services = allObjects
			.filter(
				(obj): obj is CatalogItem =>
					obj.type === "ITEM" &&
					obj.item_data?.product_type === "APPOINTMENTS_SERVICE",
			)
			.map((service) => {
				const primaryImageId = service.item_data?.image_ids?.[0];

				const primaryImageUrl = primaryImageId
					? imageMap.get(primaryImageId)
					: "https://via.placeholder.com/800x600?text=No+Image";

				return {
					...service,
					image_url: primaryImageUrl,
				};
			});

		return { services };
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound) {
			error(404, { message: "Catalog not found" });
		}
		error(500, { message: "Failed to load catalog" });
	}
};
