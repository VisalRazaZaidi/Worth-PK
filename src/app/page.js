"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Monitor,
  Folder,
  Lock,
  Unlock,
  Zap,
  TrendingUp,
  MapPin,
  Star,
  Briefcase,
  X,
  Minus,
  Square,
  ChevronRight,
  Trophy,
  Target,
  Cpu,
  Wifi,
  Volume2,
} from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdfParser";
import { COMPANY_PROFILES, formatPKR } from "@/lib/salaryData";

// ─── BOOT SEQUENCE ────────────────────────────────────────
function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const bootMessages = [
    "WORTH.PK BIOS v2.26 — Career Analysis System",
    "Copyright (c) 2026 Worth.pk Technologies",
    "",
    "Detecting hardware...",
    "  CPU: Gemini Ultra AI Co-Processor ... OK",
    "  RAM: 640KB ought to be enough ... OK",
    "  GPU: CRT Monitor Adapter ... OK",
    "  NET: Pakistan Fiber Optic Link ... OK",
    "",
    "Loading salary_map_2026.dat .......... OK",
    "Loading company_profiles.dat ......... OK",
    "Initializing resume_parser.dll ....... OK",
    "Connecting to Pakistani Job Market ... OK",
    "",
    "System ready. Welcome to Worth.pk!",
    "",
    "Press any key to continue...",
  ];

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < bootMessages.length) {
        setLines((prev) => [...prev, bootMessages[i]]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (lines.length >= bootMessages.length) {
        onComplete();
      }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("click", handler);
    };
  }, [lines.length, onComplete]);

  // Auto-complete after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="boot-screen">
      <div className="boot-text">
        {lines.map((line, i) => (
          <p key={i}>{line || "\u00A0"}</p>
        ))}
        <span className="boot-cursor" />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function HomePage() {
  const [booted, setBooted] = useState(false);
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [dragOver, setDragOver] = useState(false);
  const [clock, setClock] = useState("");
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const windowRef = useRef(null);

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Window dragging
  const handleMouseDown = useCallback(
    (e) => {
      if (e.target.closest(".window-btn")) return;
      setDragging(true);
      setDragStart({
        x: e.clientX - windowPos.x,
        y: e.clientY - windowPos.y,
      });
    },
    [windowPos]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      setWindowPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };
    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragStart]);

  // File handling
  const handleFileDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      setError("ERROR: Only .pdf files accepted. This ain't a .doc zone.");
      return;
    }

    setFile(droppedFile);
    setError("");
    setAnalysis(null);

    try {
      const text = await extractTextFromPDF(droppedFile);
      if (text.length < 50) {
        setError("ERROR: Could not extract enough text. Is this a scanned/image PDF?");
        return;
      }
      setResumeText(text);
    } catch (err) {
      setError("ERROR: " + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileDrop({ preventDefault: () => { }, target: { files: [selectedFile] } });
    }
  };

  // Analysis
  const runAnalysis = async () => {
    if (!resumeText) return;
    setAnalyzing(true);
    setError("");
    setProgress(0);
    setAnalysis(null);

    // Fake progress
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 300);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setProgress(100);
      setTimeout(() => {
        setAnalysis(data.analysis);
        setActiveTab("overview");
        setAnalyzing(false);
      }, 500);
    } catch (err) {
      setError("SYSTEM ERROR: " + err.message);
      setAnalyzing(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResumeText("");
    setAnalysis(null);
    setError("");
    setProgress(0);
    setActiveTab("overview");
  };

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <div className="desktop-icon" onClick={() => windowRef.current?.scrollTo(0, 0)}>
          <span className="desktop-icon-img">💼</span>
          <span className="desktop-icon-label">Worth.pk</span>
        </div>
        <div className="desktop-icon">
          <span className="desktop-icon-img">📁</span>
          <span className="desktop-icon-label">My Resume</span>
        </div>
        <div className="desktop-icon">
          <span className="desktop-icon-img">🌐</span>
          <span className="desktop-icon-label">Rozee.pk</span>
        </div>
        <div className="desktop-icon">
          <span className="desktop-icon-img">♻️</span>
          <span className="desktop-icon-label">Recycle Bin</span>
        </div>
      </div>

      {/* Main Window */}
      <div
        className="retro-window"
        style={{
          width: "min(960px, 95vw)",
          transform: `translate(${windowPos.x}px, ${windowPos.y}px)`,
          zIndex: 10,
        }}
      >
        {/* Title Bar */}
        <div className="window-title-bar" onMouseDown={handleMouseDown}>
          <Monitor size={14} color="white" />
          <span className="window-title">
            Worth.pk — Career Market Analyzer v2.26 [Pakistan Edition]
          </span>
          <div className="window-controls">
            <button className="window-btn" title="Minimize">
              <Minus size={10} />
            </button>
            <button className="window-btn" title="Maximize">
              <Square size={9} />
            </button>
            <button className="window-btn" title="Close" onClick={resetAll}>
              <X size={10} />
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="menu-bar">
          <span className="menu-item">File</span>
          <span className="menu-item">Edit</span>
          <span className="menu-item">View</span>
          <span className="menu-item">Analyze</span>
          <span className="menu-item">Help</span>
        </div>

        {/* Body */}
        <div className="window-body" ref={windowRef} style={{ maxHeight: "calc(100vh - 140px)" }}>
          {/* ─── UPLOAD SECTION ─── */}
          {!analysis && !analyzing && (
            <div className="result-panel">
              <div className="section-title">
                <Upload size={16} />
                UPLOAD RESUME
                <span className="section-divider" />
              </div>

              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                id="upload-zone"
              >
                <div className="upload-icon">
                  {file ? "📄" : "📂"}
                </div>
                <div className="upload-text">
                  {file ? "FILE LOADED" : ">> DROP PDF HERE <<"}
                </div>
                <div className="upload-subtext">
                  {file
                    ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                    : "Click or drag your resume PDF to begin analysis"}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-input"
                />
              </div>

              {file && (
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024).toFixed(1)} KB • {resumeText.length} chars extracted
                    </div>
                  </div>
                  <button
                    className="retro-btn primary"
                    onClick={runAnalysis}
                    disabled={!resumeText}
                    id="analyze-btn"
                  >
                    <Zap size={12} style={{ marginRight: 6, display: "inline" }} />
                    ANALYZE
                  </button>
                </div>
              )}

              {error && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "#fff0f0",
                    border: "2px solid #cc0000",
                    fontFamily: "var(--retro-font)",
                    fontSize: 16,
                    color: "#cc0000",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Teaser CRT Monitor */}
              <div style={{ marginTop: 24 }}>
                <div className="section-title">
                  <Monitor size={16} />
                  VALUE METER
                  <span className="section-divider" />
                </div>
                <div className="crt-monitor">
                  <div className="crt-screen">
                    <div className="crt-label">MARKET VALUE</div>
                    <div className="crt-value" style={{ fontSize: 20, opacity: 0.4 }}>
                      AWAITING INPUT...
                    </div>
                    <div className="crt-subtitle">Upload resume to begin scan</div>
                  </div>
                  <div className="crt-led" style={{ background: "#ff0", boxShadow: "0 0 6px #ff0" }} />
                </div>
              </div>

              {/* Teaser Company Cards */}
              <div style={{ marginTop: 24 }}>
                <div className="section-title">
                  <Folder size={16} />
                  COMPANY MATCH
                  <span className="section-divider" />
                </div>
                <div className="company-grid">
                  {Object.entries(COMPANY_PROFILES).map(([name, profile]) => (
                    <div className="company-card locked" key={name}>
                      <span className="lock-icon">
                        <Lock size={14} />
                      </span>
                      <div className="company-icon">{profile.icon}</div>
                      <div className="company-name">{name}</div>
                      <div className="company-status">🔒 LOCKED</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── ANALYZING ─── */}
          {analyzing && (
            <div className="result-panel" style={{ textAlign: "center", padding: 40 }}>
              <div className="crt-monitor" style={{ maxWidth: 500, margin: "0 auto 24px" }}>
                <div className="crt-screen">
                  <div className="crt-label">SCANNING RESUME</div>
                  <div className="crt-value" style={{ fontSize: 16 }}>
                    ANALYZING...
                  </div>
                  <div className="crt-subtitle">
                    <span className="loading-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
                <div className="crt-led" />
              </div>

              <div className="progress-container" style={{ maxWidth: 500, margin: "0 auto" }}>
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p
                style={{
                  fontFamily: "var(--retro-font)",
                  fontSize: 16,
                  marginTop: 8,
                  color: "#808080",
                }}
              >
                {progress < 30
                  ? "Parsing resume data..."
                  : progress < 60
                    ? "Cross-referencing with Pakistan job market..."
                    : progress < 90
                      ? "Calculating market value..."
                      : "Finalizing report..."}
              </p>
            </div>
          )}

          {/* ─── RESULTS ─── */}
          {analysis && !analyzing && (
            <div className="result-panel">
              {/* Tabs */}
              <div className="tab-bar">
                {[
                  { id: "overview", label: "OVERVIEW", icon: <Target size={10} /> },
                  { id: "salary", label: "SALARY", icon: <TrendingUp size={10} /> },
                  { id: "companies", label: "COMPANIES", icon: <Briefcase size={10} /> },
                  { id: "skills", label: "SKILLS", icon: <Cpu size={10} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                    id={`tab-${tab.id}`}
                  >
                    {tab.icon}
                    &nbsp;{tab.label}
                  </button>
                ))}
              </div>

              {/* ─── OVERVIEW TAB ─── */}
              {activeTab === "overview" && (
                <div className="result-panel">
                  {/* Value Meter */}
                  <div className="crt-monitor" style={{ marginBottom: 20 }}>
                    <div className="crt-screen">
                      <div className="crt-label">YOUR MARKET VALUE — PAKISTAN 2026</div>
                      <div className="crt-value">
                        {formatPKR(analysis.salaryEstimates?.Islamabad?.predicted)}
                      </div>
                      <div className="crt-subtitle">
                        /month • Islamabad Estimate • {analysis.detectedRole}
                      </div>
                    </div>
                    <div className="crt-led" />
                  </div>

                  {/* Quick Stats */}
                  <div className="analysis-grid">
                    <div className="inner-panel">
                      <div className="inner-panel-title">PROFILE</div>
                      <div style={{ marginTop: 8 }}>
                        <p style={{ fontFamily: "var(--pixel-font)", fontSize: 10, marginBottom: 6 }}>
                          <Trophy size={12} style={{ display: "inline", marginRight: 4 }} />
                          {analysis.candidateName}
                        </p>
                        <p style={{ fontFamily: "var(--retro-font)", fontSize: 18, marginBottom: 4 }}>
                          <strong>Role:</strong> {analysis.detectedRole}
                        </p>
                        <p style={{ fontFamily: "var(--retro-font)", fontSize: 18, marginBottom: 4 }}>
                          <strong>Level:</strong> {analysis.experienceLevel}
                        </p>
                        <p style={{ fontFamily: "var(--retro-font)", fontSize: 18 }}>
                          <strong>Skills Detected:</strong> {analysis.skills?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="inner-panel">
                      <div className="inner-panel-title">MARKET READINESS</div>
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--pixel-font)",
                            fontSize: 36,
                            color:
                              analysis.marketReadiness >= 70
                                ? "#00aa00"
                                : analysis.marketReadiness >= 40
                                  ? "#cc8800"
                                  : "#cc0000",
                            marginBottom: 4,
                          }}
                        >
                          {analysis.marketReadiness}/100
                        </div>
                        <div className="progress-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${analysis.marketReadiness}%`,
                              background:
                                analysis.marketReadiness >= 70
                                  ? "repeating-linear-gradient(-45deg, #00aa00, #00aa00 8px, #00cc00 8px, #00cc00 16px)"
                                  : undefined,
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontFamily: "var(--retro-font)",
                            fontSize: 14,
                            color: "#808080",
                            marginTop: 6,
                          }}
                        >
                          {analysis.marketReadiness >= 80
                            ? "🔥 Highly Competitive"
                            : analysis.marketReadiness >= 60
                              ? "👍 Market Ready"
                              : analysis.marketReadiness >= 40
                                ? "⚡ Needs Improvement"
                                : "🚧 Early Stage"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      marginTop: 16,
                      padding: "14px",
                      border: "2px inset var(--win-border-dark)",
                      background: "#fffff0",
                      fontFamily: "var(--retro-font)",
                      fontSize: 18,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ fontFamily: "var(--pixel-font)", fontSize: 9 }}>
                      📋 AI ASSESSMENT:
                    </strong>
                    <br />
                    {analysis.summary}
                  </div>

                  {/* Recommendations */}
                  <div style={{ marginTop: 16 }}>
                    <div className="section-title">
                      <Star size={16} />
                      RECOMMENDATIONS
                      <span className="section-divider" />
                    </div>
                    <ul className="recommendation-list">
                      {analysis.recommendations?.map((rec, i) => (
                        <li className="recommendation-item" key={i}>
                          <span className="recommendation-bullet">
                            <ChevronRight size={14} />
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <button className="retro-btn" onClick={resetAll} id="new-scan-btn">
                      🔄 NEW SCAN
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SALARY TAB ─── */}
              {activeTab === "salary" && (
                <div className="result-panel">
                  <div className="section-title">
                    <MapPin size={16} />
                    SALARY ESTIMATES BY CITY — 2026
                    <span className="section-divider" />
                  </div>

                  <div className="city-grid">
                    {["Karachi", "Lahore", "Islamabad"].map((city) => {
                      const est = analysis.salaryEstimates?.[city];
                      return (
                        <div className="city-card" key={city}>
                          <div className="city-name">
                            <MapPin size={10} style={{ display: "inline", marginRight: 2 }} />
                            {city}
                          </div>
                          <div className="city-salary">{formatPKR(est?.predicted)}</div>
                          <div className="city-range">
                            {formatPKR(est?.min)} — {formatPKR(est?.max)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Full CRT for highest city */}
                  <div style={{ marginTop: 20 }}>
                    <div className="crt-monitor">
                      <div className="crt-screen">
                        <div className="crt-label">PEAK EARNING POTENTIAL</div>
                        <div className="crt-value">
                          {formatPKR(
                            Math.max(
                              analysis.salaryEstimates?.Karachi?.predicted || 0,
                              analysis.salaryEstimates?.Lahore?.predicted || 0,
                              analysis.salaryEstimates?.Islamabad?.predicted || 0
                            )
                          )}
                        </div>
                        <div className="crt-subtitle">
                          /month •{" "}
                          {(() => {
                            const cities = analysis.salaryEstimates;
                            const max = Math.max(
                              cities?.Karachi?.predicted || 0,
                              cities?.Lahore?.predicted || 0,
                              cities?.Islamabad?.predicted || 0
                            );
                            if (max === (cities?.Islamabad?.predicted || 0)) return "Islamabad";
                            if (max === (cities?.Karachi?.predicted || 0)) return "Karachi";
                            return "Lahore";
                          })()}{" "}
                          • {analysis.detectedRole}
                        </div>
                      </div>
                      <div className="crt-led" />
                    </div>
                  </div>

                  {/* Yearly estimate */}
                  <div
                    style={{
                      marginTop: 16,
                      padding: 14,
                      background: "#f0fff0",
                      border: "2px inset var(--win-border-dark)",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontFamily: "var(--pixel-font)", fontSize: 9, marginBottom: 6 }}>
                      ESTIMATED ANNUAL (ISLAMABAD)
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--pixel-font)",
                        fontSize: 20,
                        color: "#006600",
                      }}
                    >
                      {formatPKR((analysis.salaryEstimates?.Islamabad?.predicted || 0) * 12)}
                    </p>
                    <p style={{ fontFamily: "var(--retro-font)", fontSize: 14, color: "#888" }}>
                      per year (12 months)
                    </p>
                  </div>
                </div>
              )}

              {/* ─── COMPANIES TAB ─── */}
              {activeTab === "companies" && (
                <div className="result-panel">
                  <div className="section-title">
                    <Briefcase size={16} />
                    COMPANY COMPATIBILITY
                    <span className="section-divider" />
                  </div>

                  <div className="company-grid">
                    {Object.entries(COMPANY_PROFILES).map(([name, profile]) => {
                      const match = analysis.companyMatches?.[name];
                      const isUnlocked = match?.matched;

                      return (
                        <div
                          className={`company-card ${isUnlocked ? "unlocked" : "locked"}`}
                          key={name}
                        >
                          <span className="lock-icon">
                            {isUnlocked ? (
                              <Unlock size={14} color="#39ff14" />
                            ) : (
                              <Lock size={14} />
                            )}
                          </span>
                          <div className="company-icon">{profile.icon}</div>
                          <div className="company-name">{name}</div>
                          <div className="company-status">
                            {isUnlocked ? "✅ MATCH" : "🔒 LOCKED"}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--pixel-font)",
                              fontSize: 14,
                              marginTop: 6,
                              color: isUnlocked ? "#006600" : "#888",
                            }}
                          >
                            {match?.matchScore || 0}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed company breakdown */}
                  {Object.entries(COMPANY_PROFILES).map(([name, profile]) => {
                    const match = analysis.companyMatches?.[name];
                    return (
                      <div key={name} style={{ marginTop: 16 }}>
                        <div className="inner-panel">
                          <div className="inner-panel-title">
                            {profile.icon} {name}
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--retro-font)",
                              fontSize: 15,
                              color: "#666",
                              marginTop: 8,
                              marginBottom: 8,
                            }}
                          >
                            {profile.description}
                          </p>

                          <p
                            style={{
                              fontFamily: "var(--pixel-font)",
                              fontSize: 8,
                              marginBottom: 4,
                            }}
                          >
                            MATCHED SKILLS:
                          </p>
                          <div style={{ marginBottom: 8 }}>
                            {match?.matchedSkills?.length > 0 ? (
                              match.matchedSkills.map((s) => (
                                <span className="skill-tag matched" key={s}>
                                  ✓ {s}
                                </span>
                              ))
                            ) : (
                              <span
                                style={{
                                  fontFamily: "var(--retro-font)",
                                  fontSize: 14,
                                  color: "#999",
                                }}
                              >
                                No matching skills detected
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              fontFamily: "var(--pixel-font)",
                              fontSize: 8,
                              marginBottom: 4,
                            }}
                          >
                            MISSING SKILLS:
                          </p>
                          <div>
                            {match?.missingSkills?.map((s) => (
                              <span className="skill-tag missing" key={s}>
                                ✗ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ─── SKILLS TAB ─── */}
              {activeTab === "skills" && (
                <div className="result-panel">
                  <div className="section-title">
                    <Cpu size={16} />
                    DETECTED SKILLS
                    <span className="section-divider" />
                  </div>

                  <div className="inner-panel" style={{ marginBottom: 16 }}>
                    <div className="inner-panel-title">YOUR STACK</div>
                    <div style={{ marginTop: 8 }}>
                      {analysis.skills?.map((skill) => (
                        <span className="skill-tag matched" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills needed per company */}
                  <div className="section-title">
                    <Target size={16} />
                    SKILLS TO LEARN
                    <span className="section-divider" />
                  </div>

                  {Object.entries(analysis.companyMatches || {}).map(([name, match]) => {
                    if (!match?.missingSkills?.length) return null;
                    return (
                      <div key={name} style={{ marginBottom: 12 }}>
                        <p
                          style={{
                            fontFamily: "var(--pixel-font)",
                            fontSize: 8,
                            marginBottom: 4,
                          }}
                        >
                          FOR {name.toUpperCase()}:
                        </p>
                        <div>
                          {match.missingSkills.map((s) => (
                            <span className="skill-tag missing" key={s}>
                              ✗ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Recommendations */}
                  <div style={{ marginTop: 16 }}>
                    <div className="section-title">
                      <Star size={16} />
                      GROWTH RECOMMENDATIONS
                      <span className="section-divider" />
                    </div>
                    <ul className="recommendation-list">
                      {analysis.recommendations?.map((rec, i) => (
                        <li className="recommendation-item" key={i}>
                          <span className="recommendation-bullet">
                            <ChevronRight size={14} />
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-section" style={{ flex: 2 }}>
            {analysis
              ? `✅ Analysis complete — ${analysis.skills?.length || 0} skills detected`
              : file
                ? `📄 ${file.name} loaded`
                : "Ready — Upload a resume to begin"}
          </div>
          <div className="status-section">
            <Wifi size={12} style={{ display: "inline", marginRight: 4 }} />
            Connected
          </div>
          <div className="status-section">v2.26</div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-button" id="start-btn">
          <span className="start-icon" />
          START
        </button>
        <div
          style={{
            height: 28,
            padding: "0 10px",
            border: "2px inset var(--win-border-dark)",
            display: "flex",
            alignItems: "center",
            fontFamily: "var(--pixel-font)",
            fontSize: 7,
            background: "#d4d0c8",
          }}
        >
          <Monitor size={12} style={{ marginRight: 4 }} />
          Worth.pk
        </div>
        <div className="taskbar-clock">
          <Volume2 size={12} style={{ marginRight: 6 }} />
          {clock}
        </div>
      </div>
    </div>
  );
}
