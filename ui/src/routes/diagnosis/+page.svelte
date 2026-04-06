<script lang="ts">
	import { pageTitle } from "../+layout.svelte";
	import DiagnosticForm from "$lib/components/diagnostic-form.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>{pageTitle("Skin Health Diagnosis")}</title>
</svelte:head>

<section class="block pt-30">
	<header class="mb-8">
		<h1>Skin Health Diagnosis</h1>
		<p>
			Answer a couple questions to discover your skin health concerns and
			what products might help.
		</p>
	</header>

	<DiagnosticForm {data} />
</section>
