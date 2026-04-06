import { z } from "zod";

export const diagnosticSchema = z.object({
	email: z.email("Please enter a valid email address."),
	firstName: z.string().min(1, "First name is required."),

	skinType: z.string().min(1, "Please select your skin type."),
	skinTypeOther: z.string().optional(),

	products: z.array(z.string()).min(1, "Please select at least one product."),
	productsOther: z.string().optional(),

	ingredients: z
		.array(z.string())
		.min(1, "Please select at least one ingredient."),
	ingredientsOther: z.string().optional(),

	concerns: z
		.array(z.string())
		.min(1, "Please select at least one concern.")
		.max(2, "You can only select up to 2 concerns."),
	concernsOther: z.string().optional(),
});

export type DiagnosticForm = z.infer<typeof diagnosticSchema>;
