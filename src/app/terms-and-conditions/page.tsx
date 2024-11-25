type Conditions = {
	title: string;
	content: string[];
};

const conditions: Conditions[] = [
	{
		title: 'Introduction',
		content: [
			`These Terms and Conditions ("Terms") govern your use of Blue Nomad’s website and spa services. By booking or using our services, you agree to be bound by these Terms.`,
			'Blue Nomad refers to the facial wellness spa operating under the name Blue Nomad.',
		],
	},
	{
		title: 'Services',
		content: [
			'Blue Nomad offers facial wellness treatments, skin care pdocuts, and related services. Our services are available only to individuals who are 18 years or older.',
			'All services provided are subject to availability. We reserve the right to refuse service at our discretion.',
		],
	},
	{
		title: 'Booking and Pyament',
		content: [
			'Appointments can be booked online through our website or in person. A valid credit card is required to secure a booking.',
			'Payments for services are due at the time of service, unless otherwise agreed upon.',
			'Cancellations must be made at least 24 hours before the scheduled appointment. Failure to do so will result in a cancellation fee.',
		],
	},
	{
		title: 'Pricing',
		content: [
			'Prices for services and products are subject to change without notice. We will provide the most current pricing on our website or at the time of booking.',
		],
	},
	{
		title: 'Health & Safety',
		content: [
			'It is your responsibility to inform us of any medical conditions, allergies, or sensitivities that may affect your ability to safely receive treatment.',
			'Blue Nomad will not be liable for any adverse reactions or side effects that result from services, including but not limited to facial treatments or skincare products.',
		],
	},
	{
		title: 'Refunds & Returns',
		content: [
			'Refunds are not provided for services rendered. However, in cases of dissatisfaction, we encourage you to contact us directly to resolve any issues.',
			'Product returns are accepted within 14 days of purchase, provided the product is unopened and in original condition.',
		],
	},
	{
		title: 'Privacy and Data Collection',
		content: [
			'We collect personal information as part of the booking process, including your name, contact details, and payment information. This information is used for the purpose of booking and providing services.',
			'We respect your privacy and will not share your personal information with third parties without your consent, except as required by law.',
		],
	},
	{
		title: 'User Conduct',
		content: [
			'You agree not to use Blue Nomad’s services for any unlawful purpose or in a way that could damage, disable, or impair the functioning of our spa or website.',
			'Any behavior deemed inappropriate by our staff may result in refusal of service.',
		],
	},
	{
		title: 'Limitation of Liability',
		content: [
			'Blue Nomad is not liable for any damages or losses incurred due to the use of our services, products, or website, including but not limited to injury, allergic reactions, or skin conditions.',
		],
	},
	{
		title: 'Intellectual Property',
		content: [
			'All content on the Blue Nomad website, including text, graphics, logos, and images, are the property of Blue Nomad and are protected by copyright laws.',
			'You may not copy, reproduce, or distribute any content without express written permission from Blue Nomad.',
		],
	},
	{
		title: 'Changes to Terms and Conditions',
		content: [
			'Blue Nomad reserves the right to update these Terms at any time. Changes will be posted on our website and will take effect immediately upon posting.',
		],
	},
	{
		title: 'Governing Law',
		content: [
			'These Terms and Conditions shall be governed by the laws of the state or country in which Blue Nomad operates.',
		],
	},
	{
		title: 'Contact Information',
		content: [
			'If you have any questions or concerns about these Terms, please contact us at [email address] or [phone number].',
		],
	},
];

export default function TermsAndConditions() {
	return (
		<section className='lg:flex-col'>
			<h1>Terms and Conditions</h1>

			<ol className='list-[decimal-leading-zero] space-y-8 my-8 px-10'>
				{conditions.map((condition, index) => (
					<li key={index}>
						<h2 className='font-semibold'>{condition.title}</h2>
						<ul className='list-disc ml-8 space-y-4'>
							{condition.content.map((content, index) => (
								<li key={index}>{content}</li>
							))}
						</ul>
					</li>
				))}
			</ol>
		</section>
	);
}
