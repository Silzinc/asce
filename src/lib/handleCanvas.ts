import paper from 'paper';
import { ctrlPressed, selectedItem } from '$stores';
import { modeCurrent } from '@skeletonlabs/skeleton';
import { selectable } from './drawElectronics';

const updateStorage = {
	zoom: () => localStorage.setItem('zoom', paper.view.zoom.toString()),
	center: () =>
		localStorage.setItem('center', [paper.view.center.x, paper.view.center.y].toString())
};

let localCtrlPressed = false;
ctrlPressed.subscribe((value) => (localCtrlPressed = value));

export function changeZoom(event: WheelEvent) {
	// This factor could be changed to make the zoom faster or slower
	const zoomFactor = 1.1;
	const point = new paper.Point(event.offsetX, event.offsetY);
	const oldZoom = paper.view.zoom;
	let newZoom = event.deltaY < 0 ? oldZoom * zoomFactor : oldZoom / zoomFactor;
	newZoom = Math.min(Math.max(newZoom, 0.1), 10);
	const beta = oldZoom / newZoom;
	const pc = point.subtract(paper.view.center);
	paper.view.translate(pc.multiply(beta - 1));
	paper.view.zoom = newZoom;
	updateStorage.zoom();
	updateStorage.center();
}

export function drag(event: paper.ToolEvent & { event: MouseEvent }) {
	if (!localCtrlPressed) return;
	const delta = event.point.subtract(event.downPoint);
	paper.view.translate(delta);
	updateStorage.center();
}

export function select(event: paper.ToolEvent) {
	paper.project.deselectAll();
	const item = event.item;
	if (item && selectable(item)) {
		selectedItem.set(item);
		item.selected = true;
	} else selectedItem.set(null);
}

const black = new paper.Color(0, 0, 0);
const silver = new paper.Color(0.8, 0.8, 0.8);
const strokeWidth = 8;
const strokeCap = 'round';

export function triggerRedraw() {
	const mainLayer = paper.project.activeLayer;
	modeCurrent.subscribe((value) => {
		mainLayer.strokeColor = value ? black : silver;
		mainLayer.selectedColor = value ? silver : black;
	});
	mainLayer.strokeWidth = strokeWidth;
	mainLayer.strokeCap = strokeCap;
}

export function moveToZero() {
	const [x, y] = [paper.view.center.x, paper.view.center.y];
	paper.view.translate([x, y]);
	updateStorage.center();
}

export function moveToCenter() {
	const mainLayer = paper.project.activeLayer;
	const bounds = mainLayer.bounds;
	const [x, y] = [bounds.center.x, bounds.center.y];
	moveToZero();
	paper.view.translate([-x, -y]);
	updateStorage.center();
	paper.view.zoom = 1;
	updateStorage.zoom();
}
