import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function roundTo(num: number, decimals: number): number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(num * multiplier) / multiplier;
}