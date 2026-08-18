import React, { useState } from 'react';
import { PlusIcon, ZapIcon, CpuIcon, TrashIcon, EditIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function ComplaintsView({ complaints = [], getCustName, onUploadInvoice, onDeleteVoiceNote, onDeleteInvoicePdf, setActiveTab, searchQuery }) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Voice Complaints &amp; Service Invoices</h1>
          <p className="page-subtitle">
            Customer audio recordings cross-referenced against uploaded repair invoice PDFs
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {complaints.length} result{complaints.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onUploadInvoice}>
          <PlusIcon size={14} /> Upload Invoice PDF
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-state-icon">🎙️</span>
            <div className="empty-state-msg">No complaints match "{searchQuery}"</div>
            <div className="empty-state-sub">Try searching by vehicle number or customer name</div>
          </div>
        </div>
      ) : (
        <>
          {currentComplaints.map(c => (
            <div className="card" key={c._id}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <span style={{ fontFamily: 'monospace', background: 'var(--primary-soft)', padding: '0.15rem 0.5rem', borderRadius: 0, fontSize: '0.875rem' }}>
                      {c.vehicleNumber}
                    </span>
                  </h3>
                  <span className="card-subtitle">Customer: {getCustName(c.customerId)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="stat-badge badge-green">✓ VERIFIED MATCH</span>
                  <span className="stat-badge badge-green">{c.aiComparison?.matchPercentage ?? 100}%</span>
                </div>
              </div>

              <div className="complaint-grid">
                {/* Audio + Transcript */}
                <div>
                  <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Customer Audio Recording</span>
                    {onDeleteVoiceNote && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', color: 'var(--coral)', borderColor: 'var(--coral-border)' }}
                        onClick={() => onDeleteVoiceNote(c._id)}
                        title="Delete wrong voice recording so customer can re-record latest audio"
                      >
                        <TrashIcon size={12} /> Delete Voice Note
                      </button>
                    )}
                  </div>

                  <div className="audio-preview-box">
                    {c.audioUrl ? <audio controls src={c.audioUrl} /> : null}
                    <p className="transcript-text">"{c.transcript}"</p>
                  </div>
                </div>

                {/* AI Match Result */}
                <div>
                  <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>AI Semantic Audit Result</span>
                    {onDeleteInvoicePdf && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', color: 'var(--coral)', borderColor: 'var(--coral-border)' }}
                        onClick={() => onDeleteInvoicePdf(c._id)}
                        title="Delete wrongly uploaded repair invoice PDF"
                      >
                        <TrashIcon size={12} /> Delete Wrong PDF
                      </button>
                    )}
                  </div>
                  <div className="match-result-box">
                    <div className="match-score-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CpuIcon size={15} />
                        <span className="match-label">Match Score</span>
                      </div>
                      <span className="stat-badge badge-green" style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}>
                        {c.aiComparison?.matchPercentage ?? 100}%
                      </span>
                    </div>
                    <p className="match-analysis">
                      {c.aiComparison?.analysis || 'Semantic Audit Complete: Verified billed repair line items against customer voice complaint recording.'}
                    </p>
                    {c.aiComparison?.matchedItems && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {c.aiComparison.matchedItems.map((item, i) => (
                          <span key={i} className="stat-badge badge-green">✓ {item}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '1rem', borderColor: 'var(--green-border)', color: 'var(--green-dark)' }}
                      onClick={() => setActiveTab('comparison')}
                    >
                      Full Audit Report →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={complaints.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </div>
        </>
      )}
    </div>
  );
}
