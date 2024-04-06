<script lang="ts">
	import { invoke } from '@tauri-apps/api';
	import { onMount } from 'svelte';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import jq from 'jquery';
	import Reload from 'virtual:icons/fa-solid/sync-alt';
	import Function from 'virtual:icons/fa-solid/function';
	import Plus from 'virtual:icons/fa6-solid/plus';
	import { getHarmonicDisplayUnits } from '$lib/displayHarmonic';
	import { resetCircuit, reloadGenerator } from '$lib/circuitUtils';
	import { generator } from '$stores';
	import VoltageBar from './VoltageBar.svelte';
	import AddHarmonicPopup from './AddHarmonicPopup.svelte';

	// Height of one table row
	const harmonicHeight = 90;
	// Upper margin of first row of the table
	const tableMarginTop = 20;
	// Max items per page
	function checkPageSize(value: string | null) {
		const parsed = Math.round(Number(value));
		if (parsed > 0 && parsed <= 10) return parsed;
		else return NaN;
	}
	let pageSize = checkPageSize(localStorage.getItem('pageSize')) || 8;
	function updatePageSize(e: Event) {
		if (e.target instanceof HTMLInputElement) {
			const value = e.target.value;
			pageSize = checkPageSize(value) || pageSize;
			localStorage.setItem('pageSize', pageSize.toString());
		}
	}

	// Interactive height resize of the table
	let totalTableHeight: number;
	$: totalTableHeight = pageSize * harmonicHeight + tableMarginTop;
	let table: HTMLTableElement;
	$: jq(table).css('height', totalTableHeight);

	let currentPage = 0;
	let numberOfPages = 1;
	$: numberOfPages = Math.ceil($generator.length / pageSize) || 1;

	async function update(index: number, voltage: number, phase: number) {
		await invoke('update_voltage_and_phase', { index, voltage, phase });
		// await reloadGenerator();
	}
	async function removeHarmonic(index: number) {
		await invoke('remove_pulse', { index });
		await reloadGenerator();
	}
	async function addHarmonic(
		event: CustomEvent<{ pulse: number; voltage: number; phase: number }>
	) {
		const { pulse, voltage, phase } = event.detail;
		await invoke('add_pulse', { pulse, voltage, phase });
		await reloadGenerator();
	}

	onMount(reloadGenerator);

	const dataPopup = 'addHarmonicPopup';
	const addHarmonicPopup: PopupSettings = {
		event: 'click',
		target: dataPopup,
		placement: 'bottom'
	};
</script>

<div id="top-right-buttons" class="flex flex-row absolute right-0">
	<button on:click={resetCircuit} title="Replace with default circuit">
		<Reload class="h-8 w-8" />
	</button>
	<button title={'Use a tension function\n      (coming soon)'} disabled>
		<Function class="h-8 w-8" />
	</button>
	<button use:popup={addHarmonicPopup} title="Add a harmonic">
		<Plus class="h-8 w-8" />
	</button>
</div>
<div class="container h-full mx-auto flex flex-col justify-center items-center">
	<!-- List of harmonics -->
	<table class="w-full table rounded-tl-3xl rounded-tr-3xl" bind:this={table}>
		{#each $generator
			.slice(pageSize * currentPage, pageSize * (currentPage + 1))
			.map((harmonic) => {
				return { harmonic, units: getHarmonicDisplayUnits(harmonic) };
			}) as { harmonic, units }}
			<VoltageBar
				bind:pulse={harmonic.pulse}
				bind:pulseUnit={units.pulseUnit}
				bind:voltage={harmonic.voltage}
				bind:voltageUnit={units.voltageUnit}
				bind:phase={harmonic.phase}
				height={harmonicHeight}
				marginTop={tableMarginTop}
				on:change={({ detail: { voltage, phase } }) => update(harmonic.index, voltage, phase)}
				on:remove={() => removeHarmonic(harmonic.index)}
			/>
		{/each}
	</table>
	<!-- / -->
	<!-- Pagination -->
	<div
		class={`
    bg-surface-100-800-token 
    rounded-bl-3xl rounded-br-3xl 
    flex justify-evenly
    w-full items-center py-2
    border-t-surface-400 border-t-2
    `}
	>
		<div>
			<label class="label" for="page-size">Max items per page</label>
			<input
				class="input"
				type="number"
				name="page-size"
				bind:value={pageSize}
				on:change={updatePageSize}
			/>
			<!-- <select class="select" name="page-size" bind:value={pageSize}> -->
			<!-- 	{#each Array(10) -->
			<!-- 		.fill(0) -->
			<!-- 		.map((_, k) => k + 1) as size} -->
			<!-- 		<option value={size} selected={size === pageSize}> -->
			<!-- 			{size} -->
			<!-- 		</option> -->
			<!-- 	{/each} -->
			<!-- </select> -->
		</div>
		<div>
			<button
				class="btn btn-sm
        rounded-bl-3xl rounded-br-3xl
        disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={currentPage === 0}
				on:click={() => (currentPage = 0)}
			>
				{'<<'}
			</button>
			<button
				class="btn btn-sm
        rounded-bl-3xl rounded-br-3xl
        disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={currentPage === 0}
				on:click={() => (currentPage -= 1)}
			>
				{'<'}
			</button>
			<span class="text-lg font-bold mx-2">
				{currentPage + 1} / {numberOfPages}
			</span>
			<button
				class="btn btn-sm
        rounded-bl-3xl rounded-br-3xl
        disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={$generator.length <= pageSize * (currentPage + 1)}
				on:click={() => (currentPage += 1)}
			>
				{'>'}
			</button>
			<button
				class="btn btn-sm
        rounded-bl-3xl rounded-br-3xl
        disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={$generator.length <= pageSize * (currentPage + 1)}
				on:click={() => (currentPage = numberOfPages - 1)}
			>
				{'>>'}
			</button>
		</div>
	</div>
</div>
<div data-popup={dataPopup}>
	<AddHarmonicPopup on:submit={addHarmonic} />
</div>

<style lang="postcss">
	#top-right-buttons button {
		@apply btn btn-sm variant-ghost-surface w-14 h-14;
	}
</style>
