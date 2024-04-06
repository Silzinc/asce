<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import paper from 'paper';
	import { ctrlPressed } from '$stores';
	import { drag, changeZoom, select } from '$lib/handleCanvas';
	import { redrawCircuit } from '$lib/circuitUtils';
	import Curve from 'virtual:icons/mdi/chart-bell-curve-cumulative';
	import EmulatePopup from './EmulatePopup.svelte';

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

	const dataPopup = 'emulatePopup';
	const emulatePopup: PopupSettings = {
		event: 'click',
		target: dataPopup,
		placement: 'bottom'
	};
</script>

<div class="w-full h-full" class:ctrl={$ctrlPressed}>
	<div id="top-right-buttons" class="flex flex-row absolute right-0">
		<button use:popup={emulatePopup}>
			<Curve class="w-8 h-8" />
		</button>
	</div>
	<div data-popup={dataPopup}>
		<EmulatePopup />
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
