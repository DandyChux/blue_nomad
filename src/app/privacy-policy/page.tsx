type PrivacyPolicy = {
	title: string;
	content: string;
};

const policies: PrivacyPolicy[] = [
	{
		title: 'Information Collection',
		content:
			'At Blue Nomad, we collect essential personal information (such as name, contact details, and payment information) to process bookings, enhance your experience, and deliver personalized skincare and wellness services. With your permission, we may also gather preferences and feedback to improve our offerings.',
	},
	{
		title: 'Use of Information',
		content:
			'We use your information solely to provide services, process payments, communicate updates, and personalize experiences. If you opt in, we may also send occasional offers and wellness insights to enhance your skincare journey.',
	},
	{
		title: 'Data Sharing',
		content:
			'Blue Nomad respects your privacy and does not sell or share your information with third parties, except as required to process payments or fulfill legal obligations.',
	},
	{
		title: 'Data Security',
		content:
			'We prioritize security and implement protective measures for your information. However, please note that no online transmission is entirely secure, so please be mindful when sharing sensitive details.',
	},
	{
		title: 'Your Rights',
		content:
			'You have the right to access, update, or request deletion of your personal information. To manage preferences or inquire about your data, please contact us at [contact email].',
	},
	{
		title: 'Updates to this Policy',
		content:
			'We may occasionally update this policy to reflect new practices. All updates will be posted here with a revised date.',
	},
	{
		title: 'Contact Us',
		content: 'For any privacy concerns, reach out to us at [contact email].',
	},
];

export default function PrivacyPolicy() {
	return (
		<section className='lg:flex-col pt-32'>
			<h1>Privacy Policy</h1>

			<ol className='list-[decimal-leading-zero] space-y-8 my-8 px-10'>
				{policies.map((policy, index) => (
					<li key={index}>
						<h2 className='font-medium'>{policy.title}</h2>
						<p className='mt-4'>{policy.content}</p>
					</li>
				))}
			</ol>
		</section>
	);
}
