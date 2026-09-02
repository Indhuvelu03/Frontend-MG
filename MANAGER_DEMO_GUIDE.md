# AutoAudit AI — Manager Demo Guide

## One-line value proposition

AutoAudit AI turns customer feedback and repair invoices into a traceable AI audit workflow, reducing manual follow-ups and making mismatches visible early.

## Demo flow (5–7 minutes)

1. **Executive Dashboard** — show live customer, complaint, audit, and review data. Explain that the numbers reflect real completed records, not sample metrics.
2. **Register Customer** — add a customer with vehicle and email. Point out the loading state and that a secure feedback invitation is automatically queued.
3. **Email Activity** — show the vehicle number, customer, lifecycle stage, delivery state, and timestamp. This is the operational proof that automation ran.
4. **Public Feedback Link** — open the emailed link. Demonstrate text feedback, voice feedback, or both. Explain the single-use, 72-hour security rule.
5. **Invoice Upload** — upload an invoice PDF. Explain automatic OCR extraction and automatic AI comparison when both feedback and invoice are available.
6. **AI Audit Engine** — show the resulting score, matched issues, missing requests, and downloadable PDF report.
7. **Controls** — show roles, service-center manager escalation email, audit logs, and real deletion controls.

## What to say about the engineering

- “The user interface and API are independently deployed, so the system can scale and be updated safely.”
- “All automation work is queued; the customer creation request does not wait for email or AI processing.”
- “Every lifecycle email is recorded with a timestamp, vehicle number, and status.”
- “Public feedback links are secure, expire after 72 hours, and become unusable after submission.”
- “Voice transcription, invoice parsing, and comparison are event-driven—not manually triggered.”

## Honest current deployment note

Render Free mode can sleep. For a demo, the API and worker run together using `node worker.js & node server.js`. A paid worker service is the production-ready deployment path.

## Suggested next business enhancements

1. Custom verified sending domain for customer emails.
2. Twilio WhatsApp/SMS live credentials and delivery-status webhooks.
3. Role-specific dashboard permissions and staff activity audit screen.
4. SLA alerts: notify manager when transcription, OCR, or comparison exceeds an agreed time.
5. Branch-level analytics: turnaround time, audit score trends, and unresolved cases.
