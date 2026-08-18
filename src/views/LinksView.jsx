import React, { useState } from 'react';
import { PlusIcon, CopyIcon, ExternalLinkIcon, CheckIcon, TrashIcon } from '../components/Icons';
import Pagination from '../components/Pagination';

export default function LinksView({ feedbackLinks, customers, getCustName, onNewLink, onDeleteLink, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const itemsPerPage = 6;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLinks = feedbackLinks.slice(indexOfFirstItem, indexOfLastItem);

  const getFullPublicUrl = (token) => {
    return `${window.location.protocol}//${window.location.host}/feedback/${token}`;
  };

  const handleCopyLink = (token, id) => {
    const url = getFullPublicUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback Link Tokens</h1>
          <p className="page-subtitle">
            Sharable public invitation links for collecting customer voice complaints
            {searchQuery && <span className="search-hint">Filtering: "{searchQuery}" — {feedbackLinks.length} result{feedbackLinks.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onNewLink}>
          <PlusIcon size={14} /> Generate Token
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {feedbackLinks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔗</span>
            <div className="empty-state-msg">No tokens match "{searchQuery}"</div>
            <div className="empty-state-sub">Generate a token or adjust your search</div>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Token ID</th>
                    <th>Status</th>
                    <th>Sharable Public Feedback Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLinks.map((l, idx) => {
                    const publicUrl = getFullPublicUrl(l.token);
                    const isCopied = copiedId === (l._id || l.id);
                    return (
                      <tr key={l._id || l.id || idx}>
                        <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', width: '40px' }}>
                          {indexOfFirstItem + idx + 1}
                        </td>
                        <td>
                          <div className="entity-cell">
                            <div className="entity-initial">{(getCustName(l.customerId) || '?')[0]}</div>
                            <strong>{getCustName(l.customerId)}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="token-pill">{(l.token || '').substring(0, 16)}…</span>
                        </td>
                        <td>
                          <span className={`stat-badge ${l.status === 'SUBMITTED' ? 'badge-green' : 'badge-amber'}`}>
                            {l.status === 'SUBMITTED' ? '● Submitted' : '○ Pending'}
                          </span>
                        </td>
                        <td style={{ maxWidth: '340px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#F4F4F5',
                            border: 'var(--border)',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {publicUrl}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className={`btn btn-sm ${isCopied ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => handleCopyLink(l.token, l._id || l.id)}
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Copy sharable public link to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon size={13} /> Copied!
                                </>
                              ) : (
                                <>
                                  <CopyIcon size={13} /> Copy Link
                                </>
                              )}
                            </button>
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Open public link in new tab"
                            >
                              Open <ExternalLinkIcon size={13} />
                            </a>
                            {onDeleteLink && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => onDeleteLink(l._id || l.id)}
                                title="Delete feedback link token"
                              >
                                <TrashIcon size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={feedbackLinks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={page => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
