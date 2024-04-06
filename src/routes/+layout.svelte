<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		AppRail,
		AppRailAnchor,
		LightSwitch,
		setModeCurrent,
		setModeUserPrefers,
		modeCurrent
	} from '@skeletonlabs/skeleton';
	import House from 'virtual:icons/fa6-solid/House';
	import Battery from 'virtual:icons/tabler/battery-automotive';
	import Curve from 'virtual:icons/mdi/chart-bell-curve-cumulative';
	import Circuit from 'virtual:icons/ph/circuitry';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	onMount(() => {
		const prefersLight = localStorage.getItem('prefersLight') === 'true';
		setModeCurrent(prefersLight);
		setModeUserPrefers(prefersLight);
	});
	$: localStorage.setItem('prefersLight', $modeCurrent.toString());
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="items-baseline">
					<strong class="inline-block text-xl uppercase">Asce</strong>
					<p class="inline-block align-bottom italic text-sm">Simulates Circuits in Electronics</p>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/Silzinc/asce"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<svelte:fragment slot="sidebarLeft">
		<AppRail class="w-24">
			<AppRailAnchor href="/">
				<House class="icon" />
				Home
			</AppRailAnchor>

			<AppRailAnchor href="/battery">
				<Battery class="icon" />
				Configure battery
			</AppRailAnchor>

			<AppRailAnchor href="/circuit">
				<Circuit class="icon" />
				Circuit
			</AppRailAnchor>
			<AppRailAnchor href="/simulation">
				<Curve class="icon" />
				Simulation
			</AppRailAnchor>

			<style lang="postcss">
				.icon {
					@apply w-8 h-8 m-auto mb-2;
				}
			</style>
		</AppRail>
	</svelte:fragment>
	<slot />
</AppShell>
