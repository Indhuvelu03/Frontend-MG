import React, { useState } from "react";
import { PlusIcon, CpuIcon, TrashIcon } from "../components/Icons";
import Pagination from "../components/Pagination";

const rawApiBase = import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE = rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase.replace(/\/$/, "")}/api`;

const getLanguageBadge = (lang) => {
  switch (String(lang || "en").toLowerCase()) {
    case "hi": return { label: "🇮🇳 Hindi", class: "badge-purple" };
    case "ta": return { label: "🇮🇳 Tamil", class: "badge-purple" };
    case "te": return { label: "🇮🇳 Telugu", class: "badge-purple" };
    case "kn": return { label: "🇮🇳 Kannada", class: "badge-purple" };
    case "ml": return { label: "🇮🇳 Malayalam", class: "badge-purple" };
    default:   return { label: "🇬🇧 English", class: "badge-blue" };
  }
};

export default function ComplaintsView({ complaints = [], getCustName, onUploadInvoice, onDeleteVoiceNote, onDeleteInvoicePdf, onServiceStatusChange, setActiveTab, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaintId, setSelectedComplaintId] = useState("all");
  const itemsPerPage = 3;

  const visibleComplaints = selectedComplaintId === "all"
    ? complaints
    : complaints.filter(c => c._id === selectedComplaintId);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = visibleComplaints.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Voice Complaints &amp; Service Invoices</h1>
          <p className="page-subtitle">
            Multilingual customer audio recordings cross-referenced against uploaded repair invoice PDFs
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {complaints.length} result{complaints.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onUploadInvoice}>
          <PlusIcon size={14} /> Upload Invoice PDF
        </button>
      </div>

      {complaints.length > 0 && (
        <div className="card" style={{ padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <label className="form-label" htmlFor="complaint-record" style={{ margin: 0, whiteSpace: "nowrap" }}>View customer record</label>
          <select
            id="complaint-record"
            className="form-select"
            value={selectedComplaintId}
            onChange={event => {
              setSelectedComplaintId(event.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: "420px", flex: "1 1 280px" }}
          >
            <option value="all">All submitted feedback records ({complaints.length})</option>
            {complaints.map(complaint => (
              <option key={complaint._id} value={complaint._id}>
                {complaint.vehicleNumber} — {getCustName(complaint.customerId)}
              </option>
            ))}
          </select>
        </div>
      )}

      {visibleComplaints.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">🎙️</span>
            <div className="empty-state-msg">No complaints match "{searchQuery}"</div>
            <div className="empty-state-sub">Try searching by vehicle number or customer name</div>
          </div>
        </div>
      ) : (
        <>
          {currentComplaints.map(c => {
            const audit = c.aiComparison;
            const score = audit?.matchPercentage;
            const conclusion = audit?.conclusion?.replaceAll("_", " ") || "PROCESSING";
            const badgeClass = audit?.conclusion === "FULL_MATCH" ? "badge-green" : audit?.conclusion === "MISMATCH" ? "badge-coral" : "badge-amber";
            
            const rawAudioUrl = c.audioUrl || c.audio_url || c.voiceNoteUrl || c.audio;
            const hasValidAudio = Boolean(rawAudioUrl && typeof rawAudioUrl === "string" && rawAudioUrl.trim().length > 5);
            const audioStreamUrl = hasValidAudio ? rawAudioUrl : null;
            const pdfReportUrl = c.aiComparison?.reportUrl || c.ai_comparison?.report_url || null;
            const langBadge = getLanguageBadge(c.language);

            return (
              <div className="card" key={c._id}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      <span style={{ fontFamily: "monospace", background: "var(--primary-soft)", padding: "0.15rem 0.5rem", borderRadius: 0, fontSize: "0.875rem" }}>
                        {c.vehicleNumber}
                      </span>
                    </h3>
                    <span className="card-subtitle">Customer: {getCustName(c.customerId)}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select
                      className="form-select"
                      aria-label={`Service stage for ${c.vehicleNumber}`}
                      value={c.serviceStatus || c.service_status || "COMPLAINT_RECEIVED"}
                      onChange={event => onServiceStatusChange?.(c._id, event.target.value)}
                      style={{ width: "170px", padding: "0.28rem 0.45rem", fontSize: "0.72rem" }}
                    >
                      <option value="COMPLAINT_RECEIVED">Complaint received</option>
                      <option value="UNDER_REVIEW">Under review</option>
                      <option value="SERVICE_STARTED">Service started</option>
                      <option value="INVOICE_UPLOADED">Invoice uploaded</option>
                      <option value="AUDIT_COMPLETE">Audit complete</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <span className={`stat-badge ${langBadge.class}`}>{langBadge.label}</span>
                    <span className={`stat-badge ${badgeClass}`}>{conclusion}</span>
                    {audit && <span className={`stat-badge ${badgeClass}`}>{score}%</span>}
                  </div>
                </div>

                <div className="complaint-grid">
                  {/* Customer Voice Recording */}
                  <div>
                    <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Customer Audio Recording</span>
                      {hasValidAudio && onDeleteVoiceNote && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.15rem 0.45rem", color: "var(--coral)", borderColor: "var(--coral-border)" }}
                          onClick={() => onDeleteVoiceNote(c._id)}
                          title="Delete voice recording"
                        >
                          <TrashIcon size={12} /> Delete Voice Note
                        </button>
                      )}
                    </div>

                    <div className="audio-preview-box">
                      {hasValidAudio ? (
                        <audio
                          controls
                          src={audioStreamUrl}
                          style={{ width: "100%", marginBottom: "0.75rem" }}
                          preload="metadata"
                        />
                      ) : (
                        <div style={{ padding: "0.75rem 1rem", background: "#F4F4F5", border: "1px solid #E4E4E7", borderRadius: "6px", fontSize: "0.8rem", color: "#71717A", fontStyle: "italic", marginBottom: "0.75rem" }}>
                          Written feedback submission (no voice recording attached)
                        </div>
                      )}
                      
                      <p className="transcript-text">"{c.transcript || 'No transcript text available.'}"</p>
                      
                      {c.englishTranscript && c.englishTranscript !== c.transcript && (
                        <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.8rem", background: "var(--primary-soft)", borderLeft: "3px solid var(--primary-accent)", fontSize: "0.8rem", color: "var(--text-main)" }}>
                          <strong>English Translation (for AI Audit):</strong>
                          <p style={{ margin: "0.25rem 0 0 0", fontStyle: "italic" }}>"{c.englishTranscript}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Match Result */}
                  <div>
                    <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>AI Semantic Audit Result</span>
                      {onDeleteInvoicePdf && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.15rem 0.45rem", color: "var(--coral)", borderColor: "var(--coral-border)" }}
                          onClick={() => onDeleteInvoicePdf(c._id)}
                          title="Delete wrongly uploaded repair invoice PDF"
                        >
                          <TrashIcon size={12} /> Delete Wrong PDF
                        </button>
                      )}
                    </div>
                    <div className="match-result-box">
                      <div className="match-score-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <CpuIcon size={15} />
                          <span className="match-label">Match Score</span>
                        </div>
                        <span className="stat-badge badge-green" style={{ fontSize: "0.85rem", padding: "0.25rem 0.65rem" }}>
                          {audit ? `${score}%` : "—"}
                        </span>
                      </div>
                      <p className="match-analysis">
                        {audit?.analysis || "Waiting for transcription, OCR, and the AI evidence comparison to complete."}
                      </p>
                      {audit?.matchedItems?.length > 0 && (
                        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                          {audit.matchedItems.map((item, i) => (
                            <span key={i} className="stat-badge badge-green">✓ {item.invoiceItem || item}</span>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveTab("comparison")}
                        >
                          Full Audit Report →
                        </button>
                        <a
                          href={pdfReportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          download={`audit_report_${c.vehicleNumber}.pdf`}
                          style={{ textDecoration: "none" }}
                        >
                          📥 Download PDF Report
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <Pagination
              currentPage={currentPage}
              totalItems={visibleComplaints.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
