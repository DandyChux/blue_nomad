<script lang="ts">
	import * as Card from "./ui/card";
	import { cn } from "$lib/utils";
	import { Button, buttonVariants } from "./ui/button";

	type TreatmentProps = {
		title: string;
		description: string;
		price: number;
		defaultImage: string;
		hoverImage: string;
		link: string;
		membersOnly?: boolean;
	};

	const treatments: TreatmentProps[] = [
		{
			title: "Facial ST 60min",
			description:
				"Facial skin therapy combining advanced technology with traditional massage techniques for optimal skin health. From acne care to well-aging, each treatment is customized to your needs.",
			price: 235,
			defaultImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Johanna/Look-1-519.webp",
			hoverImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Johanna/Look%201%20435.webp",
			link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
		},
		{
			title: "LED SkinBoost 30min",
			description:
				"Targeted express treatment for long-term skin vitality. LED light therapy paired with hydration and a power cleanse to reduce inflammation and boost collagen. Complimentary for members.",
			price: 130,
			defaultImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Mel/Look%202%20233.webp",
			hoverImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Mel/Look%202%20145.webp",
			link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
		},
		{
			title: "Facial ST Membership",
			description:
				"Experience our signature 60-minute facial skin therapy monthly, exclusive access to on-demand skin health guidance, and a complimentary LED SkinBoost between sessions.",
			price: 185,
			defaultImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Look-5-306.webp",
			hoverImage:
				"https://blue-nomad.nyc3.cdn.digitaloceanspaces.com/Ego/Ego.webp",
			membersOnly: true,
			link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
		},
	];
</script>

<div class="flex flex-col items-center w-full">
	<div
		class="grid md:grid-cols-2 lg:grid-cols-3 mx-auto gap-4 p-2 md:p-8 w-full"
	>
		{#each treatments as treatment, index (treatment.title)}
			{@const isEven = index % 2 === 0}
			<Card.Root
				class={cn(
					"relative group rounded-none p-4 border-none flex flex-col w-full",
					isEven
						? "bg-secondary text-secondary-foreground"
						: "text-primary-foreground",
				)}
			>
				<Card.Header
					class={cn("px-2 gap-0", isEven ? "order-1" : "order-2")}
				>
					<Card.Title
						class={cn(
							"font-normal text-xl lg:text-3xl tracking-wide my-2",
							isEven ? "order-1" : "order-2",
						)}
					>
						{treatment.title} - ${treatment.price}
					</Card.Title>
					<Card.Description
						class={cn(
							"text-inherit uppercase font-source-code-pro font-bold",
							isEven ? "order-2" : "order-1",
						)}
					>
						{treatment.description}{" "}
						{treatment.membersOnly
							? "Cancel anytime after the first three (3) months."
							: null}
					</Card.Description>
				</Card.Header>
				<Card.Content
					class={cn(
						"p-0 flex-1 relative w-full aspect-4/3",
						isEven ? "order-2" : "order-1",
					)}
				>
					<img
						src={treatment.defaultImage}
						alt={treatment.title}
						loading="lazy"
						class={cn(
							"object-cover size-full absolute inset-0 transition-opacity duration-300 group-hover/card:opacity-0",
							isEven && "object-[5%_35%]",
						)}
					/>
					<img
						src={treatment.hoverImage}
						alt={`${treatment.title} - alternate view`}
						loading="lazy"
						class={cn(
							"object-cover size-full absolute inset-0 transition-opacity duration-300 opacity-0 group-hover/card:opacity-100",
							isEven && "object-[5%_35%]",
						)}
					/>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<Button
		class={buttonVariants({
			variant: "outline",
			class: "uppercase mt-4 rounded-full text-center font-bold h-auto",
			size: "xl",
		})}
		variant="link"
		href="https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start"
		target="_blank"
		rel="noopener noreferrer"
	>
		Book a <br />
		Treatment
	</Button>
</div>
