# KNGS Computer Science | Teaching Tools

A collection of 33 browser-based Computer Science learning labs for KS3, GCSE OCR J277 and A Level OCR H446.

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
├── networks/index.html        # Network Designer & Simulator
├── networks/designer.css      # Responsive full-screen designer layout
├── networks/designer.js       # Graph editor, routing, diagnostics and project tools
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


## Network Designer & Simulator

Student tool: https://kingsnortongirls.github.io/teachingtools/networks/

- **Flowchart-style workspace:** responsive three-column editor with device palette, central draggable SVG canvas and properties inspector. Expand to full screen, zoom and fit the design.
- **Design and edit:** add computers, laptops, servers, switches, routers, access points, printers, firewalls, NAS units, phones, tablets and a WAN/cloud symbol. Drag devices, draw Ethernet/fibre/wireless connections, rename devices and edit IPv4/VLAN labels, link latency and link capacity. Mark devices offline or links failed.
- **Network experiments:** choose school LAN, star, ring, mesh, redundant path or two-site examples; see a simplified topology estimate, connected component counts and warnings about disconnected nodes and duplicate IPv4 annotations.
- **Packet tracer:** select endpoints and compare fewest-hop routing with shortest link-latency routing. Step or play a simulated packet path with a hop limit and a delivery/dropped status.
- **Project tools:** undo/redo, automatic browser-local recovery, Save/Load, JSON export/import, SVG export, A4 landscape print, and keyboard support for selecting devices and deleting items.

**Teaching accuracy:** The route finding is based on a weighted graph of active devices and links. IPv4/VLAN fields are annotations; the simulator does **not** emulate real Ethernet switching, routing tables, firewall rules, wireless propagation, real packet timings or IP subnet enforcement. It is designed for modelling topology and explaining routing concepts, not for analysing a production network.

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


## Eight curriculum practical labs (November 2026)

These browser-based activities were created for the current KNGS Computer Science revision curriculum. They use the shared styles in `assets/lab-suite.css` and shared local-browser helpers in `assets/lab-suite.js`.

| Tool | Curriculum | Features |
|---|---|---|
| [Spreadsheet Challenge Lab](spreadsheet-lab/) | Year 7 Unit 8 | Editable sheet, formula bar, safe arithmetic and SUM/AVERAGE/MAX/MIN/COUNT, 8 auto-marked missions, 3 datasets, chart and CSV export |
| [Cipher Quest](cipher-quest/) | Year 7 Unit 6 | Caesar shifts, PigPen SVG symbols and key, three challenge levels, automatic checking |
| [Cyber Safety Detective](cyber-detective/) | Year 7/8 e-safety, GCSE 1.4 | Twelve fictional evidence investigations, multi-select clue marking, incident responses and print record |
| [Computer Builder & Memory Lab](computer-builder/) | Year 9 Unit 1, GCSE 1.1–1.2 | Fictional PC components and budgets, compatibility, RAM/ROM/cache/SSD simulation, 7 checks |
| [Debugging Detective](debugging-detective/) | Year 9 Python, GCSE 2.3.2 | Fifteen code investigations, fault-type classification, safe accepted-repair checks, reports |
| [Digital Data Studio](digital-data/) | GCSE 1.2, Year 9 image editing | Original synthesised Web Audio tones, sample rate and bit depth, real playback, waveform canvas, bitmap editor, file-size calculations |
| [Data Detective: John Snow](data-detective/) | Year 7 computational thinking | Explicitly synthetic 1854-inspired cholera case map, density and distance analysis, evidence questions and CSV |
| [UML & OOP Builder](uml-oop/) | OCR A Level H446 | Editable draggable UML class diagrams, attributes/methods, inheritance, associations, Python starter-code generation, SVG/JSON exports |

**Learning and privacy:** No sign-in or back-end is needed. Scores and draft work are saved using localStorage on the current browser where applicable, and do not synchronise between devices. Sound requires a direct click and Web Audio support.

**Assessment limitations:** Debugging Detective checks recognised repairs rather than executing arbitrary Python; UML-generated code is starter scaffolding; the computer builder's prices are deliberately illustrative, not shopping quotes; and the John Snow map contains synthetic data, not historical individual records. These activities are suitable for formative learning, not secure examination.



## November 2026 interactive lab expansion

Eight additional standalone browser activities have been added to the searchable homepage:

| Activity | Curriculum | Scope |
| --- | --- | --- |
| Little Man Computer (`little-man-computer/`) | GCSE J277, A Level H446 | Educational 100-mailbox assembler; step/run CPU, accumulator, program counter, output, instructions and memory |
| Parsons Problems (`parsons-problems/`) | KS3, GCSE | Six original rearrange-and-check Python exercises; indentation and code-order reasoning |
| Python Coding Lab (`python-coding-lab/`) | KS3, GCSE | Five guided writing and output prediction activities; structure checks, **not** a general Python interpreter |
| Web Development Studio (`web-studio/`) | KS3, GCSE enrichment | HTML, CSS, JS editor and sandboxed preview with project prompts and export |
| Python Turtle Playground (`python-turtle/`) | KS3, GCSE enrichment | Local turtle-style educational **subset** with lines, turns and bounded repeat blocks; not full Python |
| Algorithm-a-Day (`algorithm-a-day/`) | GCSE, A Level | Local-date-selected original pseudocode questions with hints and explanations |
| Typing Challenge (`typing-challenge/`) | KS3 | Typing passages, accuracy, time and approximate WPM |
| Character Encoding Lab (`character-encoding/`) | KS3, GCSE | ASCII questions; Unicode code points and real UTF-8 bytes via TextEncoder |

Existing Big O learning tools (`complexity/`, `sorting/`) and packet simulations (`packets/`, `networks/`) were retained rather than duplicated. All new activities are static browser tools and require no student login. Guided code checks are formative and do not securely validate arbitrary source code. The educational LMC and turtle environments simplify real system behaviour. Browser-based previews and exports should not contain personal data.


## Expanded practice banks (11 November 2026)

- **Parsons Problems:** 30 staged, topic-filtered code-reordering puzzles spanning KS3, GCSE and A Level. Hint, order-check, output-reveal and in-session progress.
- **Python Coding Lab:** 30 guided Python missions with starters, worked solutions, predicted-output checks and reflection tasks. The checker inspects expected features and does **not** execute arbitrary Python, so it is not a substitute for running and testing code.
- **Web Development Studio:** 16 curriculum-sequenced HTML, CSS and JavaScript worked examples with explanations, formative feature checks, live sandboxed preview and independent extensions.
- **Algorithm-a-Day:** 95 algorithm-tracing, selection, iteration, data structure and complexity questions, with daily selection, stage/topic filters, hints and worked answers.
- **Typing Challenge:** 15 progressive levels with five passages each (75 total), positioning-based error highlighting, in-session completion records and speed/accuracy medals.

**Testing and privacy:** These are standalone educational pages with no sign-in or remote progress storage. Session progress resets when the page reloads. Guided checks are not full code execution. The web preview permits JavaScript inside a sandbox, so students should not use live personal information or untrusted third-party scripts.

### Typing certificate awards

The Typing Challenge now unlocks a personalised certificate after a **completed** passage with a Bronze, Silver or Gold result. The name prompt opens automatically; pupils can preview a designed landscape certificate and save it locally as a high-resolution PNG. Certificates include the pupil-entered name, level, passage, tier, date, calculated WPM and accuracy. The name is rendered entirely in-browser, not transmitted to a server. Pupils can reopen the most recent award during the current page session. Bronze/Silver/Gold thresholds remain those published on the activity page.
