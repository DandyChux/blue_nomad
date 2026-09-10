export * from "./square";
export * from "./post";
export * from "./diagnostic";

export interface BookingSummary {
	requestId: string;
	bookingId?: string;
	serviceId: string;
	name: string;
	service: string;
	price: number;
	currency: string;
	date: string;
	time: string;
}
