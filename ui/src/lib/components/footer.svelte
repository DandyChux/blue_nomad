<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { cn, generateSrcSet } from "$lib/utils";
	import apiClient, { ApiError } from "$lib/api";
	import { toast } from "svelte-sonner";
	import FooterGradient from "$lib/assets/footer_gradient.png";
	import { navLinks } from "$lib/components/navbar.svelte";

	const isExternal = (url: string) =>
		url.startsWith("http://") || url.startsWith("https://");

	const year = new Date().getFullYear();

	let email = $state("");
	let isSubmitting = $state(false);
	let emailError = $state("");

	let footerLinks = navLinks.concat([
		{
			label: "Gift Card",
			href: "https://app.squareup.com/gift/ML665NPQYDHTJ/order",
		},
		{
			label: "Skin Diagnostic",
			href: "/diagnosis",
		},
	]);

	function validateEmail(value: string): boolean {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(value);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = "";

		if (!validateEmail(email)) {
			emailError = "Please enter a valid email address";
			return;
		}

		isSubmitting = true;

		try {
			await apiClient.post("/subscribe", { email });
			toast.success(
				"Thank you for joining us. Look out for notes on skin health, culture, and reflections.",
			);
			window.plausible?.("Subscribe", { props: { email } });
			email = "";
		} catch (error) {
			console.error("Subscription error:", error);

			if (
				error instanceof ApiError &&
				(error.isBadRequest || error.isConflict)
			) {
				toast.error(error.userMessage);
				isSubmitting = false;
				return;
			}

			// Fallback: send email notification
			try {
				const response = await apiClient.post<{ message?: string }>(
					"/send-mail",
					{
						email,
						subject: "New Subscription (Manual Review Required)",
						text: `New subscriber (HubSpot failed): ${email}`,
					},
				);

				if (response?.message) {
					toast.warning(
						"Subscription received! We'll add you to our list shortly.",
					);
				} else {
					toast.error(
						"Failed to subscribe. Please try again or contact us directly.",
					);
				}
			} catch (fallbackErr) {
				const msg =
					fallbackErr instanceof ApiError
						? fallbackErr.userMessage
						: "Failed to subscribe. Please try again or contact us directly.";
				toast.error(msg);
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<footer class="flex flex-col px-2 space-y-6 relative">
	<div class="absolute inset-0 m-0 -z-10">
		<enhanced:img
			src={FooterGradient}
			alt="Background"
			class="object-cover xl:object-cover object-center w-full h-full"
		/>
	</div>

	<div
		class="flex flex-col lg:flex-row space-y-14 lg:space-y-0 px-8 md:px-12 lg:px-20 py-4 md:py-8 lg:py-16"
	>
		<!-- Studio Info -->
		<div class="flex-1 flex flex-col space-y-4">
			<h2 class="uppercase text-xl">Our Studio</h2>
			<address
				class="uppercase not-italic font-bold font-source-code-pro"
			>
				Blue Nomad <br />
				1123 Broadway, #1014
				<br />
				New York, NY 10010
			</address>
			<p class="uppercase font-bold font-source-code-pro">
				Mon-Sat 11AM to 8PM
			</p>
		</div>

		<!-- Navigation -->
		<div class="flex flex-col flex-1 h-full justify-between">
			<nav class="inline-flex flex-col gap-4 tracking-wide">
				{#each footerLinks as link (link.label)}
					<a
						href={link.href}
						class="uppercase text-lg md:text-xl font-bold"
						target={isExternal(link.href) ? "_blank" : undefined}
						rel="noopener noreferrer nofollow"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>

		<!-- Newsletter Subscription -->
		<div
			id="subscription-form"
			class="flex flex-col flex-1 space-y-2 mt-10 md:mt-0"
		>
			<span
				class="uppercase font-semibold text-xl lg:text-2xl tracking-wide"
			>
				Notes from our world, first.
			</span>

			<form onsubmit={handleSubmit} class="flex flex-col space-y-4">
				<div>
					<Input
						type="email"
						placeholder="E-MAIL"
						bind:value={email}
						class="placeholder:font-semibold placeholder:text-black placeholder:opacity-85 shadow-none border-t-0 border-l-0 border-r-0 rounded-none"
					/>
					{#if emailError}
						<p class="text-sm text-destructive mt-1">
							{emailError}
						</p>
					{/if}
				</div>

				<Button
					class="rounded-full uppercase mt-4 bg-transparent self-end font-bold px-12"
					variant="outline"
					size="lg"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Submitting..." : "Sign Up"}
				</Button>
			</form>
		</div>
	</div>

	<!-- Contact Section -->
	<div class="mt-auto flex flex-col w-full px-8 md:px-12 lg:px-20">
		<h2 class="uppercase text-xl">Contact Us</h2>
		<div class="flex flex-col md:flex-row gap-10">
			<span class="uppercase font-source-code-pro font-bold text-lg">
				646-566-1183 / hello@bluenomad.nyc
			</span>

			<nav class="flex gap-8">
				<a
					href="https://www.instagram.com/bluenomadworld"
					target="_blank"
					rel="noopener noreferrer nofollow"
					class="font-bold uppercase font-source-code-pro"
					onclick={() => window.plausible?.("Clicked Instagram Link")}
				>
					Instagram
				</a>
				<a
					href="https://www.tiktok.com/@bluenomadworld?_t=8sLa1tyGeW6&_r=1"
					target="_blank"
					rel="noopener noreferrer nofollow"
					class="font-bold uppercase font-source-code-pro"
				>
					TikTok
				</a>
			</nav>
		</div>
	</div>

	<!-- Logo & Copyright -->
	<div class="flex flex-col lg:flex-row w-full items-center px-8">
		<div class="relative w-full md:w-[60%]">
			<a href="/">
				<img
					src={"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.svg"}
					srcset={generateSrcSet(
						"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/logos/blue-nomad.svg",
						[400, 800, 1200, 1600],
						"webp",
						85,
					)}
					alt="Blue Nomad Logo"
					class="w-full h-auto"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, (max-width: 1280px) 50vw, 33vw"
				/>
			</a>
		</div>
		<small
			class="text-[0.5rem] lg:text-sm mt-2 lg:mt-0 uppercase font-bold place-self-center lg:place-self-end lg:px-20 grow"
		>
			&copy;{year} Blue Nomad Labs LLC. All rights reserved.
		</small>
	</div>

	<address>
		<p class="text-sm text-center text-muted-foreground">
			Developed by <a href="https://ceokoroji.dev" class="underline">
				Chukwuma Okoroji
			</a>
		</p>
	</address>
</footer>
