import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col lg:justify-center text-pale-grey relative'>
			<div className='mb-8'>
				<Skeleton className='h-8 rounded w-1/2 mb-4' />
				<Skeleton className='h-4 rounded w-1/3 mb-8' />
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				<div className='flex flex-col'>
					<Skeleton className='h-48 rounded mb-3' />
					<Skeleton className='h-5 rounded w-3/4 mb-2' />
					<Skeleton className='h-4 rounded w-1/2' />
				</div>
				<div className='flex flex-col'>
					<Skeleton className='h-48 rounded mb-3' />
					<Skeleton className='h-5 rounded w-3/4 mb-2' />
					<Skeleton className='h-4 rounded w-1/2' />
				</div>
				<div className='flex flex-col'>
					<Skeleton className='h-48 rounded mb-3' />
					<Skeleton className='h-5 rounded w-3/4 mb-2' />
					<Skeleton className='h-4 rounded w-1/2' />
				</div>
			</div>
		</section>
	);
}
