// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use circuits_simulator::{
  Circuit,
  Component,
  ComponentContent,
  Dipole::*,
};
use num::Complex;
use serde_json::to_string;
use tauri::{
  generate_context,
  Builder,
  State,
};

struct AppState
{
  circuit: Mutex<Circuit>,
}

/* ===================== SETTING UP A BASIC CIRCUIT ===================== */
/* This is a basic circuit with a 500 Ohm resistor and a 1µs pulse source */

#[inline]
fn basic_circuit() -> Circuit
{
  let mut circuit = Circuit::new();
  circuit
    .content_mut()
    .push_serie(Component::from(Resistor(500.)));
  circuit.add_pulse(1e6, 1f64.into());
  circuit
}

#[tauri::command]
fn reset_circuit(state: State<AppState>) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  *circuit = basic_circuit();
  Ok(())
}

/* ===================== MODIFYING THE SOURCE ===================== */

#[tauri::command]
fn add_pulse(state: State<AppState>, pulse: f64, voltage: f64, phase: f64) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  let voltage = Complex::new(voltage * phase.cos(), voltage * phase.sin());
  circuit.add_pulse(pulse, voltage);
  Ok(())
}

#[tauri::command]
fn update_voltage_and_phase(
  state: State<AppState>,
  index: usize,
  voltage: f64,
  phase: f64,
) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  let new_voltage = voltage * Complex::new(phase.cos(), phase.sin());
  circuit.set_voltage(index, new_voltage);
  Ok(())
}

#[tauri::command]
fn remove_pulse(state: State<AppState>, index: usize) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  circuit.remove_pulse(index);
  Ok(())
}

/* ===================== MODIFYING THE CIRCUIT CONTENT ===================== */

#[tauri::command]
fn add_serial_component(
  state: State<AppState>,
  id: &str,
  kind: &str,
  value: f64,
) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  let id = id.as_bytes();

  let component_to_push_on = if id.is_empty() {
    // If the component is alone, just replace it by a serie of 2 components
    circuit
      .get_comp_by_id_mut(id)
      .ok_or(format!("No component found at id {id:?}"))?
  } else {
    // Retrieve the parent to push on it if it's already serial
    let last_index = *id.last().unwrap();
    let parent = circuit
      .get_comp_by_id_mut(&id[..id.len() - 1])
      .ok_or(format!("No component found at id {id:?}"))?;
    match parent.content {
      ComponentContent::Series(_) => parent,
      ComponentContent::Parallel(ref mut components) => &mut components[last_index as usize],
      _ => return Err(format!("Unsupported parent component at id {id:?}")),
    }
  };

  let new_component = match kind {
    "resistor" => Component::from(Resistor(value)),
    "capacitor" => Component::from(Capacitor(value)),
    "inductor" => Component::from(Inductor(value)),
    _ => return Err(format!("Unsupported component type {kind:?}")),
  };
  component_to_push_on.push_serie(new_component);
  Ok(())
}

#[tauri::command]
fn add_parallel_component(
  state: State<AppState>,
  id: &str,
  kind: &str,
  value: f64,
) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  let id = id.as_bytes();

  let component_to_push_on = if id.is_empty() {
    circuit
      .get_comp_by_id_mut(id)
      .ok_or(format!("No component found at id {id:?}"))?
  } else {
    let last_index = *id.last().unwrap();
    let parent = circuit
      .get_comp_by_id_mut(&id[..id.len() - 1])
      .ok_or(format!("No component found at id {id:?}"))?;
    match parent.content {
      ComponentContent::Parallel(_) => parent,
      ComponentContent::Series(ref mut components) => &mut components[last_index as usize],
      _ => return Err(format!("Unsupported parent component at id {id:?}")),
    }
  };

  let new_component = match kind {
    "resistor" => Component::from(Resistor(value)),
    "capacitor" => Component::from(Capacitor(value)),
    "inductor" => Component::from(Inductor(value)),
    _ => return Err(format!("Unsupported component type {kind:?}")),
  };
  component_to_push_on.push_parallel(new_component);
  Ok(())
}

#[tauri::command]
fn update_dipole(state: State<AppState>, id: &str, value: f64) -> Result<(), String>
{
  let mut circuit = state.circuit.lock().map_err(|e| e.to_string())?;
  let id = id.as_bytes();

  let component = circuit
    .get_comp_by_id_mut(id)
    .ok_or(format!("No component found at id {id:?}"))?;
  match component.content {
    ComponentContent::Simple(ref mut dipole) => {
      match dipole {
        Resistor(ref mut resistance) => *resistance = value,
        Capacitor(ref mut capacity) => *capacity = value,
        Inductor(ref mut inductance) => *inductance = value,
        _ => return Err("Unsupported mutation for equivalent and poisoned dipoles".to_string()),
      }
      Ok(())
    },
    _ => Err(format!(
      "Tried to mutate a non dipole component at position {id:?}"
    )),
  }
}

/* ===================== RETRIEVING THE CIRCUIT ===================== */

#[tauri::command]
fn get_circuit_content(state: State<AppState>) -> Result<String, String>
{
  to_string(&state.circuit.lock().unwrap().content())
    .map_err(|e| format!("Failed to print the circuit as JSON:\n\t{e}"))
}

#[tauri::command]
fn get_generator(state: State<AppState>) -> Result<String, String>
{
  to_string(&state.circuit.lock().unwrap().generator())
    .map_err(|e| format!("Failed to print the generator as JSON:\n\t{e}"))
}

fn main()
{
  Builder::default()
    .manage(AppState {
      circuit: Mutex::new(basic_circuit()),
    })
    .invoke_handler(tauri::generate_handler![
      reset_circuit,
      add_pulse,
      update_voltage_and_phase,
      remove_pulse,
      add_serial_component,
      add_parallel_component,
      update_dipole,
      get_circuit_content,
      get_generator,
    ])
    .run(generate_context!())
    .expect("error while running tauri application");
}
