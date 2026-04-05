<script lang="ts" module>
	export const SITE_TITLE = "BLUE NOMAD: A Private Skin Health Studio in NYC";

	/**
	 * Helper function to generate page titles with the site title appended.
	 *
	 * @param page - The page title to append to the site title.
	 * @returns The full page title with the site title appended.
	 */
	export const pageTitle = (page: string) => `${page} | ${SITE_TITLE}`;
</script>

<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/icon.ico";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";
	import BookingButton from "$lib/components/booking-button.svelte";
	import { initCart } from "$lib/context/cart.svelte";
	import CartDrawer from "$lib/components/cart-drawer.svelte";
	import { initBooking } from "$lib/context/booking.svelte";
	import BookingDrawer from "$lib/components/booking-drawer.svelte";

	let { children } = $props();

	// Initialize the cart context
	initCart();
	initBooking();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />

	<!-- Google Fonts: Spectral + Source Code Pro -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;800&family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
		rel="stylesheet"
	/>

	<!-- SEO defaults -->
	<title>{SITE_TITLE}</title>
	<meta
		name="description"
		content="Blue Nomad is a private skin health studio in the heart of New York City."
	/>
	<meta
		name="keywords"
		content="skin, health, studio, new york city, skincare, beauty, wellness, facials"
	/>

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content="https://bluenomad.com" />
	<meta property="og:site_name" content="Blue Nomad" />
	<meta property="og:title" content="Blue Nomad" />
	<meta
		property="og:description"
		content="Blue Nomad is a private skin health studio in the heart of New York City."
	/>
	<meta property="og:image" content="https://bluenomad.com/icon.ico" />
	<meta property="og:image:width" content="800" />
	<meta property="og:image:height" content="600" />
	<meta property="og:image:alt" content="Blue Nomad" />
</svelte:head>

<Navbar />

<main class="w-full overflow-hidden">
	{@render children()}
</main>

<Footer />
<BookingButton />
<CartDrawer />
