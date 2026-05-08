# OS Simulation Lab Script

## Purpose

This document is a complete walkthrough script for the `OS Simulation Lab` app inside AetherOS. It covers:

- what the app does
- how to open and use it
- what each CPU scheduling feature means
- what each disk scheduling feature means
- sample inputs
- step-by-step demos for every supported algorithm
- suggested explanation lines during a live presentation

The current Simulation Lab contains two main features:

1. `CPU Scheduling`
2. `Disk Scheduling`

## Quick Opening Script

Use this if you need a short introduction before the detailed demo.

`This app demonstrates how an operating system schedules CPU processes and disk requests. In the CPU tab, we compare algorithms by looking at execution order, waiting time, and turnaround time. In the Disk tab, we compare how the disk head moves across cylinder requests and how much total movement each algorithm requires.`

## How To Open The App

1. Start AetherOS.
2. Open the launcher or command palette.
3. Search for `OS Simulation Lab` or `os-lab`.
4. Open the app.

## App Layout Overview

When the app opens, it has two tabs:

1. `CPU Scheduling`
2. `Disk Scheduling`

### CPU Scheduling Tab Controls

- `Algorithm`: selects the CPU scheduling method
- `Time quantum`: appears for Round Robin
- `Load preset`: loads a prepared sample set of processes
- `Add process`: lets you add a process using PID, arrival time, burst time, and priority
- `Remove`: removes an existing process

### CPU Scheduling Outputs

- `Average Waiting`
- `Average Turnaround`
- `Scheduler Readout`
- `Gantt chart`
- `Per-process Metrics table`

### Disk Scheduling Tab Controls

- `Algorithm`: selects the disk scheduling method
- `Initial head`: starting head position
- `Max cylinder`: upper cylinder limit
- `Sweep direction`: left or right
- `Request queue`: comma-separated list of requests
- `Load preset`: loads a prepared sample queue

### Disk Scheduling Outputs

- `Total Seek`
- `Requests Served`
- `Traversal Readout`
- `Head movement path` graph
- `Service Order`
- `Queue Snapshot`

## Core Concepts To Explain First

Use this section before the live demo if you want the audience to understand the metrics.

### CPU Scheduling Concepts

- `Arrival Time`: when the process enters the ready queue
- `Burst Time`: how long the process needs the CPU
- `Priority`: importance level of the process, where lower number means higher priority in this simulator
- `Completion Time`: the time when the process finishes
- `Turnaround Time`: `Completion Time - Arrival Time`
- `Waiting Time`: `Turnaround Time - Burst Time`

### Disk Scheduling Concepts

- `Initial head`: where the read/write head starts
- `Cylinder request`: a requested disk position
- `Seek distance`: the number of cylinders the head moves
- `Total seek distance`: total movement across the full request sequence

## CPU Scheduling Demo Dataset

Use this same dataset across all CPU scheduling algorithms so the comparison is clear.

| PID | Arrival Time | Burst Time | Priority |
|---|---:|---:|---:|
| P1 | 0 | 7 | 2 |
| P2 | 2 | 4 | 1 |
| P3 | 4 | 1 | 3 |
| P4 | 5 | 4 | 2 |

### How To Enter The CPU Demo Dataset

Option 1:

1. Open `CPU Scheduling`.
2. Click `Load preset`.

Option 2:

1. Add `P1` with arrival `0`, burst `7`, priority `2`.
2. Add `P2` with arrival `2`, burst `4`, priority `1`.
3. Add `P3` with arrival `4`, burst `1`, priority `3`.
4. Add `P4` with arrival `5`, burst `4`, priority `2`.

## CPU Scheduling Feature-by-Feature Script

## 1. FCFS

### What It Means

`FCFS` stands for `First-Come, First-Served`.

The CPU always runs the earliest arriving process first. Once a process starts, it keeps the CPU until it finishes.

### How It Works In The Simulation

1. The simulator sorts processes by arrival time.
2. The first available process starts running.
3. No interruption happens while it is running.
4. When it finishes, the next arrived process runs.
5. The Gantt chart is created from that order.
6. Waiting time and turnaround time are computed from the finish times.

### Demo Steps

1. Load the CPU preset.
2. Select `FCFS` from `Algorithm`.
3. Pause and point to the Gantt chart.
4. Show that `P1` runs first because it arrives at time `0`.
5. Explain that `P2`, `P3`, and `P4` must wait until `P1` finishes.

### Expected Execution Order

`P1 -> P2 -> P3 -> P4`

### Presenter Script

`This is First-Come, First-Served. The CPU simply follows arrival order. P1 arrives first, so it runs completely before the others. This makes FCFS simple, but it can be inefficient because short jobs may wait behind long jobs.`

### Key Teaching Point

FCFS is easy to implement, but it can produce high waiting time when a long process arrives before shorter ones.

## 2. SJF

### What It Means

`SJF` stands for `Shortest Job First`.

Among the processes that have already arrived, the CPU selects the one with the smallest burst time.

In this app, SJF is non-preemptive.

### How It Works In The Simulation

1. The simulator checks which processes are available at the current time.
2. It compares their burst times.
3. It selects the shortest available burst.
4. Once selected, the process runs until completion.
5. Then the simulator repeats the selection for the remaining ready processes.

### Demo Steps

1. Keep the same CPU preset loaded.
2. Change `Algorithm` to `SJF`.
3. Compare the new Gantt chart to FCFS.
4. Point out that once `P1` finishes, the simulator prefers `P3` because it has the shortest burst time.

### Expected Execution Order

`P1 -> P3 -> P2 -> P4`

### Presenter Script

`This is Shortest Job First. The scheduler looks at all processes that are ready and picks the one with the smallest CPU burst. After P1 finishes, P3 is the shortest job, so it is chosen before P2 and P4. This often improves average waiting time, but it may delay long jobs.`

### Key Teaching Point

SJF usually improves efficiency, especially average waiting time, but it can be unfair to longer processes.

## 3. SRTF

### What It Means

`SRTF` stands for `Shortest Remaining Time First`.

It is the preemptive version of SJF. If a shorter remaining job arrives, it can interrupt the currently running process.

### How It Works In The Simulation

1. The simulator checks available processes at each time unit.
2. It selects the process with the shortest remaining time.
3. If a newly arrived process has a smaller remaining time than the running one, the CPU switches.
4. The Gantt chart shows each interruption as a new segment.

### Demo Steps

1. Keep the same preset loaded.
2. Change `Algorithm` to `SRTF`.
3. Point out that `P1` starts first at time `0`.
4. At time `2`, `P2` has arrived and its burst is shorter than P1's remaining time, so P1 is interrupted.
5. At time `4`, `P3` arrives with burst `1`, which is the smallest remaining time, so it runs next.

### Expected Execution Pattern

`P1` begins, then `P2` interrupts it, then `P3`, then the scheduler finishes the remaining shorter job before returning to longer work.

### Presenter Script

`This is Shortest Remaining Time First. It behaves like SJF, but now the scheduler can interrupt the current process if a shorter one arrives. That makes the system more responsive for short jobs, which is why we see more segments in the Gantt chart.`

### Key Teaching Point

Preemption improves responsiveness for short processes, but it also creates a more fragmented timeline.

## 4. Round Robin

### What It Means

`Round Robin` gives each ready process a fixed time slice called the `time quantum`.

If the process does not finish within that quantum, it goes to the back of the ready queue.

### How It Works In The Simulation

1. The simulator keeps a ready queue.
2. The process at the front gets CPU time equal to the quantum.
3. If it finishes, it leaves the system.
4. If not, it is placed at the back of the queue.
5. Newly arrived processes are inserted as they appear.
6. The Gantt chart shows the time slices rotating among processes.

### Demo Steps

1. Keep the same preset loaded.
2. Select `Round Robin`.
3. Set `Time quantum` to `2`.
4. Explain that each process gets at most `2` time units before the CPU rotates.
5. Point to the Gantt chart and show the repeated switching between processes.
6. Change the quantum from `2` to `4` and observe how the schedule becomes less fragmented.

### Presenter Script

`Round Robin is designed for fairness. Instead of letting one process keep the CPU until completion, it gives each process a short time slice. With a smaller quantum, the CPU switches more often. With a larger quantum, Round Robin starts to resemble FCFS.`

### Key Teaching Point

Round Robin improves fairness and responsiveness, especially in interactive systems, but very small quanta cause more switching.

### Extra Demo Variation

Use these two checks:

1. Set quantum to `1` and observe many short Gantt segments.
2. Set quantum to `6` and explain that long uninterrupted runs begin to appear.

## 5. Priority Scheduling

### What It Means

Priority scheduling chooses the highest-priority process first.

In this app, a lower number means higher priority.

Example:

- priority `1` is higher than priority `2`
- priority `2` is higher than priority `3`

### How It Works In The Simulation

1. The simulator checks which processes are ready.
2. It compares their priority values.
3. The smallest priority number wins.
4. In non-preemptive mode, the chosen process runs until completion.

### Demo Steps

1. Keep the same preset loaded.
2. Select `Priority`.
3. Highlight that `P2` has priority `1`, the highest priority in the sample.
4. Explain that once `P2` is ready, it becomes the preferred next process.
5. Show how that changes the order compared with FCFS and SJF.

### Presenter Script

`This is non-preemptive priority scheduling. The scheduler favors more important tasks, and here that means smaller priority numbers are chosen first. P2 has the highest priority in the sample, so it gets preferred once it is available.`

### Key Teaching Point

Priority scheduling is useful for urgent work, but low-priority processes may wait longer.

## 6. Priority Scheduling (Preemptive)

### What It Means

This is the preemptive version of priority scheduling.

If a higher-priority process arrives while another process is running, the CPU switches immediately.

### How It Works In The Simulation

1. The simulator checks the ready set at each time unit.
2. It picks the process with the best priority.
3. If a higher-priority process arrives, the current one is interrupted.
4. The Gantt chart shows the interruption as separate segments.

### Demo Steps

1. Keep the preset loaded.
2. Select `Priority (Preemptive)`.
3. Point out that `P1` begins at time `0`.
4. When `P2` arrives at time `2` with higher priority, it can interrupt `P1`.
5. Compare the new Gantt chart with the non-preemptive priority result.

### Presenter Script

`Now priority scheduling becomes preemptive. A running process can be interrupted if a higher-priority process arrives. This is useful when urgent tasks must be handled immediately, but it can make low-priority tasks wait even longer.`

### Key Teaching Point

Preemptive priority scheduling improves responsiveness for urgent work, but it increases the risk of starvation for lower-priority processes.

## CPU Demo Wrap-Up Script

`Using the same process set, we can see that each algorithm makes a different tradeoff. FCFS is simple, SJF and SRTF reduce waiting time for short jobs, Round Robin improves fairness, and Priority scheduling favors more important work.`

## Disk Scheduling Demo Dataset

Use this same dataset across all disk algorithms.

- `Initial head`: `53`
- `Max cylinder`: `199`
- `Direction`: `right`
- `Request queue`: `98, 183, 37, 122, 14, 124, 65, 67`

### How To Enter The Disk Demo Dataset

1. Open `Disk Scheduling`.
2. Click `Load preset`.

Or enter manually:

1. Set `Initial head` to `53`.
2. Set `Max cylinder` to `199`.
3. Set `Sweep direction` to `Toward max cylinder`.
4. Enter `98, 183, 37, 122, 14, 124, 65, 67` in `Request queue`.

## Disk Scheduling Feature-by-Feature Script

## 1. FCFS

### What It Means

For disk scheduling, `FCFS` services requests in the exact order they appear in the queue.

### How It Works In The Simulation

1. The head begins at the initial position.
2. The simulator reads the queue from left to right.
3. It moves the head to each request in that same order.
4. It adds all movement distances to get the total seek distance.

### Demo Steps

1. Load the disk preset.
2. Select `FCFS`.
3. Point to the graph.
4. Explain that the head moves exactly in queue order.
5. Show the `Service Order` and compare it to the typed request queue.

### Expected Service Order

`53 -> 98 -> 183 -> 37 -> 122 -> 14 -> 124 -> 65 -> 67`

### Presenter Script

`This is FCFS for disk scheduling. The head simply visits requests in the order they arrive. That makes it easy to implement, but it can cause a lot of unnecessary back-and-forth movement.`

### Key Teaching Point

Disk FCFS is simple, but often inefficient because the head may travel long distances between consecutive requests.

## 2. SSTF

### What It Means

`SSTF` stands for `Shortest Seek Time First`.

The disk head always services the closest pending request next.

### How It Works In The Simulation

1. The head starts at the initial position.
2. The simulator compares distances to all pending requests.
3. It selects the nearest cylinder.
4. That request is removed from the queue.
5. The process repeats from the new head position.

### Demo Steps

1. Keep the same disk preset.
2. Change `Algorithm` to `SSTF`.
3. Point out that from head position `53`, the closest requests are `65` and `67`, not `183`.
4. Show how the graph becomes more locally efficient.
5. Compare the `Total Seek` value with FCFS.

### Expected Early Service Pattern

The head will move first to nearby requests such as `65` and `67` before jumping farther away.

### Presenter Script

`SSTF chooses the nearest pending request each time. Because it reduces the next seek distance, it usually lowers the total head movement. However, distant requests can end up waiting longer if closer requests keep appearing.`

### Key Teaching Point

SSTF improves efficiency, but it may be unfair to far-away requests.

## 3. SCAN

### What It Means

`SCAN` is also called the `elevator algorithm`.

The head moves in one direction, services all requests along the way, reaches the boundary, then reverses direction.

### How It Works In The Simulation

1. The head starts at the initial position.
2. It moves according to the selected direction.
3. Requests in that path are serviced in order.
4. After reaching the end boundary, the head reverses.
5. It then services requests on the opposite side.

### Demo Steps

1. Keep the same disk preset.
2. Select `SCAN`.
3. Keep `Sweep direction` as `Toward max cylinder`.
4. Explain that the head services requests to the right first.
5. Point out that the graph continues to the max boundary before reversing.

### Presenter Script

`SCAN moves like an elevator. It goes in one direction first, servicing requests in order, then reverses after reaching the boundary. This creates a more orderly access pattern than FCFS and helps avoid constant back-and-forth motion.`

### Key Teaching Point

SCAN balances efficiency and fairness better than FCFS because the head movement is structured.

### Extra Demo Variation

1. Change `Sweep direction` to `Toward cylinder 0`.
2. Explain that the same algorithm is used, but the sweep starts in the opposite direction.

## 4. C-SCAN

### What It Means

`C-SCAN` stands for `Circular SCAN`.

The head services requests in one direction only. After reaching the boundary, it jumps back to the start and continues in the same direction.

### How It Works In The Simulation

1. The head sweeps in the selected direction.
2. Requests in that direction are serviced in order.
3. Once the head reaches the boundary, it wraps to the far end.
4. It then resumes the sweep in the same direction.

### Demo Steps

1. Keep the same preset.
2. Select `C-SCAN`.
3. Keep `Sweep direction` as `Toward max cylinder`.
4. Point to the graph and explain that after reaching the top boundary, the head wraps back instead of reversing normally.
5. Compare the graph shape with SCAN.

### Presenter Script

`C-SCAN is similar to SCAN, but instead of reversing direction immediately, it wraps back and continues the same directional sweep. This gives more uniform waiting behavior because requests are serviced in a consistent circular pattern.`

### Key Teaching Point

C-SCAN improves uniformity in service direction, especially when fairness across cylinder ranges matters.

## Disk Demo Wrap-Up Script

`Using the same queue, we can see that FCFS follows arrival order, SSTF reduces local movement, SCAN sweeps like an elevator, and C-SCAN wraps around to keep a one-direction service pattern. The graph and total seek distance help visualize those tradeoffs immediately.`

## Full Walkthrough Order For A Live Presentation

If you want a clean classroom flow, use this order.

1. Open `OS Simulation Lab`.
2. Say the quick opening script.
3. Go to `CPU Scheduling`.
4. Load the CPU preset.
5. Demo `FCFS`.
6. Demo `SJF`.
7. Demo `SRTF`.
8. Demo `Round Robin` with quantum `2`.
9. Change Round Robin quantum to `4`.
10. Demo `Priority`.
11. Demo `Priority (Preemptive)`.
12. Summarize CPU tradeoffs.
13. Go to `Disk Scheduling`.
14. Load the disk preset.
15. Demo `FCFS`.
16. Demo `SSTF`.
17. Demo `SCAN` with direction `right`.
18. Change SCAN direction to `left`.
19. Demo `C-SCAN`.
20. Summarize disk tradeoffs.
21. Close with the overall conclusion.

## Suggested Closing Script

`The Simulation Lab shows that scheduling is about tradeoffs. For CPU scheduling, the system must balance simplicity, fairness, and responsiveness. For disk scheduling, it must balance queue order against minimizing head movement. By keeping the inputs the same and changing only the algorithm, we can clearly see how each operating system strategy affects performance.`

## Short Q and A Prep

### Question: Why do some algorithms create more Gantt chart segments?

Answer:

`Because preemptive algorithms can interrupt the currently running process. Every interruption creates a new segment in the timeline.`

### Question: Why does Round Robin look more fragmented?

Answer:

`Because the CPU is rotating based on time quantum, so one process may appear many times in the chart instead of one continuous block.`

### Question: Why can SJF or SRTF be better than FCFS?

Answer:

`Because shorter jobs can finish earlier, which usually lowers the average waiting time and turnaround time.`

### Question: Why is SSTF not always ideal?

Answer:

`Because even though it reduces movement, requests that are far away may wait longer if nearby requests keep getting serviced first.`

### Question: Why use SCAN or C-SCAN instead of FCFS?

Answer:

`Because they organize head movement more efficiently and reduce unnecessary back-and-forth motion.`

## Final Presentation Summary

`OS Simulation Lab is an interactive visual tool for understanding operating system scheduling. The CPU tab shows how execution policies affect waiting and turnaround times. The Disk tab shows how access policies affect head movement and total seek distance. The app turns abstract scheduling theory into a step-by-step visual simulation.`
