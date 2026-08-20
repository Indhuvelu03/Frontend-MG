import React, { useState, useEffect, useRef } from 'react';
import { ZapIcon, MicIcon, CheckIcon, CarIcon, LockIcon, FolderIcon, AlertTriangleIcon } from '../components/Icons';

export default function PublicFeedbackView({ token, customers = [], feedbackLinks = [] }) {
  const [audioMode, setAudioMode] = useState('record'); // 'record' | 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLinkDisabled, setIsLinkDisabled] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [inputVehicleNumber, setInputVehicleNumber] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // 1. Validate token with backend on mount
  useEffect(() => {
    if (!token) return;

    fetch(`/api/feedback-links/${token}`)
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) {
          setTokenData(d.data);
          const cust = d.data.customerId || d.data.customer;
          if (cust?.vehicleNumber || cust?.vehicle_number) {
            setInputVehicleNumber(cust.vehicleNumber || cust.vehicle_number);
          }
          if (d.data.status === 'SUBMITTED') {
            setIsLinkDisabled(true);
            setDisabledMessage('This single-use feedback link has already been used to submit response and is now disabled.');
          }
        } else if (d.message?.includes('already been used') || d.message?.includes('disabled')) {
          setIsLinkDisabled(true);
          setDisabledMessage(d.message);
        }
      })
      .catch(() => {});
  }, [token]);

  // Resolved Customer Info
  const link = tokenData || (feedbackLinks || []).find(l => l.token === token || l._id === token);
  const customer = link?.customerId || link?.customer || (customers || []).find(c => c._id === link?.customerId) || (customers || [])[0];

  const vehicleInfo = {
    owner: customer?.name || 'Registered Customer',
    vehicleNumber: customer?.vehicleNumber || customer?.vehicle_number || 'KA01AB1234',
    model: customer?.vehicleModel || customer?.vehicle_model || '',
    serviceCenter: customer?.serviceCenter || customer?.service_center || 'Service Center Branch',
    date: customer?.serviceDate ? new Date(customer.serviceDate).toLocaleDateString() : new Date().toLocaleDateString(),
  };

  // ── Audio Recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Microphone access was denied or not available. Please switch to file upload mode.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setErrorMessage('');
    }
  };

  // ── Submit Feedback ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetVehicle = inputVehicleNumber || vehicleInfo.vehicleNumber;
    if (!targetVehicle) {
      setErrorMessage('Vehicle number is required for verification.');
      return;
    }

    let fileToSend = null;
    if (audioMode === 'record' && recordedBlob) {
      fileToSend = new File([recordedBlob], `complaint_${Date.now()}.mp3`, { type: 'audio/mp3' });
    } else if (audioMode === 'upload' && uploadedFile) {
      fileToSend = uploadedFile;
    }

    if (!fileToSend && notes.trim().length < 10) {
      setErrorMessage('Please provide a short written feedback or a voice recording.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('vehicleNumber', targetVehicle);
      if (fileToSend) formData.append('audio', fileToSend);
      if (notes.trim()) formData.append('feedbackText', notes.trim());

      const res = await fetch(`/api/public/feedback/${token}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setIsLinkDisabled(true);
      } else {
        setErrorMessage(data.message || 'Submission failed. Please check the vehicle number.');
        if (data.message?.includes('already been used') || data.message?.includes('disabled')) {
          setIsLinkDisabled(true);
          setDisabledMessage(data.message);
        }
      }
    } catch {
      setErrorMessage('Unable to submit feedback right now. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAudio = (audioMode === 'record' && recordedBlob) || (audioMode === 'upload' && uploadedFile);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 48%, #ecfdf5 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2.5rem 1rem',
      fontFamily: 'var(--font)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '580px',
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '40px', height: '40px', background: 'rgba(255,255,255,.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,.25)', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ZapIcon size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>AutoAudit AI</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.82, marginTop: '0.15rem' }}>Secure service feedback portal</div>
          </div>
        </div>

        {isLinkDisabled && !submitted ? (
          /* Locked / Link Disabled Screen */
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '58px', height: '58px', background: 'var(--amber-bg)', color: 'var(--amber-dark)',
              border: '1px solid var(--amber-border)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <LockIcon size={26} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>Link Disabled (Single-Use Only)</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              {disabledMessage || 'This feedback link has already been used to submit response and was disabled immediately.'}
            </p>
            <div style={{
              marginTop: '1.75rem', padding: '0.85rem', background: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              <LockIcon size={14} /> Token: <code>{token ? token.substring(0, 16) : 'tok_...'}…</code> · Status: DISABLED
            </div>
          </div>
        ) : submitted ? (
          /* Success Screen */
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '54px', height: '54px', background: 'var(--green-bg)', color: 'var(--green)',
              border: '1px solid var(--green-border)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <CheckIcon size={28} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>Feedback Submitted!</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Thank you! Your feedback for vehicle <strong>{inputVehicleNumber || vehicleInfo.vehicleNumber}</strong> has been received {hasAudio ? 'and queued for voice transcription' : 'as written feedback'} for invoice auditing.
            </p>
            <div style={{
              marginTop: '1.25rem', padding: '0.75rem', background: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              <LockIcon size={14} /> Link status: Immediately disabled (Single-use security token).
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ color: '#2563eb', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Step 1 of 1 - Share feedback</div>
              <h1 style={{ margin: '0.35rem 0 0.4rem', color: '#0f172a', fontSize: '1.55rem', letterSpacing: '-.04em' }}>Tell us how your service went</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '.9rem', lineHeight: 1.6 }}>Write your feedback, record a voice note, or use both. It takes less than two minutes.</p>
            </div>
            {/* Vehicle Card */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px',
              marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem',
            }}>
              <div style={{
                width: '42px', height: '42px', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-main)', flexShrink: 0,
              }}>
                <CarIcon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Vehicle Service Record
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '0.1rem' }}>
                  {vehicleInfo.vehicleNumber}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  Customer: {vehicleInfo.owner} {vehicleInfo.model ? `(${vehicleInfo.model})` : ''}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600, marginTop: '0.15rem' }}>
                  {vehicleInfo.serviceCenter} · {vehicleInfo.date}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem', background: 'var(--coral-bg)', border: '1px solid var(--coral-border)',
                fontSize: '0.8rem', color: 'var(--coral-dark)', fontWeight: 700, marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <AlertTriangleIcon size={14} /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ color: '#334155', marginBottom: '.45rem' }}>Confirm your vehicle number</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ borderRadius: '10px', padding: '.8rem .9rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.04em' }}
                  value={inputVehicleNumber}
                  onChange={e => setInputVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KA01AB1234"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <label className="form-label" style={{ marginBottom: '0.6rem' }}>
                  Voice feedback <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>(optional)</span>
                </label>

                {/* Input Method Switcher Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`btn ${audioMode === 'record' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAudioMode('record')}
                    style={{ fontSize: '0.8rem', padding: '0.62rem', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <MicIcon size={14} /> Record Live
                  </button>
                  <button
                    type="button"
                    className={`btn ${audioMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAudioMode('upload')}
                    style={{ fontSize: '0.8rem', padding: '0.62rem', borderRadius: '9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <FolderIcon size={14} /> Upload Audio File
                  </button>
                </div>

                {/* MODE A: Live Microphone Recording */}
                {audioMode === 'record' && (
                  <div style={{
                    background: '#fff', border: '1px dashed #93c5fd', borderRadius: '12px', padding: '1.5rem 1rem',
                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '1rem',
                  }}>
                    {isRecording ? (
                      <>
                        <div style={{
                          width: '58px', height: '58px', background: 'var(--coral-bg)', color: 'var(--coral)',
                          border: '1px solid var(--coral-border)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', animation: 'pulse-coral 1.2s ease-in-out infinite',
                        }}>
                          <MicIcon size={24} />
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 900, color: 'var(--coral)' }}>
                          Recording {formatTime(recordTime)}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={stopRecording}
                          style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}
                        >
                          Stop Recording
                        </button>
                      </>
                    ) : recordedBlob ? (
                      <>
                        <div style={{
                          width: '48px', height: '48px', background: 'var(--green-bg)', color: 'var(--green)',
                          border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <CheckIcon size={22} />
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green-dark)' }}>
                          Voice Recording Ready ({formatTime(recordTime || 14)})
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={startRecording}>
                          Re-record Live Audio
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '54px', height: '54px', background: 'var(--primary-soft)', color: 'var(--text-main)',
                          border: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <MicIcon size={22} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Optional: speak your repair requests or upload a voice note
                        </div>
                        <button type="button" className="btn btn-primary" onClick={startRecording}>
                          <MicIcon size={14} /> Start Voice Recording
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* MODE B: Upload MP3 File */}
                {audioMode === 'upload' && (
                  <div style={{
                    background: '#fff', border: '1px dashed #93c5fd', borderRadius: '12px', padding: '1.5rem 1rem',
                    textAlign: 'center', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '1rem',
                  }}>
                    {uploadedFile ? (
                      <>
                        <div style={{
                          width: '48px', height: '48px', background: 'var(--green-bg)', color: 'var(--green)',
                          border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <CheckIcon size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green-dark)' }}>
                            {uploadedFile.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {(uploadedFile.size / 1024).toFixed(1)} KB · Audio file selected
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setUploadedFile(null)}
                        >
                          Choose Different File
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '54px', height: '54px', background: 'var(--primary-soft)', color: 'var(--text-main)',
                          border: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FolderIcon size={24} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Upload pre-recorded audio file (.mp3, .mpeg, .wav, .m4a, .ogg)
                        </div>
                        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FolderIcon size={14} /> Choose Audio File
                          <input
                            type="file"
                            accept="audio/*,.mp3,.mpeg,.mp4,.m4a,.wav,.ogg,.aac,.webm"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Primary written feedback */}
              <div className="form-group" style={{ marginBottom: '1.35rem' }}>
                <label className="form-label" htmlFor="public-notes">Describe your service feedback <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>(optional if voice is provided)</span></label>
                <textarea
                  id="public-notes"
                  className="form-input"
                  style={{ height: '105px', resize: 'vertical', fontFamily: 'var(--font)', borderRadius: '10px', padding: '.8rem .9rem', lineHeight: 1.5 }}
                  placeholder="Example: Please inspect front brake noise, AC cooling, and engine oil level."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Choose text, voice, or both. Please provide at least one feedback method.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '0.9rem', fontSize: '0.95rem', borderRadius: '10px', boxShadow: '0 8px 18px rgba(37,99,235,.2)' }}
                disabled={(!hasAudio && notes.trim().length < 10) || submitting}
              >
                {submitting ? 'Submitting Feedback…' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
        Protected by AutoAudit AI · Supabase Storage &amp; Groq Whisper
      </div>
    </div>
  );
}

