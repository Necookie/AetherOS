# AetherOS Brand Guide

Design language for maintaining a consistent **Mac-like elegance**, **Windows familiarity**, and **Linux efficiency** across the AetherOS interface.

---

# AetherOS Brand Identity

**AetherOS** represents a future operating system concept where aesthetics, speed, and developer power coexist.

The visual and interaction design should communicate:

* **Clarity** — nothing feels cluttered
* **Speed** — UI feels instant and responsive
* **Calmness** — smooth transitions and minimal distractions
* **Technical depth** — feels like a real system, not just a UI

The environment should feel like:

> macOS elegance + Windows usability + Linux performance

---

# Core Design Principles

## 1. Minimal but Functional

Interfaces should remain visually light while still exposing power.

Rules:

* Prefer **empty space over clutter**
* Show **only essential UI controls**
* Hide advanced features behind context menus or shortcuts
* Apps should feel **purpose-built**, not overloaded

---

## 2. Instant Responsiveness

The OS should feel extremely fast.

Guidelines:

* Window open animations < **120ms**
* Dragging windows must feel **1:1 with cursor**
* Avoid heavy blur or GPU-expensive effects
* UI should remain smooth even under simulated load

---

## 3. Calm Visual Environment

The desktop environment should be visually relaxing.

Avoid:

* harsh contrasts
* overly bright UI
* saturated colors

Prefer:

* neutral tones
* soft shadows
* subtle motion

---

# Visual Language

## Color Palette

Primary background:

```
#0f172a   — deep system background
#020617   — terminal / kernel dark
```

UI surfaces:

```
#111827   — window background
#1f2937   — secondary panels
#374151   — borders / separators
```

Text colors:

```
#f8fafc   — primary text
#94a3b8   — secondary text
```

Accent colors:

```
#6366f1   — system accent
#22c55e   — success
#f59e0b   — warning
#ef4444   — error
```

Rules:

* Accent color used **sparingly**
* No rainbow UI
* Neutral base palette

---

# Typography

Primary font stack:

```
Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif
```

Terminal font:

```
JetBrains Mono
```

Sizing scale:

```
Desktop labels   → 12px
UI text          → 14px
Panel titles     → 16px
App headers      → 18px
System headings  → 20px
```

Typography should feel:

* crisp
* readable
* modern

Avoid decorative fonts.

---

# Window Design

Windows are the core interaction model.

### Window Structure

```
+----------------------------+
| ●  ●  ●     App Title      |
|----------------------------|
|                            |
|        App Content         |
|                            |
+----------------------------+
```

Elements:

* traffic-light style window controls
* subtle border
* soft drop shadow
* rounded corners (8px)

Rules:

* Windows must feel **lightweight**
* No thick borders
* No heavy gradients

---

# Motion & Animation

Animations should communicate **state changes**, not decoration.

Recommended durations:

```
Window open      → 120ms
Window minimize  → 150ms
Hover states     → 80ms
Panel transitions → 160ms
```

Animation style:

* ease-out curves
* smooth acceleration
* minimal bounce

Never use:

* flashy transitions
* exaggerated motion

---

# Desktop Environment

The desktop should resemble a real OS shell.

Components:

* wallpaper
* desktop icons
* taskbar / dock
* window workspace
* system tray
* notifications

Rules:

* Icons arranged grid-style
* Taskbar minimal
* Clock + system indicators on right

The desktop must **never feel like a webpage**.

It should feel like:

> a real operating system running inside the browser.

---

# Iconography

Icons should follow a **flat + slightly rounded** style.

Recommended size:

```
Desktop icons → 48px
Taskbar icons → 20px
Toolbar icons → 16px
```

Style rules:

* simple shapes
* consistent stroke width
* avoid complex illustrations

Prefer icon sets similar to:

* Heroicons
* Phosphor
* Lucide

---

# Window Manager Feel

The window manager should prioritize:

* fluid drag
* instant resize
* clean stacking

Interaction expectations:

```
Click → focus window
Drag → move window
Scroll on edge → resize
Double click title → maximize
```

Windows should **never lag behind the cursor**.

---

# App Design Philosophy

Each application should feel like a **native system tool**, not a website.

Apps inside AetherOS should follow:

* consistent header bars
* minimal toolbars
* keyboard shortcut support
* predictable layouts

Examples:

Terminal → developer focused
File Manager → productivity focused
Browser → lightweight navigation

---

# Sound Design (Optional)

Sound should be minimal.

Examples:

```
login chime
notification ping
error beep
```

Never include:

* loud alerts
* looping sounds

---

# Personality of AetherOS

The personality should feel like:

* calm
* powerful
* futuristic
* technical

It should attract:

* developers
* hackers
* system nerds
* tech enthusiasts

The OS should feel like:

> a playground for builders.

---

# Consistency Rules

All future UI must follow these constraints:

1. No random color palettes
2. Windows follow same structure
3. Apps share common UI primitives
4. Motion timing stays consistent
5. Typography scale stays fixed

Breaking these rules introduces visual fragmentation.

---

# Brand Summary

AetherOS should feel like:

* **macOS beauty**
* **Windows familiarity**
* **Linux performance**

while still being:

> a browser-native operating system experience.

The goal is not to imitate any one OS, but to combine the best traits of each into a cohesive system.

---
