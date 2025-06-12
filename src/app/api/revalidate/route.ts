import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// This secret should be a random string that only you and Sanity know
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
	try {
		// Get the webhook signature from headers
		const signature = request.headers.get('sanity-webhook-signature');

		// Parse the request body
		const body = await request.json();

		// Verify the webhook secret
		// Sanity sends the secret as a query parameter
		const { searchParams } = new URL(request.url);
		const secret = searchParams.get('secret');

		if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
			return NextResponse.json(
				{ message: 'Invalid secret' },
				{ status: 401 }
			);
		}

		// Log the webhook event for debugging
		console.log('Webhook received:', {
			_type: body._type,
			operation: body.operation,
		});

		// Revalidate the blog and posts tags
		revalidateTag('blog');
		revalidateTag('posts');

		return NextResponse.json({
			message: 'Revalidation triggered successfully',
			revalidated: true,
		});
	} catch (error) {
		console.error('Error handling webhook:', error);
		return NextResponse.json(
			{ message: 'Error processing webhook' },
			{ status: 500 }
		);
	}
}
