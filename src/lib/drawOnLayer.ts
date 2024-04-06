import paper from 'paper';
import { ctrlPressed } from '$stores';

type MouseEvent = paper.ToolEvent & { event: MouseEvent };
let localCtrlPressed = false;
ctrlPressed.subscribe((value) => (localCtrlPressed = value));

export function enableDrawOnLayer(layer: paper.Layer) {
	paper.view.onMouseMove = null;
	paper.view.onMouseDown = () => startDrawingOnLayer(layer);
	paper.view.onMouseUp = null;
}
export function disableDrawOnLayer() {
	paper.view.onMouseMove = null;
	paper.view.onMouseDown = null;
	paper.view.onMouseUp = null;
}
function startDrawingOnLayer(layer: paper.Layer) {
	if (localCtrlPressed) return;
	const path = new paper.Path();
	path.strokeColor = new paper.Color('black');
	path.strokeWidth = 2;
	layer.addChild(path);
	paper.view.onMouseMove = (e: MouseEvent) => drawOnLayer(e, layer);
	paper.view.onMouseUp = () => stopDrawingOnLayer(layer);
	paper.view.onMouseDown = null;
}
function drawOnLayer(event: MouseEvent, layer: paper.Layer) {
	const path = layer.lastChild as paper.Path;
	path.add(event.point);
}
function stopDrawingOnLayer(layer: paper.Layer) {
	const path = layer.lastChild as paper.Path;
	// Removes some points and smooths the path
	const smoothFactor = 50;
	path.simplify(smoothFactor);
	// path.fullySelected = true;
	paper.view.onMouseMove = null;
	paper.view.onMouseUp = null;
	paper.view.onMouseDown = () => startDrawingOnLayer(layer);
}
