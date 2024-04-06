import paper from 'paper';
import { circuitUnitLength } from '$stores';
import { get } from 'svelte/store';
import {
	drawCapacitor,
	drawGenerator,
	drawHorizontalLine,
	drawInductor,
	drawMass,
	drawResistor,
	drawVerticalLine,
	isDipole
} from './drawElectronics';

const $circuitUnitLength = get(circuitUnitLength);

interface Component {
	content: ComponentContent;
	foreNodeId: string;
}

interface ComponentContent {
	type: 'serie' | 'parallel' | 'simple' | 'poisoned';
	components?: Component[]; // Only non null if type is 'serie' or 'parallel'
	dipole?: Dipole; // Only non null if type is 'simple'
}

interface Dipole {
	type: 'resistor' | 'inductor' | 'capacitor';
	value: number;
}

export function constructCircuitFromObject(root: Component): paper.Item[] {
	// Get the component tree of the circuit
	const circuitComponents = constructComponentFromObject(root);
	// Lift the components to give space for the generator
	circuitComponents.forEach((item) => item.translate(new paper.Point(0, -$circuitUnitLength)));
	const width = circuitComponents.reduce(
		(acc, item) => Math.max(acc, item.bounds.right),
		-Infinity
	);

	// Draw the generator branch
	const leftVLine = drawVerticalLine(new paper.Point(0, 0), { length: $circuitUnitLength });
	// const rightVLine = drawVerticalLine(new paper.Point(width, 0), { length: $circuitUnitLength });
	const mass = drawMass(new paper.Point(width, 0), 'up');
	const leftHLine = drawHorizontalLine(new paper.Point(0, 0), {
		length: (width - $circuitUnitLength) / 2
	});
	const rightHLine = drawHorizontalLine(new paper.Point((width + $circuitUnitLength) / 2, 0), {
		length: (width - $circuitUnitLength) / 2
	});
	const generator = drawGenerator(new paper.Point(width / 2, 0));
	circuitComponents.push(leftVLine);
	// circuitComponents.push(rightVLine);
	circuitComponents.push(mass);
	circuitComponents.push(leftHLine);
	circuitComponents.push(rightHLine);
	circuitComponents.push(generator);

	return circuitComponents;
}

// Returns an array of paper.Items representing the component with its lower left corner at the origin (0, 0)
function constructComponentFromObject(component: Component): paper.Item[] {
	const content = component.content;
	const offset = new paper.Point(0, 0); // Offset to the lower left corner of the component

	switch (content.type) {
		case 'serie':
			const serie: paper.Item[] = [];
			const serialComponents = content.components!;
			for (const serialComponent of serialComponents) {
				const serialComponentItem = constructComponentFromObject(serialComponent);
				serialComponentItem.forEach((item) => item.translate(offset));
				// The components are built so that their width is a multiple of $circuitUnitLength
				const xBounds = serialComponentItem.reduce(
					(acc, item) => [Math.min(acc[0], item.bounds.left), Math.max(acc[1], item.bounds.right)],
					[Infinity, -Infinity]
				);
				const xUnits = (xBounds[1] - xBounds[0]) / $circuitUnitLength;
				offset.x += $circuitUnitLength * xUnits;
				if (serialComponentItem.length === 1 && isDipole(serialComponentItem[0])) {
					// Then the component is a dipole
					serie.push(serialComponentItem[0]);
				} else {
					// Flatten the children of the component
					for (const elem of serialComponentItem) {
						serie.push(elem);
					}
				}
			}
			return serie;

		case 'parallel':
			const parallel: paper.Item[] = [];
			const parallelComponents = content.components!;
			const parallelComponentItems: [paper.Item[], number][] = [];
			for (const parallelComponent of parallelComponents) {
				const parallelComponentItem = constructComponentFromObject(parallelComponent);
				parallelComponentItem.forEach((item) => item.translate(offset));
				const yBounds = parallelComponentItem.reduce(
					(acc, item) => [Math.min(acc[0], item.bounds.top), Math.max(acc[1], item.bounds.bottom)],
					[Infinity, -Infinity]
				);
				const yUnits = Math.ceil((yBounds[1] - yBounds[0]) / $circuitUnitLength);
				offset.y -= $circuitUnitLength * yUnits;
				parallelComponentItems.push([parallelComponentItem, yUnits]);
			}
			// The different components built need to be connected
			// This is the total widths of the parallel components
			const widths = parallelComponentItems.map((component) => {
				const xBounds = component[0].reduce(
					(acc, item) => [Math.min(acc[0], item.bounds.left), Math.max(acc[1], item.bounds.right)],
					[Infinity, -Infinity]
				);
				return xBounds[1] - xBounds[0];
			});
			const width = Math.max(...widths);
			offset.y = 0;
			const length = parallelComponentItems.length;
			for (let i = 0; i < length; i++) {
				const [parallelComponentItem, yUnits] = parallelComponentItems[i];
				const x = widths[i];

				if (parallelComponentItem.length === 1 && isDipole(parallelComponentItem[0])) {
					// Then the component is a dipole
					parallel.push(parallelComponentItem[0]);
				} else {
					// Flatten the children of the component
					for (const elem of parallelComponentItem) {
						parallel.push(elem);
					}
				}

				// Add a horizontal line to the right of the component
				const hLine = drawHorizontalLine(new paper.Point(x, offset.y), { length: width - x });
				if (width > x) parallel.push(hLine);

				// Add a vertical line to the right and the left of the component
				if (i < length - 1) {
					const rightVLine = drawVerticalLine(new paper.Point(width, offset.y), {
						length: $circuitUnitLength * yUnits
					});
					parallel.push(rightVLine);

					const leftVLine = drawVerticalLine(new paper.Point(0, offset.y), {
						length: $circuitUnitLength * yUnits
					});
					parallel.push(leftVLine);

					offset.y -= $circuitUnitLength * yUnits;
				}
			}
			return parallel;

		case 'simple':
			const dipole = content.dipole!;
			const drawingFunction =
				dipole.type === 'resistor'
					? drawResistor
					: dipole.type === 'inductor'
						? drawInductor
						: drawCapacitor;
			return [
				drawingFunction(offset, {
					value: dipole.value,
					id: component.foreNodeId
				})
			];

		case 'poisoned':
			return [new paper.Path()];
	}
}
