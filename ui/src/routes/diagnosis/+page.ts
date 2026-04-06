import type { PageLoad } from "./$types";
import { diagnosticSchema } from "$lib/schemas";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

export const load: PageLoad = async ({ url }) => {
	return { form: await superValidate(zod4(diagnosticSchema)) };
};
