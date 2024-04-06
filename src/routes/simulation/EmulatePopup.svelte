<script lang="ts">
	import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
	import { createEventDispatcher } from 'svelte';

	type UnitFactor = 1e-9 | 1e-6 | 1e-3 | 1 | 60 | 3600;
	type UnitName = 'ns' | 'µs' | 'ms' | 's' | 'min' | 'h';
	const prefixToFactor: Record<UnitName, UnitFactor> = {
		ns: 1e-9,
		µs: 1e-6,
		ms: 1e-3,
		s: 1,
		min: 60,
		h: 3600
	};

	let emulationType: 'tension' | 'potential' | 'current' = 'tension';

	let duration: number = 1;
	let durationFactor: UnitFactor = 1;
	let durationValid = true;
	$: durationValid = duration > 0;

	let numberOfPoints: number;
	let numberOfPointsValid = true;
	$: numberOfPointsValid = numberOfPoints > 1;
	const scalingPower = 5;
	let numberOfPointsUniformlyScaled: number;
	$: numberOfPoints = Math.round(
		2 + (numberOfPointsUniformlyScaled * (1e5 - 2) ** (1 / scalingPower)) ** scalingPower
	);
</script>

<div class="p-4 bg-surface-300-600-token flex flex-col justify-normal" style="max-width: 350px">
	<RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary" class="w-full">
		{#each ['Tension', 'Current', 'Potential'] as type}
			<RadioItem bind:group={emulationType} name={type.toLowerCase()} value={type.toLowerCase()}>
				{type}
			</RadioItem>
		{/each}
	</RadioGroup>
	<div
		class="grid grid-cols-3 grid-rows-2 w-full place-items-center my-1 px-1 gap-1 bg-surface-200-700-token"
	>
		<label class="label col-span-1 row-span-1" for="duration">Duration: </label>
		<input
			class="input col-span-1 row-span-1"
			class:input-error={!durationValid}
			type="text"
			bind:value={duration}
			name="duration"
		/>
		<select class="select col-span-1 row-span-1" bind:value={durationFactor} name="time-unit">
			{#each Object.entries(prefixToFactor) as [name, factor]}
				<option value={factor}>{name}</option>
			{/each}
		</select>
		<RangeSlider
			class="col-span-3 row-span-1 w-11/12"
			bind:value={duration}
			min={0.1}
			max={1000}
			step={0.1}
			name="duration"
		/>
	</div>

	<div
		class="grid grid-cols-2 grid-rows-2 w-full place-items-center mb-1 px-1 gap-1 bg-surface-200-700-token"
	>
		<label class="label col-span-1 row-span-1" for="nb-points">Number of points: </label>
		<input
			class="input col-span-1 row-span-1"
			class:input-error={!numberOfPointsValid}
			type="text"
			bind:value={numberOfPoints}
			name="nb-points"
		/>
		<RangeSlider
			class="col-span-3 row-span-1 w-11/12"
			bind:value={numberOfPointsUniformlyScaled}
			min={0}
			max={1}
			step={0.01}
			name="duration"
		/>
	</div>
	<button
		class="btn btn-sm bg-surface-100-800-token hover:variant-soft-secondary"
		disabled={!durationValid || !numberOfPointsValid}
	>
		Emulate
	</button>
	<div class="arrow bg-surface-300-600-token flex-none" />
</div>
