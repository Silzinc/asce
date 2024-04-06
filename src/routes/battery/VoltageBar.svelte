<script lang="ts">
	import XMark from 'virtual:icons/fa6-solid/xmark';
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import { type UnitPrefix, prefixToFactor, voltageInRange } from '$lib/displayHarmonic';
	import { createEventDispatcher } from 'svelte';

	export let height: number;
	export let marginTop: number;

	export let voltage: number;
	export let pulse: number;
	export let phase: number;
	export let voltageUnit: UnitPrefix;
	export let pulseUnit: UnitPrefix;

	let displayedVoltage: number;
	let boundVoltageInput: string;
	$: boundVoltageInput = displayedVoltage.toString();
	let displayedPulse: number;
	let displayedPhase: number;
	const allowedVoltagePrecision = 100;
	const allowedPulsePrecision = 100;
	const allowedPhasePrecision = 100;

	$: displayedVoltage =
		Math.round((voltage * allowedVoltagePrecision) / prefixToFactor[voltageUnit]) /
		allowedVoltagePrecision;
	$: displayedPulse =
		Math.round((pulse * allowedPulsePrecision) / prefixToFactor[pulseUnit]) / allowedPulsePrecision;
	$: displayedPhase = Math.round(phase * allowedPhasePrecision) / allowedPhasePrecision;
	const approxPi = Math.round(Math.PI * allowedPhasePrecision) / allowedPhasePrecision;

	function handleRangeVoltageChange(event: Event) {
		if (event.target instanceof HTMLInputElement) {
			voltage = Number(event.target.value) * prefixToFactor[voltageUnit];
			dispatchChange();
		}
	}

	function handleRangePhaseChange(event: Event) {
		if (event.target instanceof HTMLInputElement) {
			phase = Number(event.target.value);
			dispatchChange();
		}
	}

	function handleManualVoltageChange() {
		const parsed = Number(boundVoltageInput) * prefixToFactor[voltageUnit];
		if (!voltageInRange(parsed)) return (boundVoltageInput = displayedVoltage.toString());
		voltage = parsed;
		dispatchChange();
		boundVoltageInput = displayedVoltage.toString();
	}

	function handleManualPhaseChange(event: Event) {
		if (event.target instanceof HTMLInputElement) {
			const parsed = Number(event.target.value);
			if (isNaN(parsed)) return (event.target.value = displayedPhase.toString());
			phase = parsed;
			dispatchChange();
			event.target.value = displayedPhase.toString();
		}
	}

	function handleVoltageUnitChange(event: Event) {
		if (event.target instanceof HTMLSelectElement) {
			const newVoltageFactor = prefixToFactor[event.target.value as UnitPrefix];
			const oldVoltageFactor = prefixToFactor[voltageUnit];
			voltage *= newVoltageFactor / oldVoltageFactor;
			dispatchChange();
		}
	}

	const dispatch = createEventDispatcher();
	function dispatchChange() {
		console.log('change', { voltage, phase });
		if (voltage < 0) {
			phase += Math.PI;
			voltage = Math.abs(voltage);
		}
		phase %= 2 * Math.PI;
		if (phase > Math.PI) phase -= 2 * Math.PI;
		dispatch('change', { voltage, phase });
	}

	function dispatchRemove() {
		dispatch('remove');
	}
</script>

<tr
	class="grid grid-cols-6 grid-rows-1 place-items-center gap-2"
	style={`
    height: ${height}px;
    --margin-top: ${marginTop}px;
  `}
>
	<th>
		{displayedPulse}/2π {pulseUnit}Hz
	</th>
	<td class="grid grid-cols-2 grid-rows-2 gap-y-2 col-span-2">
		<input
			class="input col-span-1 row-span-1"
			name="manual-voltage"
			type="text"
			bind:value={boundVoltageInput}
			on:change={handleManualVoltageChange}
			class:input-error={!voltageInRange(Number(boundVoltageInput) * prefixToFactor[voltageUnit])}
		/>
		<select
			class="select col-span-1 row-span-1"
			on:change={handleVoltageUnitChange}
			value={voltageUnit}
		>
			{#each Object.entries(prefixToFactor) as [prefix, _]}
				<option value={prefix}>{prefix}V</option>
			{/each}
		</select>
		<RangeSlider
			class="col-span-2 row-span-1"
			name="voltage"
			min={0}
			max={1000}
			step={1 / allowedVoltagePrecision}
			bind:value={displayedVoltage}
			on:change={handleRangeVoltageChange}
		/>
	</td>
	<td class="grid grid-cols-2 grid-rows-2 gap-y-2 col-span-2">
		<input
			class="input col-span-1 row-span-1"
			name="manual-phase"
			type="text"
			value={displayedPhase.toString()}
			on:change={handleManualPhaseChange}
		/>
		<div class="bg-surface-200-700-token col-span-1 row-span-1 flex flex-col justify-center pl-2">
			rad
		</div>
		<RangeSlider
			class="col-span-2 row-span-1"
			name="phase"
			min={-approxPi}
			max={approxPi}
			step={1 / allowedPhasePrecision}
			bind:value={displayedPhase}
			on:change={handleRangePhaseChange}
		/>
	</td>
	<td>
		<button on:click={dispatchRemove} class="x-button">
			<XMark class="h-12 w-12 text-error-500-400-token" />
		</button>
	</td>
</tr>

<style lang="postcss">
	input {
		@apply bg-transparent border-transparent;
	}

	.x-button {
		transition: filter 0.5s ease;
	}
	.x-button:hover {
		filter: drop-shadow(0px 0px 8px red);
	}

	tr:first-child {
		margin-top: var(--margin-top);
	}
</style>
