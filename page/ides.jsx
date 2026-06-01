// ides.jsx — multi-IDE symlink visual

const IDE_ICONS = {
  "Claude Code": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M12 3 L18 12 L12 21 L6 12 Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  "Cursor": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 4 L19 11 L13 13 L11 19 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  "Copilot": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="9" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 12 a7 4 0 0 1 14 0" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  "Windsurf": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M4 16 Q8 8 12 12 Q16 16 20 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 20 Q8 12 12 16 Q16 20 20 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  "Codex / Others": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function IdesSection({ copy, motion }) {
  const [ref, inView] = useInView();
  const ides = copy.ides;
  const count = ides.length;

  // SVG-based ports diagram. Source on left, IDEs stacked on right.
  return (
    <section className="section" ref={ref} style={{ position: "relative" }}>
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} sub={copy.sub} />

        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
          }}
        >
          {/* terminal-style chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 18px",
              borderBottom: "1px solid var(--line-1)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
              ls -la · symlinks resolved
            </div>
            <div style={{ flex: 1 }} />
            <span className="chip mono" style={{ fontSize: 10.5, color: "var(--ok)", borderColor: "rgba(52, 211, 153, 0.3)", background: "rgba(52, 211, 153, 0.08)" }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--ok)" }} />
              .ai/ → native format per IDE
            </span>
          </div>

          {/* diagram */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 320px) 1fr minmax(280px, 1fr)",
              gap: 0,
              minHeight: 460,
              position: "relative",
            }}
            className="ide-diagram"
          >
            {/* LEFT — source */}
            <div
              style={{
                padding: "44px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                borderRight: "1px solid var(--line-1)",
              }}
              className="ide-source"
            >
              <div className="eyebrow mono" style={{ marginBottom: 18 }}>// source of truth</div>
              <div
                style={{
                  width: "100%",
                  padding: "24px 22px",
                  borderRadius: 14,
                  border: "1px solid transparent",
                  background:
                    "linear-gradient(var(--bg-1), var(--bg-1)) padding-box, " +
                    "linear-gradient(135deg, var(--iris-violet), var(--iris-blue), var(--iris-cyan)) border-box",
                  boxShadow:
                    "0 12px 40px rgba(96,165,250,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
                  position: "relative",
                  animation: inView ? "fade-up 0.7s 0.05s cubic-bezier(0.2,0.65,0.2,1) backwards" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 3 H14 L18 7 V20 a1 1 0 0 1 -1 1 H6 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 Z" stroke="url(#srcg)" strokeWidth="1.4" />
                    <defs>
                      <linearGradient id="srcg" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#a78bfa" />
                        <stop offset="1" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="mono" style={{ fontSize: 14, color: "var(--ink-0)", fontWeight: 500, letterSpacing: "-0.005em" }}>
                    {copy.source}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.02em" }}>
                  {copy.sourceHint}
                </div>
                {/* scan line */}
                {motion > 0 && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute", left: 0, right: 0, height: 60,
                        background: "linear-gradient(180deg, transparent, rgba(34, 211, 238, 0.18), transparent)",
                        animation: `scan ${Math.max(3, 8 - motion * 0.5)}s linear infinite`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="mono" style={{ marginTop: 22, fontSize: 11, color: "var(--ink-3)", lineHeight: 1.7 }}>
                <div>$ readlink CLAUDE.md</div>
                <div>.ai/INSTRUCTIONS.md</div>
                <div style={{ marginTop: 8 }}>$ ls .cursor/rules/</div>
                <div>*.mdc (generated from .ai/)</div>
              </div>
            </div>

            {/* MIDDLE — connections SVG (absolute, drawn over) */}
            <svg
              viewBox="0 0 400 460"
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              style={{ display: "block", overflow: "visible" }}
              className="ide-connections"
            >
              <defs>
                <linearGradient id="line-grad" x1="0" x2="1">
                  <stop offset="0" stopColor="#a78bfa" stopOpacity="0.7" />
                  <stop offset="0.5" stopColor="#60a5fa" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#22d3ee" stopOpacity="0.7" />
                </linearGradient>
                <radialGradient id="dot-grad">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                </radialGradient>
              </defs>
              {ides.map((_, i) => {
                const targetY = 38 + i * ((460 - 76) / (count - 1));
                const sourceY = 230;
                const path = `M 0 ${sourceY} C 130 ${sourceY}, 220 ${targetY}, 400 ${targetY}`;
                const animDelay = motion > 0 ? `${i * 0.7}s` : "0s";
                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill="none"
                      stroke="url(#line-grad)"
                      strokeWidth="1.2"
                      strokeDasharray="2 4"
                      opacity={inView ? 0.55 : 0}
                      style={{ transition: `opacity 0.6s ${0.1 + i * 0.08}s` }}
                    />
                    {motion > 0 && inView && (
                      <circle r="3" fill="url(#dot-grad)" opacity="0.95">
                        <animateMotion
                          dur={`${Math.max(2.4, 6 - motion * 0.3)}s`}
                          repeatCount="indefinite"
                          begin={animDelay}
                          path={path}
                          rotate="auto"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* RIGHT — IDE list */}
            <div
              style={{
                padding: "30px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                borderLeft: "1px solid var(--line-1)",
              }}
              className="ide-list"
            >
              {ides.map((ide, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    border: "1px solid var(--line-1)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.015)",
                    animation: inView ? `fade-up 0.6s ${0.15 + i * 0.08}s cubic-bezier(0.2,0.65,0.2,1) backwards` : "none",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--line-2)",
                      color: "var(--ink-1)",
                    }}
                  >
                    {IDE_ICONS[ide.name]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: "var(--ink-0)", fontWeight: 500 }}>
                      {ide.name}
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ide.file}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--ff-mono)",
                      fontSize: 10,
                      color: "var(--iris-cyan)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "3px 7px",
                      borderRadius: 4,
                      background: "rgba(34, 211, 238, 0.06)",
                      border: "1px solid rgba(34, 211, 238, 0.18)",
                    }}
                  >
                    symlink
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* footer note */}
          <div
            style={{
              padding: "16px 22px",
              borderTop: "1px solid var(--line-1)",
              background: "rgba(255,255,255,0.012)",
              fontFamily: "var(--ff-mono)",
              fontSize: 11.5,
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "var(--ink-2)" }}>$</span>
            <span>git status .ai/ .claude/ .cursor/ .github/skills/</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: "var(--ok)" }}>✓ everything in one tree · everything in git</span>
          </div>
        </div>

        <style>{`
          @media (max-width: 880px) {
            .ide-diagram { grid-template-columns: 1fr !important; }
            .ide-connections { display: none !important; }
            .ide-source { border-right: 0 !important; border-bottom: 1px solid var(--line-1); }
            .ide-list { border-left: 0 !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

Object.assign(window, { IdesSection });
