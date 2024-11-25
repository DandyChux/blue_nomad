type FAQ = {
	question: string;
	answer: string;
};

const faqs: FAQ[] = [
	{
		question: 'What types of treatments do you offer?',
		answer:
			'Currently, we offer a variety of customized facial skin health treatments and consultations. Each treatment is designed to provide relaxation and visible results.',
	},
	{
		question: 'How do I know which facial treatment is best for me?',
		answer:
			"Our experienced team is here to guide you! During your first visit, we'll conduct a skin consultation to understand your skin type, concerns, and goals, helping us recommend the ideal treatment for your unique needs.",
	},
	{
		question: 'Do I need to book an appointment in advance?',
		answer:
			'Yes, we recommend booking in advance to secure your preferred time and service.',
	},
	{
		question: 'How early shoudl I arrive for my appointment?',
		answer:
			'Arriving 15-20 minutes before your appointment allows you to relax, complete any necessary forms, and begin your experience with calm and ease.',
	},
	{
		question: 'What should I wear, and do I need to bring anything?',
		answer:
			'You don&apos;t need to bring anything special. We provide everything you&apos;ll need. We do recommend wearing comfortable clothing.',
	},
	{
		question: 'What is the cancellation policy?',
		answer:
			'We kindly ask for 24 hours&apos;s notice if you need to cancel or reschedule. Cancellations within 24 hours may incur a fee, as we reserve the time and resources just for you.',
	},
	{
		question: 'How long do the results from the treatments last?',
		answer:
			'The longevity of results varies by treatment and individual skin type. Monthly sessions help maintain results, and we can recommend at-home skin health routines to extend the benefits.',
	},
	{
		question: 'Are your products and treatments suitable for sensitive skin?',
		answer:
			'Absolutely. We offer products and treatments specifically formulated for all skin types. We will work with you to choose options that aare gentle and effective for your skin type.',
	},
	{
		question: 'How often should I come for treatments?',
		answer:
			'Depending on your goals, we usually recommend scheduling facials every 4-6 weeks for optimal skin health.',
	},
	{
		question: 'What safety measures are you taking for health and hygiene?',
		answer:
			'We adhere to strict sanitation protocols, including disinfecting treatment rooms and equipment after each client, wearing masks, and following any current health guidelines to ensure a safe environment.',
	},
];

export default function FAQ() {
	return (
		<section className='lg:flex-col'>
			<h1>Frequently Asked Questions (FAQ)</h1>

			<ol className='list-[decimal-leading-zero] space-y-8 my-8 px-10'>
				{faqs.map((faq, index) => (
					<li key={index}>
						<h2 className='font-medium'>{faq.question}</h2>
						<p className='mt-4'>{faq.answer}</p>
					</li>
				))}
			</ol>
		</section>
	);
}
