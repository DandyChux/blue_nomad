import type { PageLoad } from "./$types";
import type { CatalogItem, CatalogListResponse } from "$lib/schemas";
import { apiClient, ApiError } from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
	try {
		const res =
			await apiClient.get<CatalogListResponse>("/booking/services");
		const allObjects = res.objects || [];

		// Build image lookup
		const imageMap = new Map(
			allObjects
				.filter((obj: any) => obj.type === "IMAGE")
				.map((img: any) => [img.id, img.image_data?.url]),
		);

		// Find the specific service by ID
		const service = allObjects.find(
			(obj): obj is CatalogItem =>
				obj.type === "ITEM" &&
				obj.item_data?.product_type === "APPOINTMENTS_SERVICE" &&
				obj.id === params.id,
		);

		if (!service) {
			error(404, { message: "Treatment not found" });
		}

		// Resolve ALL image URLs
		const imageUrls: string[] = (service.item_data?.image_ids || [])
			.map((id) => imageMap.get(id))
			.filter((url): url is string => !!url);

		return {
			service: {
				...service,
				image_url:
					imageUrls[0] ||
					"https://via.placeholder.com/800x1000?text=No+Image",
			},
			imageUrls,
		};
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound) {
			error(404, { message: "Treatment not found" });
		}
		error(500, { message: "Failed to load treatment" });
	}
};
