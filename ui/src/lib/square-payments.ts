const SANDBOX_SDK_URL = "https://sandbox.web.squarecdn.com/v1/square.js";
const PRODUCTION_SDK_URL = "https://web.squarecdn.com/v1/square.js";

export interface SquareTokenizeError {
	message?: string;
	type?: string;
	field?: string;
}

export interface SquareTokenizeResult {
	status: "OK" | "ERROR";
	token?: string;
	errors?: SquareTokenizeError[];
}

export interface SquareVerificationResult {
	token: string;
}

export interface SquareVerifyBuyerDetails {
	amount: string;
	currencyCode: string;
	intent: "CHARGE" | "STORE";
	billingContact?: {
		givenName?: string;
		familyName?: string;
		email?: string;
		phone?: string;
		countryCode?: string;
		city?: string;
		addressLines?: string[];
	};
}

export interface SquareCard {
	attach(target: string | HTMLElement): Promise<void>;
	tokenize(): Promise<SquareTokenizeResult>;
	destroy?(): Promise<void>;
}

export interface SquarePayments {
	card(): Promise<SquareCard>;
	verifyBuyer?(
		sourceId: string,
		details: SquareVerifyBuyerDetails,
	): Promise<SquareVerificationResult>;
}

export interface SquareGlobal {
	payments(applicationId: string, locationId: string): SquarePayments;
}

declare global {
	interface Window {
		Square?: SquareGlobal;
	}
}

const sdkPromises = new Map<string, Promise<SquareGlobal>>();

export function getSquareSdkUrl(applicationId: string) {
	return applicationId.startsWith("sandbox-")
		? SANDBOX_SDK_URL
		: PRODUCTION_SDK_URL;
}

export function loadSquare(applicationId: string): Promise<SquareGlobal> {
	if (typeof window === "undefined") {
		return Promise.reject(
			new Error("Square Web Payments SDK can only load in the browser."),
		);
	}

	if (window.Square) {
		return Promise.resolve(window.Square);
	}

	const src = getSquareSdkUrl(applicationId);
	const existingPromise = sdkPromises.get(src);
	if (existingPromise) {
		return existingPromise;
	}

	const promise = new Promise<SquareGlobal>((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>(
			`script[data-square-sdk="${src}"]`,
		);

		if (existingScript) {
			if (window.Square) {
				resolve(window.Square);
				return;
			}

			const handleLoad = () => {
				if (window.Square) {
					resolve(window.Square);
				} else {
					reject(
						new Error(
							"Square SDK loaded but window.Square is missing.",
						),
					);
				}
			};

			const handleError = () => {
				reject(new Error("Failed to load Square Web Payments SDK."));
			};

			existingScript.addEventListener("load", handleLoad, { once: true });
			existingScript.addEventListener("error", handleError, {
				once: true,
			});
			return;
		}

		const script = document.createElement("script");
		script.src = src;
		script.async = true;
		script.dataset.squareSdk = src;

		script.onload = () => {
			if (window.Square) {
				resolve(window.Square);
			} else {
				reject(
					new Error(
						"Square SDK loaded but window.Square is missing.",
					),
				);
			}
		};

		script.onerror = () => {
			reject(new Error("Failed to load Square Web Payments SDK."));
		};

		document.head.appendChild(script);
	});

	sdkPromises.set(src, promise);
	return promise;
}
