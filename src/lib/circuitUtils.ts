import paper from 'paper';
import type { CircuitElement, CircuitType } from './types';
import { triggerRedraw } from './handleCanvas';
import { invoke } from '@tauri-apps/api/tauri';
import { constructCircuitFromObject } from './constructCircuitFromObject';
import { generator } from '$stores';

export async function addComponent(
	circuitElement: CircuitElement,
	circuitType: CircuitType,
	value: number
) {
	const mainLayer = paper.project.activeLayer;
	const selected = mainLayer.getItem({ selected: true });
	if (!selected) return;
	switch (circuitType) {
		case 'series':
			await invoke('add_serial_component', { id: selected.data.id, kind: circuitElement, value });
			break;
		case 'parallel':
			await invoke('add_parallel_component', { id: selected.data.id, kind: circuitElement, value });
			break;
	}
	await redrawCircuit();
}

export async function redrawCircuit() {
	if (!paper.project) return;
	const circuitObject = JSON.parse(await invoke('get_circuit_content'));
	const circuit = constructCircuitFromObject(circuitObject);
	const mainLayer = paper.project.activeLayer;
	mainLayer.children = circuit;

	// moveToCenter();
	triggerRedraw();
}

export async function reloadGenerator() {
	generator.set(JSON.parse(await invoke('get_generator')));
}

export async function resetCircuit() {
	await invoke('reset_circuit');
	await redrawCircuit();
	await reloadGenerator();
}
