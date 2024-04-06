<script lang="ts">
	import type { CircuitElement } from '$lib/types';

	export let circuitElement: CircuitElement = 'resistor';
	export let disabled: boolean = false;

	const placeholders = {
		resistor: '500',
		capacitor: '1e-6',
		inductor: '1e-3'
	};
	const units = {
		resistor: 'Ω',
		capacitor: 'F',
		inductor: 'H'
	};

	export let value: string = '';
</script>

<div
	class="input-group input-group-divider grid-cols-[auto_1fr_auto] border-surface-200-700-token border-2"
	class:success={Number(value) >= 0}
>
	<input
		class="input"
		placeholder={placeholders[circuitElement]}
		type="text"
		{disabled}
		bind:value
	/>
	<div class="w-16">{units[circuitElement]}</div>
</div>

<style lang="postcss">
	div.input-group:has(input:focus) {
		@apply border-error-400-500-token;
	}
	div.input-group.success:has(input:focus) {
		@apply border-success-400-500-token;
	}
	div.input-group:has(input:disabled) {
		cursor: not-allowed;
	}
</style>
