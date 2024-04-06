import { readable, writable, type Writable } from 'svelte/store';
import $ from 'jquery';
import type { Harmonic } from '$lib/displayHarmonic';

export const ctrlPressed = readable(false, (set) => {
	const keydown = (e: JQuery.KeyDownEvent) => {
		if (e.key === 'Control') set(true);
	};
	const keyup = (e: JQuery.KeyUpEvent) => {
		if (e.key === 'Control') set(false);
	};
	$(document).on('keydown', keydown);
	$(document).on('keyup', keyup);
	return () => {
		$(document).off('keydown', keydown);
		$(document).off('keyup', keyup);
	};
});

export const selectedItem: Writable<paper.Item | null> = writable(null);
export const circuitUnitLength = readable(200);
export const generator: Writable<Array<Harmonic>> = writable([]);
generator.subscribe(console.log);
