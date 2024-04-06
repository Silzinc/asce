<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import paper from 'paper';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import Plus from 'virtual:icons/fa6-solid/plus';
	import Reload from 'virtual:icons/fa-solid/sync-alt';
	import Target from 'virtual:icons/tabler/target';
	import { ctrlPressed, selectedItem } from '$stores';
	import { drag, changeZoom, select, moveToCenter } from '$lib/handleCanvas';
	import type { CircuitElement } from '$lib/types';
	import { addComponent, redrawCircuit, resetCircuit } from '$lib/circuitUtils';
	import AddComponentPopup from './AddComponentPopup.svelte';
	import DipoleValueInput from './DipoleValueInput.svelte';

	const resizeAttr = { resize: true };

	// Lifecycle function
	function newPaperCanvas(canvas: HTMLCanvasElement) {
		paper.setup(canvas);
		const toolPan = new paper.Tool();
		toolPan.activate();

		// Allows to move the view with the mouse when ctrl is pressed
		toolPan.onMouseDrag = drag;

		// Allows to zoom in and out with the mouse wheel
		canvas.onwheel = changeZoom;

		// Enables selection for an item
		toolPan.onMouseDown = select;

		// Import the saved circuit
		redrawCircuit();

		// Move and zoom to the view before reloading the page
		const center = localStorage.getItem('center');
		const zoom = localStorage.getItem('zoom');
		if (center) {
			const [x, y] = center.split(',').map(Number);
			const [x0, y0] = [paper.view.center.x, paper.view.center.y];
			paper.view.translate(new paper.Point(x0 - x, y0 - y));
		}
		if (zoom) paper.view.zoom = Number(zoom);
	}

	// Popup settings for adding a component
	const dataPopup = 'addComponentPopup';
	const addComponentPopup: PopupSettings = {
		event: 'click',
		target: dataPopup,
		placement: 'bottom'
	};

	// Variables relative to the dipole value input, common for
	// the bottom-right and top-right inputs
	let selectedDipoleAlphabeticValue: string;
	let selectedDipoleElement: CircuitElement;
	let selectedDipoleValue: number;
	// For some reason, a manual subscribe is needed here
	// If we use the $: syntax, the value is not updated
	// The bottom-right input will not update on user input
	selectedItem.subscribe((item) => {
		if (item) {
			selectedDipoleAlphabeticValue = item.data.value.toString();
			selectedDipoleElement = item.data.type;
		}
	});
	// Note that selectedDipoleAlphabeticValue can update from other sources,
	// and we have to handle all of them with this separate $: syntax.
	$: selectedDipoleValue = Number(selectedDipoleAlphabeticValue);

	async function updateDipole() {
		if (selectedDipoleValue < 0) return;
		// Update frontend data
		if ($selectedItem) $selectedItem.data.value = selectedDipoleValue;
		// Update backend data
		await invoke('update_dipole', { id: $selectedItem?.data.id, value: selectedDipoleValue });
	}
</script>

<div class="w-full h-full" class:ctrl={$ctrlPressed}>
	<div id="top-right-buttons" class="flex flex-row absolute right-0">
		<button on:click={moveToCenter} title="Move to center">
			<Target class="h-8 w-8" />
		</button>
		<button on:click={resetCircuit} title="Replace with default circuit">
			<Reload class="h-8 w-8" />
		</button>
		<button
			id="spawn-addComponentPopup"
			disabled={$selectedItem === null}
			use:popup={addComponentPopup}
			title="Add a component"
		>
			<Plus class="h-8 w-8" />
		</button>
	</div>
	<div data-popup={dataPopup}>
		<AddComponentPopup
			on:submit={({ detail: { circuitType, circuitElement, value } }) =>
				addComponent(circuitElement, circuitType, value)}
		/>
	</div>
	<div
		id="bottom-right-input"
		class="flex flex-row absolute right-0 bottom-0"
		class:disabled={$selectedItem === null}
	>
		<DipoleValueInput
			bind:circuitElement={selectedDipoleElement}
			bind:value={selectedDipoleAlphabeticValue}
			disabled={$selectedItem === null}
		/>
		<button
			class="btn btn-base pr-2 pl-2 variant-filled-secondary"
			on:click={updateDipole}
			disabled={$selectedItem === null}
		>
			Update
		</button>
	</div>
	<canvas use:newPaperCanvas {...resizeAttr} />
</div>

<style lang="postcss">
	canvas[resize] {
		width: 100%;
		height: 100%;
	}
	div:active.ctrl {
		cursor: move;
	}
	#top-right-buttons button {
		@apply btn btn-sm variant-ghost-surface w-14 h-14;
	}
	#bottom-right-input.disabled {
		opacity: 0.5;
	}
</style>
