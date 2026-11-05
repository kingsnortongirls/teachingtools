# KNGS Computer Science | Teaching Tools

A collection of 14 browser-based Computer Science learning labs for KS3, GCSE OCR J277 and A Level OCR H446.

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
├── binary/index.html          # Binary and Data Representation Lab
├── flowcharts/index.html      # Algorithm / flowchart builder
├── command-line/index.html    # Simulated file-management terminal
├── networks/index.html        # Network designer
├── pixel-editor/index.html    # Pixel art and image layers
├── cpu/index.html             # Fetch–decode–execute
├── sorting/index.html         # Sorting and searching visualiser
├── python-tracing/index.html  # Guided Python tracing
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
