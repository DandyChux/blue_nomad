import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
	const { email } = await req.json();

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: "smtp.gmail.com",
		port: 587,
		secure: false, // use false for STARTTLS; true for SSL on port 465
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: process.env.EMAIL_USERNAME,
		subject: 'New Subscription',
		text: `New subscriber: ${email}`,
	};

	try {
		await transporter.sendMail(mailOptions);

		return new NextResponse(
			JSON.stringify({
				message: "Email sent"
			}), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			}
		}
		)
	} catch (error) {
		console.error(error);
		return new NextResponse(
			JSON.stringify({
				message: "Error sending email"
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				}
			}
		)
	}
}