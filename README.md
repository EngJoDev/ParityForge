# ⚡ ParityForge

> **Cross-Language Behavioral Equivalence & Differential Testing Engine**  
> Architected & Built by **[Youssef El-Sayed (EngJoDev)](https://github.com/EngJoDev)**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintainer](https://img.shields.io/badge/Maintainer-EngJoDev-06B6D4?logo=github)](https://github.com/EngJoDev)

---

## 🏛️ 1. Executive Summary & Product Mission

When companies modernize core infrastructure—such as migrating financial calculations, pricing logic, or authorization rules from **Python to Rust** or **Go to C++**—microscopic discrepancies inevitably slip into production:

* **IEEE-754 Floating-Point Drift** vs. Arbitrary Precision Decimals.
* **Structural Inconsistencies** (unexpected extra fields or missing properties during serialization).
* **Subtle Null & Missing Value Ambiguities**.

**ParityForge** is an open-source developer-tooling platform built to verify whether two or more independent implementations of the exact same business contract produce **100% deterministic, compatible output** across execution environments.

---

## ⚖️ 2. Critical Engineering Truthfulness

ParityForge is engineered with strict honesty at its core:

1. **Never Fakes Code Execution:** The web interface never claims that arbitrary Python or Rust source code has executed in Node.js when it has not.
2. **Two Distinct Operational Modes:**
   * **DEMO MODE:** Uses deterministic bundled fixtures (e.g., the *Global Pricing & Tax Engine*). Employs the real, client-side `DeterministicComparator` to traverse results and report real structural mismatches.
   * **ENGINE CONNECTED MODE:** Connects to an external, sandboxed ParityForge daemon (`:8765`) running locally on Linux Mint. If the daemon is unreachable, the system displays an honest disconnected status rather than fabricating success.
3. **Zero Runtime Bloat:** Completely deterministic comparisons with zero dependency on external non-deterministic AI APIs.

---

## 🏗️ 3. Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   ParityForge UI                       │
│    (React + TypeScript + Vite + Strict Type Safety)    │
└──────────────────────────┬─────────────────────────────┘
                           │
      ┌────────────────────┴─────────────────────┐
      ▼                                          ▼
┌───────────────────────────┐      ┌──────────────────────────┐
│        DEMO MODE          │      │  ENGINE CONNECTED MODE   │
│   Deterministic Fixtures  │      │  Standalone Python Svc   │
│   & In-Browser Comparator │      │  Linux Daemon (:8765)    │
└─────────────┬─────────────┘      └─────────────┬────────────┘
              │                                  │
              └─────────────────┬────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │    DeterministicComparator Engine │
              │  - Strict Structural Equality     │
              │  - Configurable Delta Tolerance   │
              │  - JSON Path Mismatch Tracking    │
              └───────────────────────────────────┘
```

---

## ⚡ 4. The Core Deterministic Comparator

At the heart of ParityForge is `DeterministicComparator` (`src/lib/comparator.ts`), an enterprise-grade diffing engine capable of:

* **Deep Recursive Traversal:** Comparing arbitrary JSON structures down to primitive nodes.
* **Configurable Numeric Tolerance:** Resolving floating-point precision drifts (e.g., Python `41.24999999999999` vs. Rust `41.2500` against policy tolerance `±0.001`).
* **Strict Structural Equality:** Flagging unauthorized extra properties or missing keys.
* **JSON Path Mismatch Tracking:** Pinpointing exact divergence coordinates (e.g., `$.tax_amount` or `$.items[0].price`).
* **Ignored Path Filtering:** Bypassing non-deterministic telemetry (e.g., timestamps, UUIDs).

---

## 📁 5. Directory Structure

```text
parityforge/
├── src/
│   ├── types/
│   │   └── index.ts                 # Strongly-typed domain contracts & schemas
│   ├── lib/
│   │   └── comparator.ts            # The Deterministic Comparator engine
│   ├── fixtures/
│   │   └── demoData.ts              # Global Pricing Engine fixtures (Python vs Rust)
│   ├── services/
│   │   └── engineClient.ts          # Standalone Python engine boundary client
│   ├── App.tsx                      # Application Shell (8 Navigation views & Runner)
│   ├── index.css                    # Graphite & Subtle Cyan design system tokens
│   └── main.tsx                     # Vite React entrypoint
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 6. Getting Started & Installation

### Prerequisites
* **Node.js:** `v20.x` or `v24.x`
* **npm:** `v10.x` or `v11.x`
* **OS:** Linux (tested on Linux Mint / Ubuntu), macOS, or Windows

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/EngJoDev/ParityForge.git
cd ParityForge
```

2. **Install project dependencies:**
```bash
npm install
```

3. **Start the local development server:**
```bash
npm run dev
```

4. **Access the application:**
Open your browser and navigate to `http://localhost:5173/`.

---

## 🧪 7. Walkthrough: The Price Engine Case Study

1. Navigate to the **Comparisons** tab in the sidebar.
2. Select the **Micro-discount Floating-point Rounding Edge Case** test case.
3. Review the implementations:
   * **Reference:** Python Legacy Pricing Engine (`v3.12-cpython`).
   * **Candidate:** Rust High-Throughput Engine (`v1.85-release`).
4. Click **`Run Test`**:
   * The comparator will run locally against fixture outputs.
   * Adjust the **Numeric Tolerance** under **Settings** to observe how delta thresholds change results between *Equivalence Confirmed* and *Discrepancy Detected*.
5. Click **`Export JSON`** to generate an automated audit report.

---

## 🗺️ 8. Engineering Roadmap

* [x] **Deterministic In-Browser Comparator:** Full deep-equality diffing with JSON path reporting.
* [x] **Precision Tolerance Engine:** Delta-based mathematical comparison for floats.
* [x] **Audit Reporting:** Clean machine-readable JSON exports.
* [x] **Honest Engine Probing:** Disconnected status detection for backend services.
* [ ] **Standalone Linux Engine Daemon:** Python-based CLI service utilizing Linux `cgroups` and eBPF socket monitoring.
* [ ] **CLI Workflow:** `parityforge compare --contract contract.json --cases testcases.json`.
* [ ] **Automated GitHub Action:** CI differential runner blocking regressions on PRs.

---

## 👤 Author & Maintainer

**Youssef El-Sayed (EngJoDev)**  
* **GitHub:** [@EngJoDev](https://github.com/EngJoDev)  
* **Blog:** [engjodev.hashnode.dev](https://engjodev.hashnode.dev)  
* **Role:** Systems & Software Infrastructure Engineer

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
