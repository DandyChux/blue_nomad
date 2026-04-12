<script lang="ts">
	import {
		superForm,
		type SuperValidated,
		type Infer,
	} from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import * as Form from "$lib/components/ui/form";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { diagnosticSchema } from "$lib/schemas";
	import { Label } from "./ui/label";
	import apiClient from "$lib/api";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";

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
					await apiClient.post("/diagnostic", $formData);
					await goto(
						`/diagnosis/success?name=${encodeURIComponent($formData.firstName)}`,
					);
				} catch (error) {
					console.error("Submission error:", error);
					toast.error("Network error. Please check your connection.");
				}
			}
		},
	});

	const { form: formData, enhance, submitting, reset } = form;

	// ── Multi-step ────────────────────────────────────────────────────
	let currentStep = $state(0);
	const totalSteps = 4;

	const steps = [
		{ title: "Skin Type" },
		{ title: "Current Care" },
		{ title: "Concerns" },
		{ title: "Info" },
	];

	const progressPercent = $derived(((currentStep + 1) / totalSteps) * 100);

	// Derived helpers for concerns "Other" row
	const concernOtherChecked = $derived($formData.concerns.includes("Other"));
	const concernOtherDisabled = $derived(
		!concernOtherChecked && $formData.concerns.length >= 2,
	);

	// ── Step validation ───────────────────────────────────────────────
	let stepErrors: string[] = $state([]);

	function validateStep(step: number): boolean {
		stepErrors = [];
		switch (step) {
			case 0:
				if (!$formData.skinType)
					stepErrors.push("Please select your skin type.");
				break;
			case 1:
				if ($formData.products.length === 0)
					stepErrors.push("Please select at least one product.");
				if ($formData.ingredients.length === 0)
					stepErrors.push("Please select at least one ingredient.");
				break;
			case 2:
				if ($formData.concerns.length === 0)
					stepErrors.push("Please select at least one concern.");
				break;
			case 3:
				if (!$formData.email)
					stepErrors.push("Email address is required.");
				else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($formData.email))
					stepErrors.push("Please enter a valid email address.");
				if (!$formData.firstName?.trim())
					stepErrors.push("First name is required.");
				break;
		}
		return stepErrors.length === 0;
	}

	function nextStep() {
		if (validateStep(currentStep) && currentStep < totalSteps - 1) {
			currentStep++;
			stepErrors = [];
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
			stepErrors = [];
		}
	}

	function goToStep(target: number) {
		if (target < currentStep) {
			currentStep = target;
			stepErrors = [];
		}
	}

	function clearForm() {
		reset();
		currentStep = 0;
		stepErrors = [];
	}

	// ── Options ───────────────────────────────────────────────────────
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

<div class="py-8 px-4 md:px-8">
	<form method="POST" use:enhance class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="pb-8 mb-10 border-b border-foreground/20">
			<h2 class="font-medium uppercase tracking-tight mb-2">
				Express Skin Diagnostic
			</h2>
			<p
				class="font-spectral text-sm uppercase tracking-widest leading-relaxed"
			>
				A personalized skin review designed to simplify your skin care
				and support long-term skin health.
			</p>
		</div>

		<!-- Step indicator -->
		<div class="mb-10">
			<div class="flex items-start justify-between gap-2 mb-6">
				{#each steps as step, i}
					<button
						type="button"
						onclick={() => goToStep(i)}
						disabled={i > currentStep}
						class="flex flex-col items-center gap-1.5 flex-1 group transition-colors"
					>
						<span
							class="font-spectral text-lg tabular-nums transition-all duration-300
								{i < currentStep
								? 'text-foreground'
								: i === currentStep
									? 'text-foreground font-bold'
									: 'text-muted-foreground/40'}"
						>
							{String(i + 1).padStart(2, "0")}
						</span>
						<span
							class="font-spectral text-sm uppercase tracking-[0.15em] hidden sm:block transition-colors duration-300
								{i === currentStep
								? 'text-foreground font-bold'
								: i < currentStep
									? 'text-foreground'
									: 'text-muted-foreground/40'}"
						>
							{step.title}
						</span>
					</button>

					{#if i < steps.length - 1}
						<div
							class="flex-1 h-px mt-3 transition-colors duration-500
								{i < currentStep ? 'bg-foreground' : 'bg-foreground/10'}"
						></div>
					{/if}
				{/each}
			</div>

			<!-- Progress line -->
			<div class="w-full h-px bg-foreground/10 relative overflow-hidden">
				<div
					class="absolute inset-y-0 left-0 bg-foreground transition-all duration-700 ease-out"
					style="width: {progressPercent}%"
				></div>
			</div>

			<p
				class="font-spectral text-sm uppercase tracking-[0.2em] text-center mt-4"
			>
				Step {currentStep + 1} of {totalSteps}
			</p>
		</div>

		<!-- Step errors -->
		{#if stepErrors.length > 0}
			<div class="border border-destructive/30 p-5 mb-8">
				{#each stepErrors as error}
					<p
						class="text-sm font-spectral uppercase tracking-wide text-destructive"
					>
						{error}
					</p>
				{/each}
			</div>
		{/if}

		<!-- Step 1 — Skin Type -->
		{#if currentStep === 0}
			<div>
				<Form.Field {form} name="skinType">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								class="text-sm font-spectral uppercase tracking-[0.2em] font-normal mb-8 block"
							>
								Which best describes your skin most days?
								<span class="text-destructive">*</span>
							</Form.Label>
							<RadioGroup.Root
								bind:value={$formData.skinType}
								class="space-y-5"
								name={props.name}
							>
								{#each skinTypeOptions as option}
									<div class="flex items-start space-x-3">
										<RadioGroup.Item
											value={option}
											id={`skin-${option}`}
											class="mt-0.5 border-foreground/30 data-[state=checked]:border-foreground data-[state=checked]:text-foreground"
										/>
										<Form.Label
											for={`skin-${option}`}
											class="font-spectral font-normal text-sm leading-relaxed cursor-pointer"
											>{option}</Form.Label
										>
									</div>
								{/each}
								<div class="flex items-center space-x-3">
									<RadioGroup.Item
										value="Other"
										id="skin-other"
										class="border-foreground/30 data-[state=checked]:border-foreground data-[state=checked]:text-foreground"
									/>
									<Form.Label
										for="skin-other"
										class="font-spectral font-normal text-sm"
										>Other:</Form.Label
									>
									<Input
										bind:value={$formData.skinTypeOther}
										oninput={() =>
											($formData.skinType = "Other")}
										class="border-0 border-b border-foreground/20 rounded-none px-0 h-7 shadow-none focus-visible:ring-0 focus-visible:border-foreground max-w-[250px] font-spectral text-sm"
									/>
								</div>
							</RadioGroup.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Field>
			</div>
		{/if}

		<!-- Step 2 — Current Care -->
		{#if currentStep === 1}
			<div class="space-y-12">
				<!-- Products -->
				<Form.Fieldset {form} name="products">
					<Form.Legend
						class="text-sm font-spectral uppercase tracking-[0.2em] font-normal mb-6"
					>
						What facial skin care products are you currently using?
						<span class="text-destructive">*</span>
					</Form.Legend>
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
											class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background"
										/>
										<Form.Label
											class="font-spectral font-normal text-sm cursor-pointer"
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
								class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background"
							/>
							<Label class="font-spectral font-normal text-sm"
								>Other:</Label
							>
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
								class="border-0 border-b border-foreground/20 rounded-none px-0 h-7 shadow-none focus-visible:ring-0 focus-visible:border-foreground max-w-[250px] font-spectral text-sm"
							/>
						</div>
					</div>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Fieldset>

				<div class="h-px bg-foreground/10"></div>

				<!-- Ingredients -->
				<Form.Fieldset {form} name="ingredients">
					<Form.Legend
						class="text-sm font-spectral uppercase tracking-[0.2em] font-normal mb-6"
					>
						Are you currently using any of the following
						ingredients?
						<span class="text-destructive">*</span>
					</Form.Legend>
					<div class="space-y-4">
						{#each ingredientOptions as option}
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center space-x-3">
										<Checkbox
											{...props}
											checked={$formData.ingredients.includes(
												option,
											)}
											onCheckedChange={(v) => {
												if (v)
													$formData.ingredients = [
														...$formData.ingredients,
														option,
													];
												else
													$formData.ingredients =
														$formData.ingredients.filter(
															(i) => i !== option,
														);
											}}
											class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background"
										/>
										<Form.Label
											class="font-spectral font-normal text-sm cursor-pointer"
											>{option}</Form.Label
										>
									</div>
								{/snippet}
							</Form.Control>
						{/each}
						<div class="flex items-center space-x-3">
							<Checkbox
								checked={$formData.ingredients.includes(
									"Other",
								)}
								onCheckedChange={(v) => {
									if (v)
										$formData.ingredients = [
											...$formData.ingredients,
											"Other",
										];
									else
										$formData.ingredients =
											$formData.ingredients.filter(
												(i) => i !== "Other",
											);
								}}
								class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background"
							/>
							<Label class="font-spectral font-normal text-sm"
								>Other:</Label
							>
							<Input
								bind:value={$formData.ingredientsOther}
								oninput={() => {
									if (
										!$formData.ingredients.includes("Other")
									) {
										$formData.ingredients = [
											...$formData.ingredients,
											"Other",
										];
									}
								}}
								class="border-0 border-b border-foreground/20 rounded-none px-0 h-7 shadow-none focus-visible:ring-0 focus-visible:border-foreground max-w-[250px] font-spectral text-sm"
							/>
						</div>
					</div>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Fieldset>

				<!-- Specific Products -->
				<Form.Field {form} name="specificProducts">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								class="text-sm font-spectral uppercase tracking-[0.2em] font-normal"
							>
								List specific products and brands you're using
							</Form.Label>
							<Input
								{...props}
								bind:value={$formData.specificProducts}
								placeholder="e.g. Dieux Air Angel Moisturizer, Dermalogica Microfoliant..."
								class="border-0 border-b border-foreground/20 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-foreground mt-3 font-spectral text-sm w-full"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Field>
			</div>
		{/if}

		<!-- Step 3 — Concerns -->
		{#if currentStep === 2}
			<div>
				<Form.Fieldset {form} name="concerns">
					<Form.Legend
						class="text-sm font-spectral uppercase tracking-[0.2em] font-normal mb-6"
					>
						What are your skin concerns? Choose up to 2.
						<span class="text-destructive">*</span>
					</Form.Legend>
					<div class="space-y-4">
						{#each concernOptions as option}
							<Form.Control>
								{#snippet children({ props })}
									{@const checked =
										$formData.concerns.includes(option)}
									{@const disabled =
										!checked &&
										$formData.concerns.length >= 2}
									<div class="flex items-center space-x-3">
										<Checkbox
											{...props}
											{checked}
											{disabled}
											class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background disabled:opacity-30"
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
											class="font-spectral font-normal text-sm cursor-pointer
												{disabled ? 'text-muted-foreground/40' : ''}">{option}</Form.Label
										>
									</div>
								{/snippet}
							</Form.Control>
						{/each}

						<div class="flex items-center space-x-3">
							<Checkbox
								checked={concernOtherChecked}
								disabled={concernOtherDisabled}
								class="border-foreground/30 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background disabled:opacity-30"
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
								class="font-spectral font-normal text-sm
									{concernOtherDisabled ? 'text-muted-foreground/40' : ''}">Other:</Label
							>
							<Input
								bind:value={$formData.concernsOther}
								disabled={concernOtherDisabled}
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
								class="border-0 border-b border-foreground/20 rounded-none px-0 h-7 shadow-none focus-visible:ring-0 focus-visible:border-foreground max-w-[250px] font-spectral text-sm"
							/>
						</div>
					</div>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Fieldset>
			</div>
		{/if}

		<!-- Step 4 — Your Info -->
		{#if currentStep === 3}
			<div class="space-y-10">
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								class="text-sm font-spectral uppercase tracking-[0.2em] font-normal"
							>
								Email Address <span class="text-destructive"
									>*</span
								>
							</Form.Label>
							<Input
								{...props}
								type="email"
								bind:value={$formData.email}
								placeholder="your@email.com"
								class="border-0 border-b border-foreground/20 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-foreground mt-3 font-spectral text-sm md:w-3/4"
								required
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Field>

				<Form.Field {form} name="firstName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								class="text-sm font-spectral uppercase tracking-[0.2em] font-normal"
							>
								First Name <span class="text-destructive"
									>*</span
								>
							</Form.Label>
							<Input
								{...props}
								bind:value={$formData.firstName}
								placeholder="Your first name"
								class="border-0 border-b border-foreground/20 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-foreground mt-3 font-spectral text-sm md:w-3/4"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors class="font-spectral text-sm mt-2" />
				</Form.Field>
			</div>
		{/if}

		<!-- Navigation -->
		<div
			class="flex items-center justify-between border-t border-foreground/20 pt-8 mt-12"
		>
			<div class="flex gap-3">
				{#if currentStep > 0}
					<Button
						type="button"
						variant="outline"
						onclick={prevStep}
						class="uppercase rounded-full h-12 px-8 border-foreground text-foreground hover:bg-foreground hover:text-background font-spectral text-sm tracking-[0.15em] transition-all"
					>
						← Back
					</Button>
				{/if}

				{#if currentStep < totalSteps - 1}
					<Button
						type="button"
						onclick={nextStep}
						class="uppercase rounded-full h-12 px-10 bg-foreground text-primary-foreground hover:bg-foreground/90 font-spectral text-sm tracking-[0.15em]"
					>
						Next →
					</Button>
				{:else}
					<Button
						type="submit"
						disabled={$submitting}
						class="uppercase rounded-full h-12 px-10 bg-foreground text-primary-foreground hover:bg-foreground/90 font-spectral text-sm tracking-[0.15em]"
					>
						{$submitting ? "Submitting..." : "Submit"}
					</Button>
				{/if}
			</div>

			<button
				type="button"
				onclick={clearForm}
				class="text-sm font-spectral uppercase tracking-[0.15em] hover:text-foreground transition-colors cursor-pointer"
			>
				Clear form
			</button>
		</div>
	</form>
</div>
