import { Share2 } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';
import { Button } from '~/components/ui/button'; // Assuming you're using a UI library
import { cn } from '~/lib/utils';

interface ShareLinksProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	description?: string;
}

export function ShareLinks({ title, description = '', ...props }: ShareLinksProps) {
	const { pathname } = useLocation();
	const fullUrl = typeof window !== 'undefined'
		? `${window.location.origin}${pathname}`
		: '';

	const encodedUrl = encodeURIComponent(fullUrl);
	const encodedTitle = encodeURIComponent(title);
	const encodedDescription = encodeURIComponent(description);

	const shareOnTwitter = () => {
		window.open(
			`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			'_blank'
		);
	};

	const shareOnFacebook = () => {
		window.open(
			`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			'_blank'
		);
	};

	const shareOnLinkedIn = () => {
		window.open(
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedDescription}&title=${encodedTitle}`,
			'_blank'
		);
	};

	return (
		<div
			{...props}
			className={cn("flex items-center gap-2 my-6", props.className)}
		>
			<span className="text-sm font-medium flex items-center gap-1">
				<Share2 size={16} /> Share:
			</span>
			<Button
				variant="outline"
				size="sm"
				className="rounded-full cursor-pointer"
				onClick={shareOnTwitter}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
				<span className="sr-only">Share on X(Twitter)</span>
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="rounded-full cursor-pointer"
				onClick={shareOnFacebook}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" /></svg>
				<span className="sr-only">Share on Facebook</span>
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="rounded-full cursor-pointer"
				onClick={shareOnLinkedIn}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 11v5" /><path d="M8 8v.01" /><path d="M12 16v-5" /><path d="M16 16v-3a2 2 0 1 0 -4 0" /><path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" /></svg>
				<span className="sr-only">Share on LinkedIn</span>
			</Button>
		</div>
	);
}
