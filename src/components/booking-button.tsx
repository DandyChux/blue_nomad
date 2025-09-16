"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { usePlausible } from 'next-plausible';

export const BookingButton = () => {
	// const pathname = usePathname();
	const plausible = usePlausible();

	const handleClose = () => {
		const button = document.querySelector('#booking-button');
		if (button) {
			button.classList.add("!hidden")
		}
	}

	const handleClick = () => {
		plausible("Clicked Booking Button")
	}

	// if (pathname === '/nomadsland') return null

	return (
		<div className="fixed bottom-0 right-2 z-50">
			<div className="relative group">
				<button
					className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-black hover:bg-transparent hover:text-black border-2 border-black text-white items-center justify-center text-xs hidden group-hover:flex hover:cursor-pointer"
					onClick={handleClose}
					aria-label="Close booking button"
				>
					X
				</button>
				<Button onClick={handleClick} className="rounded-full bg-black text-white border-2 border-black uppercase hover:bg-transparent hover:text-black" size={'xl'} id='booking-button'>
					<Link
						href="https://book.squareup.com/appointments/augj56g525h4rw/location/LSP68REJT9SVH/services"
						target="_blank"
						rel="noopener noreferrer"
						className='no-underline'
					>
						Begin with a <br /> consultation
					</Link>
				</Button>
			</div>
		</div>
	);
};
