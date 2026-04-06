<script lang="ts">
	import {
		superForm,
		type SuperValidated,
		type Infer,
	} from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as Card from "$lib/components/ui/card";
	import * as Form from "$lib/components/ui/form";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Progress } from "$lib/components/ui/progress";
	import { diagnosticSchema } from "$lib/schemas";
	import { Label } from "./ui/label";
	import apiClient from "$lib/api";
	import { toast } from "svelte-sonner";

	let {
		data,
	}: { data: { form: SuperValidated<Infer<typeof diagnosticSchema>> } } =
		$props();

	const form = superForm(data.form, {
		SPA: true,
		validators: zod4Client(diagnosticSchema),
		async onUpdate({ form }) {
			if (form.valid) {
				try {
					await apiClient.post("/diagnostic", $formData).then(() => {
						toast.success("Diagnostic submitted successfully!");
						reset();
					});
				} catch (error) {
					console.error("Submission error:", error);
					toast.error("Network error. Please check your connection.");
				}
			}
		},
	});

	const { form: formData, enhance, submitting, reset } = form;

	const checked = $formData.concerns.includes("Other");
	const disabled = !checked && $formData.concerns.length >= 2;

	// Options
	const skinTypeOptions = [
		"Oily/Acne-prone skin",
		"Normal Skin – Balanced, smooth texture, not too oily or dry",
		"Dry skin",
		"Combination skin – Typically characterized by an oily T-zone",
		"Sensitive skin (this condition can apply to all skin types)",
	];
	const productOptions = [
		"Cleanser",
		"Toner",
		"SPF",
		"Moisturizer",
		"Serum",
		"Exfoliant",
	];
	const ingredientOptions = [
		"Glycolic Acid",
		"Lactic Acid",
		"Exfoliating scrubs",
		"Other Hydroxy Acids",
		"Vitamin A derivatives (i.e., Retinol)",
	];
	const concernOptions = [
		"Breakouts/acne",
		"Blackheads/whiteheads",
		"Excessive oil/shine",
		"Rosacea",
		"Broken capillaries",
		"Redness/ruddiness",
		"Sun spot/liver spot/brown spot",
		"Uneven skin tone",
		"Sun damage",
		"Wrinkles/fine lines",
		"Dull/dry skin",
		"Flaky skin",
		"Dehydrated",
	];
</script>

<div class="py-12 px-4 md:px-8 bg-card/50 rounded-xl">
	<form method="POST" use:enhance class="max-w-3xl mx-auto space-y-6">
		<!-- Header -->
		<Card.Root class="border-t-8 border-t-slate-800 shadow-sm rounded-xl">
			<Card.Header>
				<Card.Title class="text-3xl font-medium"
					>Blue Nomad Skin Health Diagnostic</Card.Title
				>
				<Card.Description class="text-base mt-2">
					A personalized skin review designed to simplify your routine
					and support long-term skin health.
				</Card.Description>
				<p class="text-sm text-red-500 font-medium mt-4">
					* Indicates required question
				</p>
			</Card.Header>
		</Card.Root>

		<!-- Email -->
		<Card.Root class="shadow-sm rounded-xl px-2 py-4">
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-base font-normal"
							>Email Address <span class="text-red-500">*</span
							></Form.Label
						>
						<Input
							{...props}
							type="email"
							bind:value={$formData.email}
							placeholder="Your answer"
							class="border-0 border-b border-gray-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black mt-4 w-1/2"
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Root>

		<!-- First Name -->
		<Card.Root class="shadow-sm rounded-xl px-2 py-4">
			<Form.Field {form} name="firstName">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-base font-normal"
							>First Name <span class="text-red-500">*</span
							></Form.Label
						>
						<Input
							{...props}
							bind:value={$formData.firstName}
							placeholder="Your answer"
							class="border-0 border-b border-gray-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black mt-4 w-1/2"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Root>

		<!-- Skin Type (Radio) -->
		<Card.Root class="shadow-sm rounded-xl px-2 py-4">
			<Form.Field {form} name="skinType">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-base font-normal mb-6 block"
							>Which of the following best describes your skin
							most days? <span class="text-red-500">*</span
							></Form.Label
						>
						<RadioGroup.Root
							bind:value={$formData.skinType}
							class="space-y-4"
							name={props.name}
						>
							{#each skinTypeOptions as option}
								<div class="flex items-start space-x-3">
									<RadioGroup.Item
										value={option}
										id={`skin-${option}`}
										class="mt-0.5 border-white"
									/>
									<Form.Label
										for={`skin-${option}`}
										class="font-normal text-sm"
										>{option}</Form.Label
									>
								</div>
							{/each}
							<div class="flex items-center space-x-3">
								<RadioGroup.Item
									value="Other"
									id="skin-other"
									class="border-white"
								/>
								<Form.Label
									for="skin-other"
									class="font-normal text-sm"
									>Other:</Form.Label
								>
								<Input
									bind:value={$formData.skinTypeOther}
									oninput={() =>
										($formData.skinType = "Other")}
									class="border-0 border-b border-gray-300 rounded-none px-0 h-8 shadow-none focus-visible:ring-0 focus-visible:border-black max-w-[300px]"
								/>
							</div>
						</RadioGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Root>

		<!-- Products (Checkboxes) -->
		<Card.Root class="shadow-sm rounded-xl px-2 py-4">
			<Form.Fieldset {form} name="products">
				<Form.Legend class="text-base font-normal mb-6"
					>What facial skin care products are you currently using? <span
						class="text-red-500">*</span
					></Form.Legend
				>
				<div class="space-y-4">
					{#each productOptions as option}
						<Form.Control>
							{#snippet children({ props })}
								<div class="flex items-center space-x-3">
									<Checkbox
										{...props}
										checked={$formData.products.includes(
											option,
										)}
										onCheckedChange={(v) => {
											if (v)
												$formData.products = [
													...$formData.products,
													option,
												];
											else
												$formData.products =
													$formData.products.filter(
														(i) => i !== option,
													);
										}}
										class="border-white"
									/>
									<Form.Label class="font-normal text-sm"
										>{option}</Form.Label
									>
								</div>
							{/snippet}
						</Form.Control>
					{/each}
					<div class="flex items-center space-x-3">
						<Checkbox
							checked={$formData.products.includes("Other")}
							onCheckedChange={(v) => {
								if (v)
									$formData.products = [
										...$formData.products,
										"Other",
									];
								else
									$formData.products =
										$formData.products.filter(
											(i) => i !== "Other",
										);
							}}
							class="border-white"
						/>
						<Label class="font-normal text-sm">Other:</Label>
						<Input
							bind:value={$formData.productsOther}
							oninput={() => {
								if (!$formData.products.includes("Other")) {
									$formData.products = [
										...$formData.products,
										"Other",
									];
								}
							}}
							class="border-0 border-b border-gray-300 rounded-none px-0 h-8 shadow-none focus-visible:ring-0 focus-visible:border-black max-w-[300px]"
						/>
					</div>
				</div>
				<Form.FieldErrors />
			</Form.Fieldset>
		</Card.Root>

		<!-- Concerns (Checkboxes with Max 2 logic) -->
		<Card.Root class="shadow-sm rounded-xl px-2 py-4">
			<Form.Fieldset {form} name="concerns">
				<Form.Legend class="text-base font-normal mb-6"
					>What areas of concern do you have regarding your skin?
					(choose up to 2) <span class="text-red-500">*</span
					></Form.Legend
				>
				<div class="space-y-4">
					{#each concernOptions as option}
						<Form.Control>
							{#snippet children({ props })}
								{@const checked =
									$formData.concerns.includes(option)}
								{@const disabled =
									!checked && $formData.concerns.length >= 2}
								<div class="flex items-center space-x-3">
									<Checkbox
										{...props}
										{checked}
										{disabled}
										class="border-white"
										onCheckedChange={(v) => {
											if (v)
												$formData.concerns = [
													...$formData.concerns,
													option,
												];
											else
												$formData.concerns =
													$formData.concerns.filter(
														(i) => i !== option,
													);
										}}
									/>
									<Form.Label
										class="font-normal text-sm {disabled
											? 'text-gray-400'
											: ''}">{option}</Form.Label
									>
								</div>
							{/snippet}
						</Form.Control>
					{/each}

					<div class="flex items-center space-x-3">
						<Checkbox
							{checked}
							{disabled}
							class="border-white"
							onCheckedChange={(v) => {
								if (v)
									$formData.concerns = [
										...$formData.concerns,
										"Other",
									];
								else
									$formData.concerns =
										$formData.concerns.filter(
											(i) => i !== "Other",
										);
							}}
						/>
						<Label
							class="font-normal text-sm {disabled
								? 'text-gray-400'
								: ''}">Other:</Label
						>
						<Input
							bind:value={$formData.concernsOther}
							{disabled}
							oninput={() => {
								if (
									!$formData.concerns.includes("Other") &&
									$formData.concerns.length < 2
								) {
									$formData.concerns = [
										...$formData.concerns,
										"Other",
									];
								}
							}}
							class="border-0 border-b border-gray-300 rounded-none px-0 h-8 shadow-none focus-visible:ring-0 focus-visible:border-black max-w-[300px]"
						/>
					</div>
				</div>
				<Form.FieldErrors />
			</Form.Fieldset>
		</Card.Root>

		<!-- Footer Controls -->
		<div class="flex items-center justify-between pt-6 pb-12">
			<Button
				type="submit"
				disabled={$submitting}
				class="bg-[#447661] hover:bg-[#345b4b] text-white px-8 rounded"
			>
				{$submitting ? "Submitting..." : "Submit"}
			</Button>

			<div class="flex items-center space-x-4">
				<Progress
					value={100}
					class="w-32 h-2.5 bg-gray-200 [&>div]:bg-[#447661] rounded-full"
				/>
				<span class="text-sm text-gray-600 font-medium"
					>Page 1 of 1</span
				>
				<Button
					type="button"
					variant="ghost"
					onclick={() => reset()}
					class="text-[#447661] hover:text-[#345b4b] hover:bg-transparent font-medium"
				>
					Clear form
				</Button>
			</div>
		</div>
	</form>
</div>
