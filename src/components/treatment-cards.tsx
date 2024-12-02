"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import TreatmentShot2 from "~/assets/treatment-section/Artboard 2-1.png";
import TreatmentShot3 from "~/assets/treatment-section/Artboard 2-2.png";
import TreatmentShot1 from "~/assets/treatment-section/Artboard 2.png";
import HoverShot1 from "~/assets/treatment-section/Artboard 3.png";
import HoverShot2 from "~/assets/treatment-section/Artboard 4.png";
import HoverShot3 from "~/assets/treatment-section/Artboard 5.png";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

type TreatmentProps = {
	title: string;
	description: string;
	price: number;
	defaultImage: string;
	hoverImage: string;
	link: string;
	membersOnly?: boolean;
};

type TreatmentCardProps = TreatmentProps & {
	index: number;
	className?: string;
};

const treatments: TreatmentProps[] = [
	{
		title: "Facial ST 60min",
		description:
			"Face-to-neck skin therapy blending cutting-edge modalities with time-honored massage techniques to guide your skin to optimal health. From acne care to well-aging, every treatment is tailored to your unique needs.",
		price: 235,
		defaultImage: TreatmentShot3.src,
		hoverImage: HoverShot3.src,
		link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
	},
	{
		title: "Refresh Peel 45min",
		description:
			"A customized blend of acids and vitamins that transforms texture and tone while protecting your skin's barrier and revealing its natural luminosity. Most beneficial during colder months.",
		price: 225,
		defaultImage: HoverShot1.src,
		hoverImage: TreatmentShot1.src,
		link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
		// membersOnly: true,
	},
	{
		title: "Facial ST 60 Membership",
		description:
			"Experience our Facial ST 60 monthly, with exclusive access to on-demand skin health guidance and early previews of new brands and treatments.",
		price: 185,
		defaultImage: TreatmentShot2.src,
		hoverImage: HoverShot2.src,
		membersOnly: true,
		link: "https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start",
	},
];

export default function TreatmentCards() {
	return (
		<div className="flex flex-col items-center">
			<div className="grid md:grid-cols-2 lg:grid-cols-3 mx-auto gap-4 p-2 md:p-8">
				{treatments.map((treatment, index) => (
					<TreatmentCard
						key={index}
						title={treatment.title}
						description={treatment.description}
						price={treatment.price}
						defaultImage={treatment.defaultImage}
						hoverImage={treatment.hoverImage}
						membersOnly={treatment.membersOnly}
						link={treatment.link}
						index={index}
					/>
				))}
			</div>

			<Button className="uppercase mt-6" size={"xl"} variant={"outline"}>
				<Link
					href={
						"https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start"
					}
				>
					Book a <br />
					Treatment
				</Link>
			</Button>
		</div>
	);
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
	description,
	defaultImage,
	hoverImage,
	price,
	title,
	membersOnly,
	className,
	index,
	link,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Card
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"relative group rounded-none p-4 border-none flex flex-col",
				{
					"bg-secondary text-secondary-foreground": index % 2 === 0,
					"text-white": index % 2 !== 0,
				},
				className,
			)}
		>
			<Link
				// className='text-sm underline decoration-dotted underline-offset-2'
				href={link}
				target="_blank"
				rel="noreferrer"
			>
				<span className="absolute inset-0"></span>
			</Link>
			<CardHeader
				className={cn("px-2 gap-2", {
					"order-2": index % 2 !== 0,
					"order-1": index % 2 === 0,
				})}
			>
				<CardTitle
					className={cn("font-normal text-xl lg:text-3xl tracking-wide", {
						"order-1": index % 2 === 0,
						"order-2": index % 2 !== 0,
					})}
				>
					{title} - ${price}
				</CardTitle>
				<CardDescription
					className={cn(
						"text-inherit uppercase font-source-code-pro font-semibold",
						{
							"order-1": index % 2 !== 0,
							"order-2": index % 2 === 0,
						},
					)}
				>
					{description}{" "}
					{membersOnly
						? "Cancel anytime after the first three (3) months."
						: ""}
				</CardDescription>
			</CardHeader>
			<CardContent
				className={cn("p-0 flex-1", {
					"order-1": index % 2 !== 0,
					"order-2": index % 2 === 0,
				})}
			>
				<Image
					src={isHovered ? hoverImage : defaultImage}
					alt={title}
					width={550}
					height={450}
					sizes="100vw"
					className="w-full h-full object-cover"
					placeholder="empty"
				/>
			</CardContent>
		</Card>
	);
};
