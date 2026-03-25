# Final Project Progress Guide and Checklist

Based on the professor's instructions in `client/final_project_instructions.txt`

This file is a working checklist for your project. Each section includes:
- what the professor expects
- how it should be applied in your simulator
- what you should be able to show during checking, demo, or presentation

Use this file as your progress tracker while building the project.

## Workflow Support

- [x] Create a local `prompts/` workspace for reusable implementation prompts
Description: A dedicated ignored prompt workspace now exists for guiding future client-side work while keeping the repository clean.

- [x] Keep `prompts/` in `.gitignore`
Description: Prompt files are intentionally local-only so they can be used as working instructions without being forced into version control.

- [x] Prepare modular prompt templates for the main project areas
Description: Prompt templates now exist for foundation/shell, process management, scheduling and memory, file system and I/O, polish/testing, and a master workflow prompt.

- [x] Ensure prompts enforce client-only scope
Description: The prompt set explicitly avoids database and backend work and keeps the implementation focused on the client side of the simulator.

- [x] Ensure prompts preserve the current AetherOS UI/UX direction
Description: Each prompt tells the implementer to use the current AetherOS visual and interaction system as the baseline, with only careful improvements.

- [x] Ensure prompts require modular and performant implementation
Description: Each prompt explicitly asks for clean modular structure and simple time complexity suitable for fast client behavior.

- [x] Ensure prompts require `progress.md` updates after every run
Description: Each prompt now includes a required output section telling the implementer to update the progress checklist every time work is completed.

- [x] Ensure prompts always suggest copy-paste-ready commit messages
Description: Every prompt ends with commit message ideas ready to use for GitHub commits.

## Project Goal

The project is to create a **simple operating system simulator** using a **command-line program**. The simulator does not need to behave like a real full operating system, but it must clearly demonstrate the core concepts your professor listed:
- process management
- CPU scheduling
- memory management
- file system simulation
- simple I/O simulation

The most important standard for this project is not complexity. It is clarity. Your project should make each OS concept visible in the program output.

## General Project Direction

- [ ] Build the project as a **simulation**, not a real operating system
Description: Your program should imitate OS behavior using program logic, menus, queues, tables, and printed output. It should not attempt real low-level system operations.

- [ ] Keep the program **command-line based**
Description: The professor explicitly asked for a command-line program. Even if this repo already has a frontend structure, your final project output should still clearly support a terminal or console-based simulation flow.

- [ ] Use only one allowed language
Description: Choose one of the allowed languages from the instructions: `Python`, `C/C++`, or `Java`. Your final implementation should stay consistent in one language only.

- [ ] Make the output easy to understand
Description: Every major feature should print readable labels, tables, queue displays, or memory maps so your professor can directly see the concept being demonstrated.

- [ ] Add comments in the source code
Description: The deliverables require source code with comments. Add comments where logic is important, especially in scheduling, memory allocation, file simulation, and I/O queue handling.

## 1. Process Management

### What the professor expects
You must create at least 3 simulated processes and show the process states:
- `Ready`
- `Running`
- `Waiting`
- `Terminated`

### How this should be applied in your project

- [ ] Create at least 3 simulated processes
Description: Define at least three sample processes such as `P1`, `P2`, `P3` with values like burst time, memory size, arrival order, or status. These can be hardcoded at first if needed.

- [ ] Give each process a clear process record
Description: Each process should have enough fields to make the simulation meaningful. A simple structure may include process ID, state, burst time, remaining time, memory allocation, and whether it is waiting for I/O.

- [ ] Display process states in the console
Description: The program should print a process table or status list showing the current state of every process.

- [ ] Show the `Ready` state
Description: At least one process should appear in the ready queue before CPU execution begins, or after another process gets the CPU.

- [ ] Show the `Running` state
Description: When the scheduler picks a process, the output should show that the process is currently running.

- [ ] Show the `Waiting` state
Description: A process should enter waiting when it requests I/O or is paused for a simulated event. This is important because the professor explicitly listed it as a required state.

- [ ] Show the `Terminated` state
Description: After a process finishes execution, the output should mark it as terminated.

- [ ] Present process states in a clean table or organized list
Description: A simple printed table is enough. The goal is to make process transitions easy to follow during the demo.

### What you should be able to show

- [ ] A console screen where all processes and their current states are visible
- [ ] A simulation flow where a process changes from `Ready` to `Running`
- [ ] A simulation flow where a process changes to `Waiting`
- [ ] A simulation flow where completed processes become `Terminated`

## 2. CPU Scheduling

### What the professor expects
You must implement one CPU scheduling algorithm:
- `FCFS` (First-Come, First-Served), or
- `Round Robin`

You must also show:
- execution order
- waiting time
- a simple text-based Gantt chart

### How this should be applied in your project

- [ ] Choose one scheduling algorithm
Description: Select either `FCFS` or `Round Robin`. If you want the easier path, `FCFS` is simpler to implement and explain. If you want a more dynamic simulation, `Round Robin` gives better state transitions.

- [ ] Implement the selected scheduling logic
Description: The program should decide which process gets CPU time based on the chosen algorithm, not manually by the user.

- [ ] Show execution order
Description: The output should list the order in which processes ran, for example: `P1 -> P2 -> P3`. If using Round Robin, the same process may appear multiple times.

- [ ] Compute and display waiting time
Description: Each process should show how long it waited before or between execution. Even a simple integer calculation is enough as long as it is correct for your simulation model.

- [ ] Display a text-based Gantt chart
Description: Print a simple chart such as `| P1 | P2 | P3 |` or, for Round Robin, `| P1 | P2 | P1 | P3 |`. This is specifically requested in the instructions.

- [ ] Connect scheduling output with process states
Description: When a process gets CPU time, its state should become `Running`. When it is done, it should become `Terminated`. If it pauses for I/O, it should become `Waiting`.

### What you should be able to show

- [ ] The chosen scheduling algorithm clearly named in the program output
- [ ] The order of execution printed after or during simulation
- [ ] Waiting times shown for each process
- [ ] A visible text-based Gantt chart in the console

## 3. Memory Management

### What the professor expects
You must simulate:
- fixed memory partitions
- allocation and deallocation of memory to processes
- memory usage display

### How this should be applied in your project

- [ ] Define fixed memory partitions
Description: Divide total memory into fixed blocks or partitions such as `Partition 1 = 128MB`, `Partition 2 = 256MB`, and so on. The sizes can be arbitrary as long as they are clearly defined.

- [ ] Give processes memory requirements
Description: Each process should request a certain amount of memory so the allocation step has a visible reason.

- [ ] Allocate memory to processes
Description: When a process starts or is admitted, assign it to a partition if enough space exists according to your simulation rules.

- [ ] Handle failed allocation if needed
Description: If memory is not available, you can keep the process waiting or show that it cannot be loaded yet. This makes the simulation more realistic and easier to explain.

- [ ] Deallocate memory after process completion
Description: When a process terminates, the partition it was using should be freed and shown as available again.

- [ ] Show memory usage in the console
Description: Print which partitions are occupied and which are free.

- [ ] Display a simple memory map
Description: The memory map can be a labeled list or block-style display, for example:
`[Partition 1: P1] [Partition 2: Free] [Partition 3: P3]`

### What you should be able to show

- [ ] Initial memory layout before allocation
- [ ] Memory changing as processes are loaded
- [ ] Memory being freed after process completion
- [ ] A readable memory map during the simulation

## 4. File System Simulation

### What the professor expects
You must simulate a simple file system with basic operations:
- create file
- delete file
- display file contents

The instructions also say: **No actual disk access required.**

### How this should be applied in your project

- [ ] Create a simple internal file list
Description: Store files in memory using a list, array, map, or object structure. Each file can have a name and contents.

- [ ] Implement file creation
Description: The user should be able to create a simulated file by entering a file name and contents, or by using predefined examples.

- [ ] Implement file deletion
Description: The program should remove a selected file from the simulated file list.

- [ ] Implement file content display
Description: The user should be able to view the contents of a selected simulated file.

- [ ] Keep the file system simulated only
Description: Do not depend on real file creation on the computer as the project feature. The file system should work as part of the simulator logic itself.

- [ ] Show current file list
Description: Print the list of available files after creation or deletion so the professor can immediately see the result of the operation.

### What you should be able to show

- [ ] A file being created in the simulator
- [ ] The list of files updating after creation
- [ ] A file's contents being displayed
- [ ] A file being deleted and removed from the list

## 5. Simple I/O Simulation

### What the professor expects
You must simulate one I/O device, such as a printer, and queue I/O requests using basic spooling.

### How this should be applied in your project

- [ ] Choose one I/O device to simulate
Description: The simplest choice is a printer. It is easy to explain and works well with a queue model.

- [ ] Create an I/O request queue
Description: Processes should be able to submit requests to the device queue.

- [ ] Implement basic spooling behavior
Description: Requests should wait in line and be handled one by one. This queue is the core idea your professor wants to see.

- [ ] Connect I/O requests to process states
Description: When a process sends a request to the I/O device, it should move to `Waiting` until the request is processed or completed.

- [ ] Show queue contents in the console
Description: Print the pending requests in order so the queue behavior is visible.

- [ ] Show device servicing a request
Description: The output should make it clear when the printer or chosen device is handling a queued request.

### What you should be able to show

- [ ] A process submitting an I/O request
- [ ] The request entering the queue
- [ ] The queue being processed in order
- [ ] The related process returning from waiting or continuing after I/O

## Suggested Program Flow

This is not directly required by the professor, but it is a practical checklist for making your project presentation smooth.

- [ ] Start with predefined sample processes
Description: This makes demo behavior consistent and avoids wasting presentation time on setup.

- [ ] Show the process table first
Description: Begin by introducing the processes and their starting states.

- [ ] Run CPU scheduling
Description: Let the simulator show which process gets the CPU and how waiting time is calculated.

- [ ] Show memory allocation during or before execution
Description: Display where each process is loaded in memory.

- [ ] Trigger one or more file operations
Description: Demonstrate file creation, file viewing, and deletion clearly.

- [ ] Trigger at least one I/O request
Description: Show a process using the printer or selected device and entering the waiting state.

- [ ] End with final system state
Description: The final output should show terminated processes, updated memory, current file list, and I/O queue status.

## Source Code Deliverable

### What the professor expects
You must submit source code with comments.

### Checklist

- [ ] Organize source code clearly
Description: Keep files and functions readable so it is easy for your professor to follow the logic.

- [ ] Add comments to important logic
Description: Add comments especially where scheduling, memory allocation, file operations, and queue processing happen.

- [ ] Make sure the code runs without unnecessary setup complexity
Description: The project should be easy to execute for checking or presentation.

- [ ] Review for consistency
Description: Process names, state labels, and output formatting should match throughout the program.

## Report Deliverable

### What the professor expects
A short report of **5 to 10 pages** including:
- program description
- explanation of OS concepts used
- sample output screenshots

### Checklist

- [ ] Write the introduction and project purpose
Description: Explain that the project is a simple operating system simulator designed to demonstrate major OS concepts.

- [ ] Write the program description
Description: Describe what the simulator does, what modules it has, and how a user interacts with it.

- [ ] Explain process management in the report
Description: Describe how your simulator creates processes and shows their states.

- [ ] Explain CPU scheduling in the report
Description: Describe the scheduling algorithm you chose and why it works in your simulator.

- [ ] Explain memory management in the report
Description: Describe the fixed partition model and how allocation/deallocation works.

- [ ] Explain file system simulation in the report
Description: Describe how files are represented in memory and what operations are supported.

- [ ] Explain I/O simulation in the report
Description: Describe the device queue and how spooling is simulated.

- [ ] Add sample output screenshots
Description: Include screenshots of the process table, Gantt chart, memory map, file system actions, and I/O queue.

- [ ] Keep the report within 5 to 10 pages
Description: Stay inside the required length. Keep explanations direct and academic.

## Live Presentation Deliverable

### What the professor expects
You must present the project live.

### Checklist

- [ ] Prepare a short demonstration flow
Description: Decide exactly what you will show first, second, and last so the presentation is smooth.

- [ ] Be ready to explain each OS concept
Description: You should be able to explain how your project demonstrates process management, scheduling, memory, files, and I/O.

- [ ] Show the simulator running live
Description: The presentation should include the actual working program, not just slides.

- [ ] Prepare backup screenshots
Description: If the live demo has a problem, screenshots in the report can support your explanation.

- [ ] Practice explaining the scheduling and memory outputs
Description: These parts often get follow-up questions because they are the most technical.

## Final Proof of Completion

Use this final section before submission.

- [ ] The simulator includes all 5 required feature areas
- [ ] At least 3 processes are simulated
- [ ] All 4 process states are visible: `Ready`, `Running`, `Waiting`, `Terminated`
- [ ] One valid CPU scheduling algorithm is implemented
- [ ] Execution order, waiting time, and Gantt chart are shown
- [ ] Fixed memory partitions are implemented
- [ ] Memory allocation and deallocation are shown
- [ ] File create, delete, and display operations work
- [ ] One I/O device with queued requests is shown
- [ ] Source code is ready and commented
- [ ] Report is complete and within 5-10 pages
- [ ] Presentation flow is prepared

## Suggested Completion Status Markers

You can update the boxes as you work:
- `[ ]` not started
- `[x]` completed

If you want, you can also add short notes under any completed item such as:
- date completed
- file or module where it was implemented
- remaining issues to fix
