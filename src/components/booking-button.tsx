"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

export const BookingButton = () => {
	const pathname = usePathname();
	const handleClick = () => {
		const button = document.querySelector('#booking-button');
		if (button) {
			button.classList.add('hidden');
			console.log('Booking button clicked');
		}
	}

	if (pathname === '/blog') return null

	return (
		<div className="fixed bottom-0 right-2 z-50">
			<div className="relative group">
				<button
					className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-black hover:bg-primary text-white items-center justify-center text-xs hidden group-hover:flex"
					onClick={handleClick}
					aria-label="Close booking button"
				>
					X
				</button>
				<Button className="rounded-full bg-black text-white uppercase text-base hover:bg-black/85" size={'xl'} id='booking-button'>
					<Link
						href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3ztBc4G6m-dPzcmROs_XNBxtvO8gT4zfTcisQo6nv0_6bJnPXlEsbk9ftmKKzK0TlBnBnNu4GE"
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
