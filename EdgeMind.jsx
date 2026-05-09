import { useState, useEffect, useCallback } from "react";

const PHASES = [
  {
    id: "p1", num: "01", name: "Foundation", weeks: "Weeks 1–2", color: "#4ade80",
    tasks: [
      { id: "p1t1", text: "Identify Raspberry Pi model — use as software dev + inference baseline" },
      { id: "p1t2", text: "Consult family friend: which FPGA board to buy, which RISC-V starter to use" },
      { id: "p1t3", text: "Order FPGA board (likely Digilent Arty A7 or iCE40 — confirm with mentor)" },
      { id: "p1t4", text: "Install Vivado or open-source toolchain (Yosys + nextpnr for iCE40)" },
      { id: "p1t5", text: "Run TF Lite inference on Pi — log baseline latency and memory as reference" },
      { id: "p1t6", text: "Complete fast.ai Practical DL Part 1 (chapters 1–4)" },
      { id: "p1t7", text: "Study RISC-V ISA spec: understand RV32I base integer instruction set" },
      { id: "p1t8", text: "Create public GitHub repo: EdgeMind — README with architecture thesis" },
      { id: "p1t9", text: "Start LeetCode daily habit — arrays, hashmaps, two pointers" },
    ],
    deliverable: "FPGA board ordered. TF Lite baseline on Pi documented. RISC-V ISA understood. Toolchain installed.",
  },
  {
    id: "p2", num: "02", name: "RISC-V Core", weeks: "Weeks 3–5", color: "#4ade80",
    tasks: [
      { id: "p2t1", text: "Study existing minimal RISC-V cores: PicoRV32 or SERV as reference" },
      { id: "p2t2", text: "Implement 5-stage pipeline in SystemVerilog: IF → ID → EX → MEM → WB" },
      { id: "p2t3", text: "Implement RV32I base instruction set — all 47 base instructions" },
      { id: "p2t4", text: "Add RV32M extension: multiply and divide (required for inference arithmetic)" },
      { id: "p2t5", text: "Synthesise core on FPGA — run first test program (fibonacci, bubble sort)" },
      { id: "p2t6", text: "Set up RISC-V GCC toolchain — compile and run C code on custom core" },
      { id: "p2t7", text: "Write SystemVerilog testbench — verify pipeline correctness with waveforms" },
      { id: "p2t8", text: "Benchmark: clock frequency, instructions per cycle, FPGA resource utilisation" },
      { id: "p2t9", text: "LeetCode: trees, graphs, dynamic programming" },
    ],
    deliverable: "Working RV32IM core synthesised on FPGA. C programs compiling and running correctly. Clock freq measured.",
  },
  {
    id: "p3", num: "03", name: "Inference on Custom Silicon", weeks: "Weeks 6–8", color: "#4ade80",
    tasks: [
      { id: "p3t1", text: "Port a quantised INT8 model to run on RISC-V core via GCC toolchain" },
      { id: "p3t2", text: "Profile inference: identify which operations dominate (almost certainly GEMM)" },
      { id: "p3t3", text: "Design custom ISA extension: add a dot-product or matmul instruction in SystemVerilog" },
      { id: "p3t4", text: "Measure speedup: custom instruction vs software-emulated GEMM on baseline RV32IM" },
      { id: "p3t5", text: "Compare inference latency: your RISC-V core vs ARM Pi for same quantised model" },
      { id: "p3t6", text: "Apply quantisation-aware training — measure accuracy retention vs FP32 baseline" },
      { id: "p3t7", text: "Publish full benchmark report: latency, power, accuracy, resource utilisation" },
      { id: "p3t8", text: "Write technical blog post: 'Building a RISC-V inference engine from scratch'" },
      { id: "p3t9", text: "LeetCode: system design, bit manipulation, advanced graphs" },
    ],
    deliverable: "Quantised inference running on custom RISC-V core. Measured speedup from custom ISA extension documented.",
  },
  {
    id: "p4", num: "04", name: "Runtime & Application", weeks: "Weeks 9–10", color: "#f59e0b",
    tasks: [
      { id: "p4t1", text: "Choose application: UAV obstacle avoidance OR satellite image triage" },
      { id: "p4t2", text: "Build agent loop on RISC-V core: perceive → reason → act" },
      { id: "p4t3", text: "Implement local/cloud switching: RISC-V handles local inference, offload heavy tasks" },
      { id: "p4t4", text: "Build simulation environment for chosen application domain" },
      { id: "p4t5", text: "Measure full-system power draw under inference load" },
      { id: "p4t6", text: "Record demo video — narrate the full hardware stack, show it running" },
    ],
    deliverable: "Autonomous application running on custom RISC-V core. Demo video live.",
  },
  {
    id: "p5", num: "05", name: "Launch & Leverage", weeks: "Weeks 11–12", color: "#f59e0b",
    tasks: [
      { id: "p5t1", text: "Polish GitHub README: architecture diagrams, benchmark tables, demo GIF, setup guide" },
      { id: "p5t2", text: "Write definitive blog post: full hardware/software co-design story" },
      { id: "p5t3", text: "Submit to ESA Space App Challenge, UAV hackathon, or RISC-V competition" },
      { id: "p5t4", text: "Apply to: Arm, Graphcore, Waymo, Tenstorrent, Orbital Sidekick, L3Harris" },
      { id: "p5t5", text: "Send mentor update to family friend — share repo and benchmark results" },
      { id: "p5t6", text: "Post demo video on X + LinkedIn with technical thread on the ISA extension" },
      { id: "p5t7", text: "Cold outreach to 3 engineers in edge AI or processor architecture" },
      { id: "p5t8", text: "Draft YC one-pager if startup thesis feels compelling post-build" },
    ],
    deliverable: "Public repo + blog post live. Applications sent. Graphcore and Arm on radar.",
  },
];

const BENCHMARKS = [
  { val: "50MHz+", label: "Core clock freq", desc: "on target FPGA" },
  { val: "2–5×", label: "Custom ISA speedup", desc: "matmul vs software GEMM" },
  { val: "<100ms", label: "Inference latency", desc: "RV32IM, quantised model" },
  { val: "<4MB", label: "Model footprint", desc: "quantised + pruned" },
  { val: "<5W", label: "System power", desc: "FPGA under inference load" },
  { val: "150+", label: "LeetCode solved", desc: "by week 12" },
];

const ARCH = [
  { num: "03", label: "Application", desc: "UAV / satellite demo. The visible surface.", detail: "Drone obstacle avoidance or satellite image triage running end-to-end on hardware you built.", color: "#f59e0b", dim: "#3a2a0a" },
  { num: "02", label: "Runtime", desc: "Agent loop: perceive → reason → act.", detail: "Local/cloud switching. Task prioritisation under power and bandwidth constraints.", color: "#f59e0b", dim: "#3a2a0a" },
  { num: "01", label: "Inference core", desc: "Quantised INT8 model. Custom GEMM acceleration.", detail: "The moat. Quantised model compiled via RISC-V GCC, running on silicon you designed.", color: "#4ade80", dim: "#1a3a1a" },
  { num: "00", label: "Compute substrate", desc: "Custom RISC-V processor on FPGA.", detail: "RV32IM + custom matmul ISA extension in SystemVerilog. Nobody else at student level has this.", color: "#4ade80", dim: "#1a3a1a" },
];

const STACK = [
  { layer: "Hardware design", tools: "SystemVerilog · Vivado / Yosys + nextpnr" },
  { layer: "Processor arch", tools: "RISC-V RV32IM · custom matmul ISA extension" },
  { layer: "FPGA", tools: "Digilent Arty A7 or iCE40 (confirm with mentor)" },
  { layer: "Toolchain", tools: "RISC-V GCC · objdump · spike simulator" },
  { layer: "ML optimisation", tools: "TF Lite Micro · PyTorch · CMSIS-NN · QAT" },
  { layer: "Verification", tools: "SystemVerilog testbench · GTKWave waveforms" },
  { layer: "Application", tools: "Drone sim · satellite sim · C/C++ runtime" },
];

const MENTOR_QS = [
  "Which FPGA board do you recommend for a first RISC-V implementation?",
  "Should I start from PicoRV32 / SERV as a reference, or implement from scratch?",
  "Is RV32IM sufficient or should I target a vector extension (RVV)?",
  "What would a candidate with this project look like to you in a Graphcore interview?",
  "What would you immediately see through — where do students over-claim on hardware projects?",
  "Should I learn UVM verification this summer or focus on design first?",
];

async function load(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function save(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

export default function EdgeMind() {
  const [checked, setChecked] = useState({});
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState({ p1: true, p2: false, p3: false, p4: false, p5: false });
  const [tab, setTab] = useState("plan");

  useEffect(() => {
    (async () => { const s = await load("edgemind-v2"); if (s) setChecked(s); setReady(true); })();
  }, []);

  const toggle = useCallback(async (id) => {
    setChecked(prev => { const n = { ...prev, [id]: !prev[id] }; save("edgemind-v2", n); return n; });
  }, []);

  const allTasks = PHASES.flatMap(p => p.tasks);
  const total = allTasks.length;
  const done = allTasks.filter(t => checked[t.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const col = { bg: "#07090a", surf: "#090d09", surf2: "#0a110a", bdr: "#111a11", bdr2: "#0d1a0d", green: "#4ade80", amber: "#f59e0b", text: "#d4f0d4", mid: "#5a7a5a", dim: "#3a5a3a", faint: "#1e2e1e", greenDark: "#1a3a1a" };

  if (!ready) return <div style={{ background: col.bg, minHeight: "100vh" }} />;

  const TABS = [["plan","BUILD PLAN"],["arch","ARCHITECTURE"],["benchmarks","BENCHMARKS"],["mentor","MENTOR PREP"]];

  return (
    <div style={{ background: col.bg, minHeight: "100vh", fontFamily: "'Courier New', Consolas, monospace", color: col.text }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px 64px" }}>

        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: col.green, border: `1px solid ${col.greenDark}`, padding: "3px 10px", borderRadius: 2, display: "inline-block", marginBottom: 14 }}>
          EDGEMIND · HARDWARE/SOFTWARE CO-DESIGN · SUMMER 2026
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f0fff0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>EdgeMind</h1>
        <p style={{ fontSize: 12, color: col.dim, margin: "0 0 4px" }}>Autonomous AI runtime for constrained systems · Ali Hassan · KCL MEng</p>
        <p style={{ fontSize: 11, color: "#2a5a2a", margin: "0 0 24px" }}>Custom RISC-V core on FPGA → quantised inference → autonomous application</p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: col.dim, letterSpacing: "0.1em" }}>OVERALL PROGRESS</span>
          <span style={{ fontSize: 10, color: col.green }}>{done}/{total} · {pct}%</span>
        </div>
        <div style={{ height: 3, background: "#111a11", borderRadius: 2, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg, ${col.green}, #22c55e)`, borderRadius: 2, transition: "width 0.5s ease" }} />
        </div>

        <div style={{ background: "#080e08", border: `1px solid ${col.greenDark}`, borderRadius: 3, padding: "14px 16px", marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", color: col.dim, marginBottom: 7 }}>THE THESIS</div>
          <div style={{ fontSize: 13, color: "#c8e8c8", lineHeight: 1.7 }}>Most students run inference on hardware someone else built. EdgeMind is different: the compute substrate is a custom RISC-V processor designed in SystemVerilog and synthesised on FPGA. Inference runs on silicon you built. The custom matmul ISA extension is the benchmark result nobody else can produce.</div>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${col.bdr}`, marginBottom: 26 }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ fontSize: 10, letterSpacing: "0.1em", padding: "8px 16px", cursor: "pointer", color: tab === id ? col.green : col.dim, background: "none", border: "none", borderBottom: tab === id ? `1px solid ${col.green}` : "1px solid transparent", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "plan" && (
          <div>
            {PHASES.map(phase => {
              const pDone = phase.tasks.filter(t => checked[t.id]).length;
              const pPct = Math.round((pDone / phase.tasks.length) * 100);
              const isOpen = expanded[phase.id];
              return (
                <div key={phase.id} style={{ border: `1px solid ${col.bdr}`, borderRadius: 3, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer", background: col.surf, userSelect: "none" }}
                    onClick={() => setExpanded(p => ({ ...p, [phase.id]: !p[phase.id] }))}>
                    <span style={{ fontSize: 10, color: col.faint, minWidth: 20 }}>{phase.num}</span>
                    <span style={{ flex: 1, fontSize: 14, color: col.text, fontFamily: "Georgia,serif" }}>{phase.name}</span>
                    <span style={{ fontSize: 10, color: col.faint }}>{phase.weeks}</span>
                    <span style={{ fontSize: 10, color: pDone === phase.tasks.length ? phase.color : col.faint, marginLeft: 8 }}>{pDone}/{phase.tasks.length}</span>
                    <span style={{ fontSize: 9, color: col.faint, marginLeft: 6 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "14px 16px 18px", borderTop: `1px solid ${col.bdr2}`, background: col.surf2 }}>
                      <div style={{ height: 3, background: "#111a11", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
                        <div style={{ height: "100%", width: pPct + "%", background: phase.color === col.amber ? `linear-gradient(90deg, ${col.amber}, #d97706)` : `linear-gradient(90deg, ${col.green}, #22c55e)`, borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                      {phase.tasks.map(task => {
                        const isDone = !!checked[task.id];
                        return (
                          <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 9, cursor: "pointer" }} onClick={() => toggle(task.id)}>
                            <div style={{ width: 13, height: 13, border: `1px solid ${isDone ? phase.color : col.greenDark}`, borderRadius: 2, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? phase.color : "transparent", transition: "all 0.12s" }}>
                              {isDone && <span style={{ color: "#07090a", fontSize: 8, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 12, color: isDone ? col.faint : col.mid, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.55 }}>{task.text}</span>
                          </div>
                        );
                      })}
                      <div style={{ marginTop: 16, padding: "10px 12px", background: "#080e08", border: `1px solid ${col.bdr}`, borderRadius: 3 }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.14em", color: col.dim, marginBottom: 3 }}>PHASE DELIVERABLE</div>
                        <div style={{ fontSize: 11, color: phase.color, lineHeight: 1.5 }}>{phase.deliverable}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ border: `1px solid ${col.bdr}`, borderRadius: 3, padding: "14px 16px", marginTop: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: col.dim, marginBottom: 12 }}>DAILY — NON-NEGOTIABLE</div>
              {["45 min LeetCode — no exceptions", "At least one public commit to EdgeMind", "Read 1 ML systems paper, blog post, or hardware whitepaper", "Log one concrete learning in notes"].map((h, i, a) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: i < a.length - 1 ? 8 : 0 }}>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: col.green, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: col.mid }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "arch" && (
          <div>
            <div style={{ fontSize: 11, color: col.mid, marginBottom: 20, lineHeight: 1.7 }}>Four layers stacked bottom-up. The innovation lives in layers 00 and 01. Layers 02 and 03 make it legible to the outside world.</div>
            {[...ARCH].reverse().map((a, i) => (
              <div key={i} style={{ border: `1px solid ${a.dim}`, borderRadius: 3, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", color: a.color, marginBottom: 3 }}>LAYER {a.num} — {a.label.toUpperCase()}</div>
                <div style={{ fontSize: 14, color: col.text, fontFamily: "Georgia,serif", marginBottom: 4 }}>{a.desc}</div>
                <div style={{ fontSize: 11, color: col.mid, lineHeight: 1.5 }}>{a.detail}</div>
              </div>
            ))}
            <div style={{ border: `1px solid ${col.bdr}`, borderRadius: 3, padding: "6px 16px 12px", marginTop: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: col.dim, margin: "12px 0 10px" }}>TECH STACK</div>
              {STACK.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "8px 0", borderBottom: i < STACK.length - 1 ? `1px solid ${col.bdr2}` : "none", alignItems: "baseline" }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.1em", color: col.dim, minWidth: 120 }}>{s.layer.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: col.mid }}>{s.tools}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "benchmarks" && (
          <div>
            <div style={{ fontSize: 11, color: col.mid, marginBottom: 20, lineHeight: 1.7 }}>Every number must be measured, not estimated. The benchmark report published on GitHub is the proof of work.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {BENCHMARKS.map(b => (
                <div key={b.label} style={{ background: col.surf, border: `1px solid ${col.bdr}`, borderRadius: 3, padding: "12px 14px" }}>
                  <div style={{ fontSize: 20, color: col.green, fontFamily: "Georgia,serif", fontWeight: 700, marginBottom: 2 }}>{b.val}</div>
                  <div style={{ fontSize: 10, color: col.dim, marginBottom: 1 }}>{b.label}</div>
                  <div style={{ fontSize: 9, color: col.faint, letterSpacing: "0.05em" }}>{b.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${col.bdr}`, borderRadius: 3, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: col.dim, marginBottom: 10 }}>THE KEY RESULT</div>
              <div style={{ fontSize: 12, color: col.mid, lineHeight: 1.7 }}>
                The headline number is the <span style={{ color: col.green }}>custom ISA extension speedup</span>: measured latency of GEMM using your custom matmul instruction vs software-emulated matrix multiply on baseline RV32IM. A 2–5× measured speedup is what makes this hardware/software co-design rather than a student exercise. This is the result that impresses Graphcore, Arm, and every AI accelerator company.
              </div>
            </div>
          </div>
        )}

        {tab === "mentor" && (
          <div>
            <div style={{ background: "#080e08", border: `1px solid ${col.greenDark}`, borderRadius: 3, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", color: col.dim, marginBottom: 7 }}>YOUR MENTOR</div>
              <div style={{ fontSize: 14, color: col.text, fontFamily: "Georgia,serif", marginBottom: 4 }}>Silicon Design Engineer · Graphcore</div>
              <div style={{ fontSize: 11, color: col.mid, lineHeight: 1.6 }}>Prev: RTL Design Lead at VyperCore (RISC-V). Principal Digital Design & Verification Engineer at Ultraleap. Bristol Electronics. Exactly the right person. He builds AI accelerator hardware professionally. Don't waste the meeting.</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: col.dim, marginBottom: 14 }}>QUESTIONS TO BRING — PREPARED AND SPECIFIC</div>
            {MENTOR_QS.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, color: "#2a5a2a", minWidth: 18, marginTop: 1 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ fontSize: 12, color: col.mid, lineHeight: 1.55 }}>{q}</span>
              </div>
            ))}
            <div style={{ border: `1px solid ${col.bdr}`, borderRadius: 3, padding: "14px 16px", marginTop: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: col.dim, marginBottom: 10 }}>HOW TO HANDLE THE MEETING</div>
              {["Bring a one-page written summary of EdgeMind — show you've done the thinking",
                "Share the GitHub repo link even if it's sparse — shows you're already building",
                "Ask for brutal honesty: what would he see through immediately",
                "End with: 'Can I send you an update in 6 weeks when I have something concrete to show?'",
                "Do not ask for a job. Let the work speak. The relationship compounds over time."].map((tip, i, a) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < a.length-1 ? 9 : 0 }}>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: col.amber, flexShrink: 0, marginTop: 5 }} />
                  <span style={{ fontSize: 11, color: col.mid, lineHeight: 1.55 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, borderTop: `1px solid ${col.bdr2}`, paddingTop: 18, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: col.faint, letterSpacing: "0.1em" }}>EDGEMIND · KCL 2026</span>
          <span style={{ fontSize: 9, color: col.faint }}>{done}/{total} · {pct}%</span>
        </div>

      </div>
    </div>
  );
}
