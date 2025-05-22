import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';

const NomadsLandNotFound: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
			<h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
			<p className="text-xl mb-6">Oops! It seems you've wandered off the Nomad's path.</p>
			<p className="mb-8">The blog post or resource you're looking for doesn't exist in our Nomad's Land.</p>

			{/* <div className="w-full max-w-md mb-8">
				<img
					src="/images/lost-nomad.svg"
					alt="Lost Nomad"
					className="w-full h-auto"
					onError={(e) => e.currentTarget.style.display = 'none'}
				/>
			</div> */}

			<div className="space-y-4">
				<Link
					href="/nomadsland"
					className={buttonVariants({ variant: "default", className: "rounded-full bg-black text-white border-2 border-black uppercase hover:bg-transparent hover:text-black" })}
				>
					Return to Nomad's Land Blog
				</Link>

				<div>
					<Link
						href="/"
						className="underline"
					>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NomadsLandNotFound;
