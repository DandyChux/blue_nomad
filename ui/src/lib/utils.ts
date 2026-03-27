import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function roundTo(num: number, decimals: number): number {
	const multiplier = Math.pow(10, decimals);
	return Math.round(num * multiplier) / multiplier;
}

// export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
// 	let timeout: ReturnType<typeof setTimeout>;
// 	return ((...args: Parameters<T>) => {
// 		clearTimeout(timeout);
// 		timeout = setTimeout(() => func(...args), wait);
// 	}) as T;
// }
export function debounce(callback: Function, wait: number = 300) {
	let timeout: ReturnType<typeof setTimeout>;

	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), wait);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
