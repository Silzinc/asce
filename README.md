# Asce

###### ⚡ _simulates circuits in electronics_ ⚡

### What is it ?

Asce is a desktop application in development that aims at letting the user design and emulate various simple analogical circuits ⚡. The circuits are made of one ideal tension generator and of a tree of resistors, inductors and capacitors in serie or in parallel. This respository contains its frontend.

The tension generator can be configured by adding and modifying different harmonics, which all consist in a frequency (or rather a pulse), a phase and a voltage amplitude.

### The algorithm

The backend, also in development and located [here](https://github.com/Silzinc/circuits_simulator), will treat all components as complex impedances and compute currents, tensions and potentials at the initial time $(t = 0)$ using Kirchhoff's laws, and then infer the evolution these values. Each subcomponent (serial or parallel) has an equivalent complex impedance represented as a complex rational fraction of the pulse. The backend is ready to emulate circuits, but the frontend is not, as of now.

The backend also allows the user to choose a custom tension function, on which a Fourier transform will be performed to approximate its harmonics. This is not implemented in the frontend yet either.

### The stack

- Backend: Pure Rust 🦀, with very few external libraries. Only the standard libraries, [`rustfft`](https://github.com/ejmahler/RustFFT), [`num`](https://github.com/rust-num/num) and [`serde`](https://github.com/serde-rs/serde) are used (`serde` being only useful to interact with the frontend). Two homemade crates are also in use, [`polyx`](https://github.com/Silzinc/polyx) and [`fractios`](https://github.com/Silzinc/fractios), which respectively manipulate polynomials and rational fractions.
- Frontend:
  - [Tauri](https://tauri.app) for an efficient interaction between a ⭐ web component based frontend and a 🔥 performant Rust backend.
  - [Svelte](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) for a simple yet powerful frontend framework.
  - [SkeletonUI](https://www.skeleton.dev/) with the awesome 🚀 Rocket 🚀 theme.
  - [Paper.js](http://paperjs.org/) for drawing and handling easily a circuit on a canvas.

### Development

Any help is appreciated, as I am not comfortable with building a frontend. Steps to compile and run the development version:

```sh
git clone https://github.com/Silzinc/asce
cd asce
pnpm install node@21.7.1
# or npm install node@21.7.1
cargo tauri dev
```

This is a Tauri app, so the first compilation will be long and heavy.

### Screenshots

![Titlescreen with dark theme](static/screenshots/titlescreen.png 'Titlescreen with dark theme')
![Generator building with light theme](static/screenshots/batterybuilding.png 'Generator building with light theme')
![Circuit building with light theme](static/screenshots/circuitbuilding.png 'Circuit building with light theme')
![Emulation page with dark theme](static/screenshots/emulation.png 'Emulation page with dark theme')

### What is left to do ?

- Emulation
  - Fully implement the emulation for a selected dipole in the frontend, including a plot of the result.
  - Enable the selection of grouped components for the emulation.
  - Enable the selection of 2 nodes to measure their potential difference.
  - Allow the user to choose the time interval and the time step in addition to the duration and the number of points.
- Circuit building
  - Allow to change and remove components.
  - Enable rescaled units and use range sliders for choosing resistance, inductance and capacity (in the same way as harmonics parameters are configured).
  - Allow to save and load a circuit in a JSON format.
- Generator building
  - Enable tension function configuration
  - Allow to save and load the generator in a JSON format, probably with the rest of the circuit.
  - Enable resizing of the harmonics table, in case there are many of them (if tension function is implemented).
