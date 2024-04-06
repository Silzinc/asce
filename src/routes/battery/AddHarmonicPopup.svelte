<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { prefixToFactor, voltageInRange, pulseInRange } from '$lib/displayHarmonic';

	let pulse: number = 0;
	let pulseFactor: number = 1;
	let voltage: number = 0;
	let voltageFactor: number = 1;
	let phase: number = 0;

	const dispatch = createEventDispatcher();
	function submit() {
		pulse = Number(pulse) * pulseFactor;
		voltage = Number(voltage) * voltageFactor;
		phase = Number(phase);
		phase %= 2 * Math.PI;
		if (phase > Math.PI) phase -= 2 * Math.PI;

		dispatch('submit', { pulse, voltage, phase });
	}
</script>

<div class="p-4 bg-surface-300-600-token flex flex-col">
	<div class="input-group">
		<div class="input-group-shim">Pulse</div>
		<input
			class="input"
			type="text"
			bind:value={pulse}
			class:error={!pulseInRange(pulse * pulseFactor)}
		/>
		<select bind:value={pulseFactor}>
			{#each Object.entries(prefixToFactor) as [prefix, factor]}
				<option value={factor}>2π {prefix}Hz</option>
			{/each}
		</select>
	</div>
	<div class="input-group">
		<div class="input-group-shim">Voltage</div>
		<input
			class="input"
			type="text"
			bind:value={voltage}
			class:error={!voltageInRange(voltage * voltageFactor)}
		/>
		<select bind:value={voltageFactor}>
			{#each Object.entries(prefixToFactor) as [prefix, factor]}
				<option value={factor}>{prefix}V</option>
			{/each}
		</select>
	</div>
	<div class="input-group">
		<div class="input-group-shim">Phase</div>
		<input class="input" type="text" bind:value={phase} class:error={isNaN(phase)} />
		<div>rad</div>
	</div>
	<button
		class="btn btn-sm bg-surface-100-800-token hover:variant-soft-secondary"
		on:click={submit}
		disabled={!pulseInRange(pulse * pulseFactor) ||
			!voltageInRange(voltage * voltageFactor) ||
			isNaN(phase)}
	>
		Add
	</button>

	<div class="arrow bg-surface-300-600-token flex-none" />
</div>

<style lang="postcss">
	.input-group {
		@apply grid grid-cols-[auto_1fr_auto] input-group-divider;
	}

	.input-group > :first-child {
		@apply w-24;
	}

	.input-group > input.error,
	.input-group > input.error:focus {
		@apply bg-error-backdrop-token;
	}

	.input-group > input:focus {
		@apply bg-success-backdrop-token;
	}

	.input-group > :last-child {
		@apply w-28;
	}
</style>
