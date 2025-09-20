'use server'

import { draftMode } from 'next/headers'
import nodemailer from 'nodemailer'

const SMTP_SERVER_HOST = 'smtp.gmail.com'
const SMTP_SERVER_PORT = 465
const SMTP_SERVER_USERNAME = process.env.EMAIL_USERNAME
const SMTP_SERVER_PASSWORD = process.env.EMAIL_PASSWORD
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY

const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: SMTP_SERVER_HOST,
	port: SMTP_SERVER_PORT,
	secure: true,
	auth: {
		user: SMTP_SERVER_USERNAME,
		pass: SMTP_SERVER_PASSWORD,
	}
})

export async function sendMail({
	email = SMTP_SERVER_USERNAME as string,
	sendTo,
	subject,
	text,
	html
}: {
	email: string;
	sendTo?: string;
	subject: string;
	text: string;
	html?: string;
}) {
	try {
		const isVerified = await transporter.verify()
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error sending email: ${error.message}`)
		} else {
			console.error('Error sending email:', error)
		}
		console.error('Something went wrong', SMTP_SERVER_USERNAME)
		return;
	}

	const info = await transporter.sendMail({
		from: email,
		to: sendTo || SMTP_SERVER_USERNAME,
		subject,
		text,
		html: html ? html : ''
	});

	console.log(`Message sent: ${info.messageId}`)
	console.log(`Mail sent to: ${sendTo || SMTP_SERVER_USERNAME}`)
	return info;

}

/**
 * Add or update a contact in HubSpot CRM
 * @param email - The email address of the contact
 * @param properties - Additional properties to set on the contact (optional)
 * @returns The created/updated contact data or an error
 */
export async function addToHubSpot({
	email,
	properties = {}
}: {
	email: string;
	properties?: Record<string, any>;
}) {
	if (!HUBSPOT_API_KEY) {
		console.error('HubSpot API key not configured');
		throw new Error('HubSpot integration not configured');
	}

	const hubspotUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';

	try {
		// First, try to create the contact
		const createResponse = await fetch(hubspotUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				properties: {
					email,
					...properties,
					// Add a custom property to track the subscription source
					hs_lead_status: 'NEW',
					lifecyclestage: 'subscriber',
				}
			})
		});

		if (createResponse.ok) {
			const contact = await createResponse.json();

			// Optionally add to a specific list if you have a list ID
			if (process.env.HUBSPOT_LIST_ID) {
				await addContactToList(contact.id, process.env.HUBSPOT_LIST_ID);
			}

			return { success: true, contact };
		}

		// If contact exists (409 conflict), update it instead
		if (createResponse.status === 409) {
			// Get the existing contact
			const searchResponse = await fetch(
				`${hubspotUrl}/search`,
				{
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						filterGroups: [{
							filters: [{
								propertyName: 'email',
								operator: 'EQ',
								value: email
							}]
						}]
					})
				}
			);

			if (searchResponse.ok) {
				const searchData = await searchResponse.json();
				if (searchData.results && searchData.results.length > 0) {
					const contactId = searchData.results[0].id;

					// Update the existing contact
					const updateResponse = await fetch(
						`${hubspotUrl}/${contactId}`,
						{
							method: 'PATCH',
							headers: {
								'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								properties: {
									...properties,
									lifecyclestage: 'subscriber',
								}
							})
						}
					);

					if (updateResponse.ok) {
						const contact = await updateResponse.json();
						console.log(`Contact updated in HubSpot: ${email}`);

						// Add to list if not already there
						if (process.env.HUBSPOT_LIST_ID) {
							await addContactToList(contactId, process.env.HUBSPOT_LIST_ID);
						}

						return { success: true, contact, updated: true };
					}
				}
			}
		}

		// If we get here, something went wrong
		const errorData = await createResponse.text();
		console.error(`HubSpot API error: ${createResponse.status} - ${errorData}`);
		throw new Error(`Failed to add contact to HubSpot: ${createResponse.statusText}`);

	} catch (error) {
		console.error('Error adding contact to HubSpot:', error);
		throw error;
	}
}

/**
 * Add a contact to a specific HubSpot list
 * @param contactId - The HubSpot contact ID
 * @param listId - The HubSpot list ID
 */
async function addContactToList(contactId: string, listId: string) {
	if (!HUBSPOT_API_KEY) {
		return;
	}

	try {
		const response = await fetch(
			`https://api.hubapi.com/crm/v3/lists/${listId}/memberships/add`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify([contactId])
			}
		);

		if (response.ok) {
			console.log(`Contact ${contactId} added to list ${listId}`);
		} else {
			console.error(`Failed to add contact to list: ${response.statusText}`);
		}
	} catch (error) {
		console.error('Error adding contact to list:', error);
	}
}

export async function disableDraftMode() {
	const disable = (await draftMode()).disable()
	const delay = new Promise((resolve) => setTimeout(resolve, 1000))

	await Promise.allSettled([disable, delay])
}
