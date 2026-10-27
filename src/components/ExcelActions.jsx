import React, { useRef, useState } from 'react';

const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>;
const UploadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>;
const TemplateIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>;

const AsyncButton = ({ onClick, children, icon, disabled = false, title }) => {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { await onClick(); } finally { setBusy(false); }
  };
  return <button type="button" className="btn btn-secondary" onClick={run} disabled={disabled || busy} title={title}>{icon}{busy ? 'Preparing…' : children}</button>;
};

export function ExcelDownloadButton({ onDownload, label = 'Download Excel', disabled = false }) {
  return <AsyncButton onClick={onDownload} icon={<DownloadIcon />} disabled={disabled}>{label}</AsyncButton>;
}

export function ExcelTemplateButton({ onDownload, disabled = false }) {
  return <AsyncButton onClick={onDownload} icon={<TemplateIcon />} disabled={disabled} title="Download a blank Excel workbook with the required headers">Download Template</AsyncButton>;
}

export function ExcelUploadButton({ onUpload, onError, disabled = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const select = () => inputRef.current?.click();
  const changed = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try { await onUpload(file); } catch (error) { onError?.(error.message || 'Unable to read the workbook.'); } finally { setBusy(false); }
  };
  return <>
    <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={changed} hidden />
    <button type="button" className="btn btn-secondary" onClick={select} disabled={disabled || busy}><UploadIcon />{busy ? 'Reading…' : 'Upload Excel'}</button>
  </>;
}
