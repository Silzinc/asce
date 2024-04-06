export interface Harmonic {
	index: number;
	pulse: number;
	voltage: number;
	phase: number;
}

export type UnitPrefix = 'µ' | 'm' | '' | 'k' | 'M' | 'G' | 'T';
export type UnitFactor = 1e-6 | 1e-3 | 1 | 1e3 | 1e6 | 1e9 | 1e12;

export const prefixToFactor: { [key in UnitPrefix]: UnitFactor } = {
	µ: 1e-6,
	m: 1e-3,
	'': 1,
	k: 1e3,
	M: 1e6,
	G: 1e9,
	T: 1e12
};

export const factorToPrefix: { [key in UnitFactor]: UnitPrefix } = {
	1e-6: 'µ',
	1e-3: 'm',
	1: '',
	1e3: 'k',
	1e6: 'M',
	1e9: 'G',
	1e12: 'T'
};

const MAX_VOLTAGE_OR_PULSE =
	1000 * Object.values(prefixToFactor).reduce((a, b) => Math.max(a, b) as UnitFactor);
const MIN_NON_ZERO_VOLTAGE_OR_PULSE = Object.values(prefixToFactor).reduce(
	(a, b) => Math.min(a, b) as UnitFactor
);

export const voltageInRange = (v: number) =>
	v === 0 || (Math.abs(v) >= MIN_NON_ZERO_VOLTAGE_OR_PULSE && Math.abs(v) <= MAX_VOLTAGE_OR_PULSE);
export const pulseInRange = (w: number) => voltageInRange(w) && w >= 0;

interface DisplayUnits {
	pulseUnit: UnitPrefix;
	voltageUnit: UnitPrefix;
}

export function getHarmonicDisplayUnits({ pulse, voltage }: Harmonic): DisplayUnits {
	let pulseFactor = 1;
	if (pulse !== 0) {
		while (pulseFactor < pulse) pulseFactor *= 1000;
		while (pulseFactor > pulse) pulseFactor /= 1000;
	} else pulseFactor = 1e-6;

	let voltageFactor = 1;
	if (voltage !== 0) {
		while (voltageFactor < voltage) voltageFactor *= 1000;
		while (voltageFactor > voltage) voltageFactor /= 1000;
	} else voltageFactor = 1e-6;

	if (pulseFactor > 1e12) pulseFactor = 1e12;
	if (pulseFactor < 1e-6) pulseFactor = 1e-6;
	if (voltageFactor > 1e12) voltageFactor = 1e12;
	if (voltageFactor < 1e-6) voltageFactor = 1e-6;

	return {
		pulseUnit: factorToPrefix[pulseFactor as UnitFactor],
		voltageUnit: factorToPrefix[voltageFactor as UnitFactor]
	};
}
