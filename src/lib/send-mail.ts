'use server'

import nodemailer from 'nodemailer'

const SMTP_SERVER_HOST = 'smtp.gmail.com'
const SMTP_SERVER_PORT = 465
const SMTP_SERVER_USERNAME = process.env.EMAIL_USERNAME
const SMTP_SERVER_PASSWORD = process.env.EMAIL_PASSWORD

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