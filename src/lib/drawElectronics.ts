import paper from 'paper';
import { circuitUnitLength } from '$stores';
import { get } from 'svelte/store';

const $circuitUnitLength = get(circuitUnitLength);
interface DrawElectronicsOptions {
	width?: number;
	toLeft?: boolean;
	value?: number;
	id?: string;
}
interface DrawWireOptions {
	length?: number;
	reverse?: boolean;
}

export function drawGenerator(center: paper.Point, options: DrawElectronicsOptions = {}) {
	const width = options.width ?? $circuitUnitLength;
	const generator = new paper.Group({
		data: {
			id: options.id,
			type: 'generator'
		} as const
	});

	const genLine = new paper.Path();
	genLine.add(center.subtract(new paper.Point(width / 2, 0)));
	genLine.add(center.add(new paper.Point(width / 2, 0)));

	const genCircle = new paper.Path.Circle({
		center: center,
		radius: width / 4,
		fillColor: new paper.Color(0, 0, 0, 0)
	});

	generator.addChild(genLine);
	generator.addChild(genCircle);

	// paper.project.activeLayer.addChild(generator);
	return generator;
}

export function drawResistor(start: paper.Point, options: DrawElectronicsOptions = {}) {
	const toLeft = options.toLeft ?? false;
	const absoluteWidth = options.width ?? $circuitUnitLength;
	const resistance = options.value ?? 0;

	const width = absoluteWidth * (toLeft ? -1 : 1);

	const heightToWidthRatio = 0.2;
	const resistor = new paper.Group({
		data: {
			id: options.id,
			type: 'resistor',
			value: resistance
		} as const
	});

	const resLeftLine = new paper.Path();
	resLeftLine.add(start);
	resLeftLine.add(start.add(new paper.Point(width / 4, 0)));

	const resRightLine = new paper.Path();
	resRightLine.add(start.add(new paper.Point((width / 4) * 3, 0)));
	resRightLine.add(start.add(new paper.Point(width, 0)));

	const resRect = new paper.Path.Rectangle({
		from: start.add(new paper.Point(width / 4, (-width * heightToWidthRatio) / 2)),
		to: start.add(new paper.Point((width / 4) * 3, (width * heightToWidthRatio) / 2)),
		fillColor: new paper.Color('transparent')
	});

	resistor.addChild(resLeftLine);
	resistor.addChild(resRightLine);
	resistor.addChild(resRect);

	// paper.project.activeLayer.addChild(resistor);
	return resistor;
}

export function drawCapacitor(start: paper.Point, options: DrawElectronicsOptions = {}) {
	const toLeft = options.toLeft ?? false;
	const absoluteWidth = options.width ?? $circuitUnitLength;
	const capacity = options.value ?? 0;
	const width = absoluteWidth * (toLeft ? -1 : 1);

	const heightToWidthRatio = 0.4;
	const linesToWidthRatio = 0.8;
	const capacitor = new paper.Group({
		data: {
			id: options.id,
			type: 'capacitor',
			value: capacity
		} as const
	});

	const capLeftLine = new paper.Path();
	capLeftLine.add(start);
	capLeftLine.add(start.add(new paper.Point((width * linesToWidthRatio) / 2, 0)));

	const capRightLine = new paper.Path();
	capRightLine.add(start.add(new paper.Point(width * (1 - linesToWidthRatio / 2), 0)));
	capRightLine.add(start.add(new paper.Point(width, 0)));

	const capLeftBar = new paper.Path();
	capLeftBar.add(
		start.add(new paper.Point((width * linesToWidthRatio) / 2, (-width * heightToWidthRatio) / 2))
	);
	capLeftBar.add(
		start.add(new paper.Point((width * linesToWidthRatio) / 2, (width * heightToWidthRatio) / 2))
	);

	const capRightBar = new paper.Path();
	capRightBar.add(
		start.add(
			new paper.Point(width * (1 - linesToWidthRatio / 2), (-width * heightToWidthRatio) / 2)
		)
	);
	capRightBar.add(
		start.add(
			new paper.Point(width * (1 - linesToWidthRatio / 2), (width * heightToWidthRatio) / 2)
		)
	);

	capacitor.addChild(capLeftLine);
	capacitor.addChild(capRightLine);
	capacitor.addChild(capLeftBar);
	capacitor.addChild(capRightBar);

	// paper.project.activeLayer.addChild(capacitor);
	return capacitor;
}

export function drawInductor(start: paper.Point, options: DrawElectronicsOptions = {}) {
	const toLeft = options.toLeft ?? false;
	const absoluteWidth = options.width ?? $circuitUnitLength;
	const width = absoluteWidth * (toLeft ? -1 : 1);
	const inductance = options.value ?? 0;

	const heightToWidthRatio = 0.15;
	const linesToWidthRatio = 0.5;
	const nCoils = 8;

	const inductor = new paper.Group({
		data: {
			id: options.id,
			type: 'inductor',
			value: inductance
		} as const
	});

	const indLeftLine = new paper.Path();
	indLeftLine.add(start);
	indLeftLine.add(start.add(new paper.Point((width * linesToWidthRatio) / 2, 0)));

	const indRightLine = new paper.Path();
	indRightLine.add(start.add(new paper.Point(width * (1 - linesToWidthRatio / 2), 0)));
	indRightLine.add(start.add(new paper.Point(width, 0)));

	const ellipsesStart = start.add(new paper.Point((width * linesToWidthRatio) / 2, 0));

	inductor.addChild(indLeftLine);
	inductor.addChild(indRightLine);

	for (let i = 0.5; i < nCoils; i++) {
		const indEllipse = new paper.Path.Ellipse({
			center: ellipsesStart.add(
				new paper.Point(((width * (1 - linesToWidthRatio)) / nCoils) * i, 0)
			),
			radius: new paper.Size(
				(width * (1 - linesToWidthRatio)) / nCoils,
				width * heightToWidthRatio
			),
			fillColor: new paper.Color('transparent')
		});
		inductor.addChild(indEllipse);
	}

	// paper.project.activeLayer.addChild(inductor);
	return inductor;
}

export function drawHorizontalLine(start: paper.Point, options: DrawWireOptions = {}) {
	const absoluteLength = options.length ?? $circuitUnitLength;
	const length = options.reverse ? -absoluteLength : absoluteLength;
	const line = new paper.Path({
		data: {
			type: 'H-wire'
		} as const
	});
	line.add(start);
	line.add(start.add(new paper.Point(length, 0)));
	// paper.project.activeLayer.addChild(line);
	return line;
}

export function drawVerticalLine(start: paper.Point, options: DrawWireOptions = {}) {
	const absoluteLength = options.length ?? $circuitUnitLength;
	const length = options.reverse ? -absoluteLength : absoluteLength;
	const line = new paper.Path({
		data: {
			type: 'V-wire'
		} as const
	});
	line.add(start);
	line.add(start.add(new paper.Point(0, -length)));
	// paper.project.activeLayer.addChild(line);
	return line;
}

export function drawMass(start: paper.Point, direction: 'up' | 'down' | 'left' | 'right') {
	const mass = new paper.Group({
		data: {
			type: 'mass'
		}
	});
	// Let's first draw the mass like the direction was 'right' and then rotate it

	const massLongHorizontalLine = new paper.Path.Line(start, start.add([$circuitUnitLength, 0]));
	mass.addChild(massLongHorizontalLine);

	const startOfVerticalLine = start.add([$circuitUnitLength / 2, 0]);
	const endOfVerticalLine = startOfVerticalLine.add([0, $circuitUnitLength / 4]);
	const massVerticalLine = new paper.Path.Line(startOfVerticalLine, endOfVerticalLine);
	mass.addChild(massVerticalLine);

	const lengthOfShortHorizontalLine = $circuitUnitLength / 4;
	const massShortHorizontalLine = new paper.Path.Line(
		endOfVerticalLine.subtract([lengthOfShortHorizontalLine / 2, 0]),
		endOfVerticalLine.add([lengthOfShortHorizontalLine / 2, 0])
	);
	mass.addChild(massShortHorizontalLine);

	const leftOfShortHorizontalLine = massShortHorizontalLine.bounds.leftCenter;

	const numberOfDiagonalLines = 4;
	const lengthUnitOfDiagonalLine = $circuitUnitLength / 12;
	for (let i = 0; i < numberOfDiagonalLines; i++) {
		const startOfDiagonalLine = leftOfShortHorizontalLine.add([
			(i * lengthOfShortHorizontalLine) / (numberOfDiagonalLines - 1),
			0
		]);
		const endOfDiagonalLine = startOfDiagonalLine.add([
			lengthUnitOfDiagonalLine,
			lengthUnitOfDiagonalLine
		]);
		const massDiagonalLine = new paper.Path.Line(startOfDiagonalLine, endOfDiagonalLine);
		mass.addChild(massDiagonalLine);
	}

	// Now we rotate the mass
	switch (direction) {
		case 'up':
			mass.rotate(-90, start);
			break;
		case 'down':
			mass.rotate(90, start);
			break;
		case 'left':
			mass.rotate(180, start);
			break;
		case 'right':
			break;
	}
	// paper.project.activeLayer.addChild(mass);
	return mass;
}

export function selectable(component: paper.Item) {
	return ['resistor', 'inductor', 'capacitor'].includes(component.data.type);
}

export function isDipole(component: paper.Item) {
	return ['resistor', 'inductor', 'capacitor'].includes(component.data.type);
}
