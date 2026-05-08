# Prompt: Implement OS Simulation Lab in AetherOS

## Context
You are an advanced AI coding assistant working on `AetherOS`, a high-fidelity web-based Operating System simulation built with React, Vite, and Tailwind CSS. The project features a window manager, a virtual file system, and various built-in apps.

## Goal
Implement a new application called "OS Simulation Lab" (ID: `os-lab`) that features interactive simulations for **CPU Scheduling** and **Disk Scheduling** as discussed in the course modules (CMSC-314).

## References to Modules
- **Module 1 & 2**: Process Management concepts, states (New, Ready, Running, Waiting, Terminated), and basic scheduling mentions.
- **Module 3**: Specific algorithms for CPU Scheduling (FCFS, SJF, RR, Priority) and Device/Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN).

## Technical Requirements

### 1. App Registration
- Add the app to `client/src/config/appManifest.ts`:
  ```typescript
  {
      id: 'os-lab',
      title: 'OS Simulation Lab',
      defaultBounds: { x: 150, y: 100, width: 900, height: 600 },
  }
  ```
- Register the component in `client/src/config/windows.ts` using `createRecoverableLazyWindow`.

### 2. Features to Implement

#### Tab 1: CPU Scheduling Simulator
Implement the following algorithms:
- **FCFS** (First-Come, First-Served)
- **SJF** (Shortest Job First) - non-preemptive and SRTF (Shortest Remaining Time First).
- **Round Robin** (with configurable time quantum).
- **Priority Scheduling** (preemptive and non-preemptive).

**UI Requirements:**
- Input form to add processes (PID, Arrival Time, Burst Time, Priority).
- A Gantt chart visualization showing the timeline of process execution.
- Display metrics: Turnaround Time, Waiting Time (per process and averages).
- (Advanced) Visualize process state transitions if feasible.

#### Tab 2: Disk Scheduling Simulator
Implement the following algorithms:
- **FCFS** (First-Come, First-Served)
- **SSTF** (Shortest Seek Time First)
- **SCAN** (Elevator Algorithm)
- **C-SCAN** (Circular SCAN)

**UI Requirements:**
- Input for initial head position and request queue (e.g., `98, 183, 37, 122, 14, 124, 65, 67`).
- A line chart or graph showing the movement of the disk head across cylinders.
- Calculation and display of Total Seek Time (total cylinder movement).

#### Tab 3 (Optional): Deadlocks
- A simple simulation of the **Banker's Algorithm** for deadlock avoidance.

### 3. Design & Aesthetics
- The UI must feel premium and match the AetherOS aesthetic.
- Use existing design system classes: `os-panel`, `os-button`, `os-input`, `os-interactive`.
- Use the CSS variables defined in `index.css` (e.g., `var(--os-text-0)`, `var(--os-accent)`).
- Ensure smooth micro-animations and clear visual hierarchy.

## Implementation Plan
1. Create the directory `client/src/apps/os-lab/`.
2. Create `OSLabApp.tsx` as the main entry point with tabs for CPU and Disk simulations.
3. Implement the logic and UI for each simulator.
4. Register the app in `appManifest.ts` and `windows.ts`.
5. Verify the app opens and functions correctly in the desktop environment.
