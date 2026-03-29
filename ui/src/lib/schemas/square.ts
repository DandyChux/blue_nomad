import { z } from "zod";

// Square represents money as an integer in the smallest denomination (e.g., cents)
export const SquareMoneySchema = z.object({
	amount: z.number().int(),
	currency: z.string(),
});

// The variation of an item (e.g., "Small", "Large", or just "Regular" if no variants)
// This is where the price actually lives in Square!
export const CatalogItemVariationDataSchema = z.object({
	item_id: z.string(),
	name: z.string(),
	sku: z.string().optional(),
	price_money: SquareMoneySchema.optional(),
	// pricing_type can be FIXED_PRICING or VARIABLE_PRICING
	pricing_type: z.string().optional(),
});

export const CatalogItemVariationSchema = z.object({
	type: z.literal("ITEM_VARIATION"),
	id: z.string(),
	updated_at: z.string(),
	item_variation_data: CatalogItemVariationDataSchema,
});

// The core item data
export const CatalogItemDataSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	// Variations contain the actual purchasable entities and their prices
	variations: z.array(CatalogItemVariationSchema).optional(),
	// Add image_ids if you plan on fetching images later
	image_ids: z.array(z.string()).optional(),
	categories: z.array(
		z.object({
			id: z.string(),
			ordinal: z.number(),
		}),
	),
	ecom_available: z.boolean(),
	ecom_visibility: z.enum(["VISIBLE", "UNINDEXED", "UNAVAILABLE"]),
});

export const CatalogCategoryDataSchema = z.object({
	name: z.string(),
});

export const CatalogImageDataSchema = z.object({
	url: z.string(),
});

// The top-level object returned in the `objects` array
const BaseCatalogObjectSchema = z.object({
	id: z.string(),
	updated_at: z.string(),
	version: z.number(),
	is_deleted: z.boolean().optional(),
	present_at_all_locations: z.boolean().optional(),
});

const ItemObjectSchema = BaseCatalogObjectSchema.extend({
	type: z.literal("ITEM"),
	item_data: CatalogItemDataSchema,
	image_url: z.string().optional(),
});

const CategoryObjectSchema = BaseCatalogObjectSchema.extend({
	type: z.literal("CATEGORY"),
	category_data: CatalogCategoryDataSchema,
});

const ImageObjectSchema = BaseCatalogObjectSchema.extend({
	type: z.literal("IMAGE"),
	image_data: CatalogImageDataSchema,
});

const VariationObjectSchema = BaseCatalogObjectSchema.extend({
	type: z.literal("ITEM_VARIATION"),
	// If you need strict validation for variations, add it here.
	// Otherwise, you can leave it loose for now.
	item_variation_data: CatalogItemVariationDataSchema,
});

export const CatalogObjectSchema = z.discriminatedUnion("type", [
	ItemObjectSchema,
	CategoryObjectSchema,
	VariationObjectSchema,
	ImageObjectSchema,
]);

// The final schema for your `GET /api/shop/catalog` response
export const CatalogListResponseSchema = z.object({
	// cursor is returned if there are more pages of items
	cursor: z.string().optional(),
	// objects might be undefined if the catalog is completely empty
	objects: z.array(CatalogObjectSchema).default([]),
});

// The schema for your `POST /api/shop/payment` response
export const PaymentResponseSchema = z.object({
	payment: z.object({
		id: z.string(),
		created_at: z.string(),
		updated_at: z.string(),
		// Status is critical for determining if the UI should show a success state
		status: z.enum([
			"COMPLETED",
			"FAILED",
			"APPROVED",
			"CANCELED",
			"PENDING",
		]),
		amount_money: SquareMoneySchema,
		source_type: z.string().optional(),
		// Square generates a hosted receipt for you automatically
		receipt_url: z.url().optional(),
		receipt_number: z.string().optional(),
		order_id: z.string().optional(),
	}),
});

// Export inferred TypeScript types for your Svelte components
export type CatalogListResponse = z.infer<typeof CatalogListResponseSchema>;
export type CatalogItem = z.infer<typeof CatalogObjectSchema>;
export type CatalogVariation = z.infer<typeof CatalogItemVariationSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
