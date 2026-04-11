<script lang="ts">
	import { pageTitle } from "../+layout.svelte";
	import DiagnosticForm from "$lib/components/diagnostic-form.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>{pageTitle("Skin Health Diagnosis")}</title>
</svelte:head>

<section class="block pt-30">
	<DiagnosticForm {data} />
</section>
