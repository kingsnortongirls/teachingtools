# KNGS Computer Science | Teaching Tools

A collection of 16 browser-based Computer Science learning labs for KS3, GCSE OCR J277 and A Level OCR H446.

## Student website

https://kingsnortongirls.github.io/teachingtools/

## Repository layout

```text
teachingtools/
├── index.html                 # Searchable home and year-group filters
├── favicon.svg
├── assets/
│   ├── style.css              # Shared responsive styles
│   ├── common.js              # Shared DOM and formatting helpers
│   ├── advanced.js            # CPU, sorting, Python, logic gates
│   └── extra.js               # A Level interactive modules
├── escape-room/index.html     # Operation Blackout: six-stage KS3 escape room
├── escape-room/teacher-guide.html # Teacher solutions and differentiation
├── binary/index.html          # Binary and Data Representation Lab
├── binary-game/index.html     # Binary Blitz, five-level conversion game
├── flowcharts/index.html      # Algorithm / flowchart builder
├── command-line/index.html    # Simulated file-management terminal
├── networks/index.html        # Network designer
├── pixel-editor/index.html    # Pixel art and image layers
├── cpu/index.html             # Fetch–decode–execute
├── sorting/index.html         # Sorting and searching visualiser
├── python-tracing/index.html  # 192 step-by-step Python tracing challenges across 16 topics
├── logic-gates/index.html     # Logic gates and truth tables
├── data-structures/index.html # Stacks, queues, lists, trees, hashing
├── databases/index.html      # Safe read-only subset of SQL
├── floating-point/index.html # Fractional mantissa and exponent
├── packets/index.html        # Conceptual packet routing
└── complexity/index.html     # Big O growth explorer
```

## Design principles

- No sign-in or student data collection.
- No third-party JavaScript, trackers, packages or build step.
- Static HTML, CSS and JavaScript, hosted through GitHub Pages.
- Responsive, keyboard-accessible controls and labelled activities.
- Examples and simulated behaviour are pedagogical models, not production-grade emulators.
- Do not use simulated command-line or SQL examples as substitutes for real systems without explaining the simplifications.

## Publishing

In GitHub repository **Settings → Pages**, choose **Deploy from a branch**, **main**, **/(root)**.

GitHub Pages serves `index.html` at the root and each module from its own directory. Relative links to `../assets/` allow the site to work within a GitHub Pages project path.

## Adding future activities

1. Create `new-tool/index.html`.
2. Reuse `../assets/style.css` and, if necessary, `../assets/common.js`.
3. Add a card to the root `index.html` with the relevant `data-level` values.
4. Check the tool on desktop, iPhone and a printed view where appropriate.
5. Ensure any assessed examples are original and do not reproduce examination questions.

## Python tracing challenge lab

The `python-tracing/` tool contains 192 deterministic, original practice variations across 16 topic families, with KS3, GCSE J277 and A Level H446 filters. Each has a Python listing, an expected output, hints, line-by-line guided states, retryable answer checking and browser-local first-attempt tracking. It is a prepared tracing engine, not a general-purpose Python interpreter. No account or external library is required.

## Binary Blitz conversion game

`binary-game/` is an original independent binary conversion practice game inspired by the pace of the Cisco binary game, without copying assets or source. It supports binary-to-denary and denary-to-binary questions, mixed mode, five levels of 4/5/6/7/8-bit values, eight correct questions to progress per level, an optional 90-second arcade round, place-value hints, bit-switch controls, streak bonuses and local personal bests. It requires no sign-in or external libraries.


## Operation Blackout: KS3 Computer Science escape room

Student game: https://kingsnortongirls.github.io/teachingtools/escape-room/

Teacher answer guide (unlinked from student game): https://kingsnortongirls.github.io/teachingtools/escape-room/teacher-guide.html

Six original linked challenges for Year 7 to Year 9, designed for a 30-minute team activity:

1. **Network Rescue:** find the shortest, safe wired route through an interactive device map.
2. **Binary Vault:** decode four 8-bit ASCII values into an uppercase password.
3. **Algorithm Engine:** trace a conditional four-iteration pseudocode loop.
4. **Logic Power Grid:** solve a three-input AND/OR/NOT/XOR system using live switches and outputs.
5. **Packet Recovery:** reject corrupted packets using a simple checksum and reassemble a message.
6. **Final Override:** combine evidence from all five previous rooms into a command, route tag and derived PIN.

The game has two optional graduated hints per room, progress and timer, point deductions for hints and incorrect submissions, local-only progress, team-name option, mobile/keyboard-friendly controls and a printable completion certificate. No packages, login, remote storage, assets or third-party services.

**Classroom use:** work in pairs or threes with paper for workings. The 30-minute clock does not lock students out when it expires. The teacher guide supplies solutions, timings, SEND scaffolds and greater-depth extensions. As the game is a static site, answers can be inspected in page source; use for learning and enrichment rather than secure assessment.
