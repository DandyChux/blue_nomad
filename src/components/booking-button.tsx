"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

export const BookingButton = () => {
	const handleClick = () => {
		const button = document.querySelector('#booking-button');
		if (button) {
			button.classList.add('hidden');
			console.log('Booking button clicked');
		}
	}

	return (
		<div className="fixed bottom-0 right-2 z-50">
			<div className="relative group">
				<button
					className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-black hover:bg-primary text-white items-center justify-center text-xs hidden group-hover:flex"
					onClick={handleClick}
					aria-label="Close booking button"
				>
					X
				</button>
				<Button className="rounded-full bg-black uppercase text-lg hover:bg-black/85" size={'xl'} id='booking-button'>
					<Link
						href="https://app.squareup.com/appointments/book/augj56g525h4rw/LSP68REJT9SVH/start"
						target="_blank"
						rel="noopener noreferrer"
						className='no-underline'
					>
						Begin with a consultation
					</Link>
				</Button>
			</div>
		</div>
	);
};
