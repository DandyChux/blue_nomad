'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export type MovingCardProps = {
	name: string;
	image: string;
	link: string;
	quote?: string;
}

export const InfiniteMovingCards = ({
	items,
	direction = 'left',
	speed = 'fast',
	pauseOnHover = false,
	className,
}: {
	items: MovingCardProps[];
	direction?: 'left' | 'right';
	speed?: 'fast' | 'normal' | 'slow';
	pauseOnHover?: boolean;
	className?: string;
}) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const scrollerRef = React.useRef<HTMLUListElement>(null);

	useEffect(() => {
		addAnimation();
	}, []);
	const [start, setStart] = useState(false);
	function addAnimation() {
		if (containerRef.current && scrollerRef.current) {
			const scrollerContent = Array.from(scrollerRef.current.children);

			scrollerContent.forEach((item) => {
				const duplicatedItem = item.cloneNode(true);
				if (scrollerRef.current) {
					scrollerRef.current.appendChild(duplicatedItem);
				}
			});

			getDirection();
			getSpeed();
			setStart(true);
		}
	}
	const getDirection = () => {
		if (containerRef.current) {
			if (direction === 'left') {
				containerRef.current.style.setProperty(
					'--animation-direction',
					'forwards'
				);
			} else {
				containerRef.current.style.setProperty(
					'--animation-direction',
					'reverse'
				);
			}
		}
	};
	const getSpeed = () => {
		if (containerRef.current) {
			if (speed === 'fast') {
				containerRef.current.style.setProperty('--animation-duration', '20s');
			} else if (speed === 'normal') {
				containerRef.current.style.setProperty('--animation-duration', '40s');
			} else {
				containerRef.current.style.setProperty('--animation-duration', '80s');
			}
		}
	};
	return (
		<div
			ref={containerRef}
			className={cn(
				'scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
				className
			)}
		>
			<ul
				ref={scrollerRef}
				className={cn(
					'flex w-max min-w-full shrink-0 flex-nowrap py-4',
					start && 'animate-scroll',
					pauseOnHover && 'hover:[animation-play-state:paused]'
				)}
			>
				{items.map((item, idx) => (
					<li
						className='relative md:w-[300px] w-[220px] max-w-full shrink-0 rounded-2xl md:px-8 px-3 md:py-6 py-4'
						key={item.name}
					>
						{/* <Link
							href={item.link}
							className='text-sm underline deocration-dotted underline-offset-2'
							target='_blank'
							rel='noopener noreferrer'
						>
							<span className='absolute inset-0'></span>
						</Link> */}
						<blockquote>
							<div
								aria-hidden='true'
								className='user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]'
							></div>

							<div className='relative w-full md:h-40 h-32 mb-4 overflow-hidden rounded-lg flex place-items-center aspect-[4/3]'>
								<Image
									src={item.image}
									alt={`Image for ${item.name}`}
									className='object-cover object-center mx-auto'
									width={125}
									height={100}
									sizes="(max-width: 768px) 150px, 275px"
									loading='lazy'
									placeholder='blur'
									blurDataURL='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ij48L3JlY3Q+PHJlY3Qgd2lkdGg9IjYwJSIgaGVpZ2h0PSI2MCUiIHg9IjIwJSIgeT0iMjAlIiBmaWxsPSIjZWVlZWVlIiBvcGFjaXR5PSIwLjQiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC4yOzAuNTswLjIiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9yZWN0Pjwvc3ZnPg=='
								/>
							</div>
							{/* <span className='relative z-20 text-sm leading-[1.6] font-normal'>
								{item.quote}
							</span>
							<div className='relative z-20 mt-6 flex flex-row items-center'>
								<span className='flex flex-col gap-1'>
									<span className='text-sm leading-[1.6] font-normal text-secondary-foreground/80'>
										{item.name}
									</span>
								</span>
							</div> */}
						</blockquote>
					</li>
				))}
			</ul>
		</div>
	);
};
