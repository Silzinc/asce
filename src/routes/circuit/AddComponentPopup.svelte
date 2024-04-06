<script lang="ts">
	import type { CircuitElement, CircuitType } from '$lib/types';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';
	import DipoleValueInput from './DipoleValueInput.svelte';

	export let circuitType: CircuitType = 'series';
	export let circuitElement: CircuitElement = 'resistor';

	const defaultValues = {
		resistor: 500,
		capacitor: 1e-6,
		inductor: 1e-3
	};

	let alphabeticValue: string;
	let value: number;
	$: value = alphabeticValue ? Number(alphabeticValue) : defaultValues[circuitElement];

	const dispatch = createEventDispatcher();
	function submit() {
		dispatch('submit', { circuitType, circuitElement, value });
	}
</script>

<div class="p-4 bg-surface-300-600-token flex flex-col justify-normal">
	<RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary" class="w-full">
		<RadioItem bind:group={circuitType} name="series" value={'series'}>Serie</RadioItem>
		<RadioItem bind:group={circuitType} name="parallel" value={'parallel'}>Parallel</RadioItem>
	</RadioGroup>
	<RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
		<RadioItem bind:group={circuitElement} name="resistor" value={'resistor'}>R</RadioItem>
		<RadioItem bind:group={circuitElement} name="capacitor" value={'capacitor'}>C</RadioItem>
		<RadioItem bind:group={circuitElement} name="inductor" value={'inductor'}>L</RadioItem>
	</RadioGroup>
	<DipoleValueInput bind:value={alphabeticValue} bind:circuitElement />
	<button
		class="btn btn-sm bg-surface-100-800-token hover:variant-soft-secondary"
		on:click={submit}
		disabled={!(value >= 0)}
	>
		Add
	</button>
	<div class="arrow bg-surface-300-600-token flex-none" />
</div>
