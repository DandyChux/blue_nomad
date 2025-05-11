import { useState, useRef, useEffect } from "react";

export function useIntersectionObserver(options = {}) {
	const [isIntersecting, setIsIntersecting] = useState(false);
	const elementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			setIsIntersecting(entry.isIntersecting);
		}, {
			threshold: 0.1,
			rootMargin: '0px 0px -10% 0px',
			...options
		});

		const element = elementRef.current;
		if (element) {
			observer.observe(element);
		}

		return () => {
			if (element) {
				observer.unobserve(element);
			}
		};
	}, [options]);

	return [elementRef, isIntersecting];
}
