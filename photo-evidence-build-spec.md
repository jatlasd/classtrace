# Photo evidence build specification

Status: Draft for approval. This file defines the intended implementation scope
for photo evidence. It does not authorize unrelated product expansion.

## Objective

Allow a teacher to capture or choose one photo as evidence while preserving
ClassTrace's existing lifecycle:

~~~text
temporary local capture
  → teacher review
  → explicit validation
  → durable student evidence
~~~

A validated record may contain:

- A text Evidence note
- A photo
- Both

Every saved record must still belong to exactly one active roster student and
must be explicitly validated by the teacher.

## Core product requirements

- Support **Take photo** and **Choose photo**.
- Permit one photo per evidence record.
- Permit text-only, photo-only, and combined text-and-photo evidence.
- Do not require text for photo-only evidence.
- Require teacher validation before photo bytes leave the device.
- Keep unvalidated photos recoverable locally until the existing
  next-device-local-midnight expiry.
- Do not perform AI analysis, OCR, face recognition, or automatic image
  classification.
- Do not create a media library, standalone upload area, reusable attachment
  system, or general file repository.

## Capture and validation flow

### Temporary capture

When the teacher selects a photo, ClassTrace must:

- Normalize it locally on the device.
- Remove embedded metadata through re-encoding.
- Display a preview with Replace and Remove actions.
- Associate it with the existing capture draft ID.
- Persist it only in device-local browser storage.
- Make no network request containing photo bytes.

The photo and raw note expire together at the next device-local midnight.

### Review

The existing review panel must support:

- Text-only drafts
- Photo-only drafts
- Combined text-and-photo drafts
- Student resolution
- Evidence date review
- An optional Evidence note
- Optional structured fields when no text was parsed

A photo-only draft must not receive fabricated summaries, evidence types,
topics, tags, performance fields, or other inferred image content.

### Final save

**Validate and save** is the first operation allowed to transmit the photo.

The final request contains:

- The resolved roster student ID
- The evidence date
- The optional reviewed Evidence note
- The optional reviewed structured fields
- The optional normalized photo

The local draft is removed only after the server confirms successful durable
storage. Failed saves retain the complete local draft for retry.

## Local photo-draft storage

Add a dedicated browser binary-storage helper integrated with the existing
session-draft contract:

- sessionStorage retains the workspace/version/draft manifest and the
  session-scoped encryption key.
- IndexedDB retains only encrypted photo bytes.
- Records are scoped by workspace ID, draft ID, schema version, and expiry.
- Reloading the same tab restores the photo.
- Closing the tab removes the usable session key, matching the existing session
  boundary.
- Startup, logout, successful save, explicit deletion, and midnight expiry
  prune stale local photo data.
- Storage failures show a clear warning that the photo cannot be recovered
  after refresh.

The helper must enforce an aggregate local-photo limit so repeated captures
cannot exhaust browser storage.

## Image limits and normalization

Initial limits:

- One photo per evidence record
- Maximum source file size: 20 MB before local processing
- Maximum stored image size: 1 MB
- Maximum long edge: 2,048 pixels
- Stored format: WebP
- Still images only

The client performs the first normalization so the original photo never leaves
the device. The server independently validates and re-encodes the submitted
image before storage.

A narrowly scoped server image-processing dependency is permitted for this
feature. It must not perform image analysis or retain the original image.

## Durable data model

Add an EvidencePhoto model with:

- id
- workspaceId
- evidenceRecordId
- imageData
- contentType
- byteSize
- width
- height
- createdAt

Required relationships and constraints:

- One EvidenceRecord has zero or one EvidencePhoto.
- EvidencePhoto and EvidenceRecord use a composite same-workspace relation.
- Cross-workspace relations are rejected by both domain predicates and
  PostgreSQL.
- Deleting an evidence record cascades to its photo.
- Image bytes use Prisma Bytes mapped to PostgreSQL bytea.

Update EvidenceRecord so summary and evidenceType may be absent for honest
photo-only records. Existing records remain unchanged.

The domain save operation enforces:

~~~text
non-empty approved Evidence note OR valid approved photo
~~~

## Server boundary

Preserve the existing thin Server Action pattern:

- Accept the final record as bounded FormData.
- Resolve the current accepted workspace.
- Validate every text and image boundary.
- Recheck active student and class ownership.
- Create EvidenceRecord and EvidencePhoto within the existing serializable
  transaction protocol.
- Revalidate the feed, timeline, and report routes.
- Return only safe typed results.

Next.js currently limits Server Action bodies to 1 MB. Configure
serverActions.bodySizeLimit as 2mb, leaving room for the normalized image,
text fields, and multipart overhead. The stored photo limit remains lower and
is independently enforced by the domain.

## Photo delivery

Add an authenticated photo-read route that:

- Resolves the current workspace and current beta acceptance.
- Queries by both evidence ID and workspace ID.
- Selects image bytes only for this dedicated request.
- Returns the same not-available response for missing and cross-workspace IDs.
- Sends Cache-Control: private, no-store.
- Sends X-Content-Type-Options: nosniff.
- Never returns database metadata or technical failure details.

Ordinary feed, timeline, report, search, and export queries select only
has-photo metadata. They must never fetch image bytes incidentally.

## Saved UI behavior

### Evidence feed

- Show a restrained photo preview beneath the primary evidence content.
- Use the photo as the primary content for photo-only records.
- Preserve the existing ledger-row layout.
- Do not introduce nested attachment cards.

### Student timeline

- Show the validated photo within its evidence entry.
- Keep date and class context visible.
- Use the authenticated image-delivery path.

### Printable report

- Include the photo in its evidence record.
- Constrain it to printable width while preserving its aspect ratio.
- Avoid splitting a photo and its evidence metadata across pages.

### CSV export

Add a Photo column containing Yes or No.

Do not include:

- Image bytes
- Internal paths
- Expiring links
- Public URLs
- Original filenames

## Accessibility

- Preview controls have visible labels and keyboard focus.
- The file control remains keyboard accessible.
- Camera capture enhances rather than replaces the standard file input.
- Generic photo-only alternative text identifies the image as photo evidence
  with the record date.
- A written caption remains optional.
- Errors are associated with the photo field and announced accessibly.
- Loading and processing states expose text status rather than animation alone.

## Ownership, archive, and deletion

- Archive retains the photo.
- Evidence deletion removes the photo through database cascade.
- Student deletion removes all owned evidence and photos.
- Workspace and full-account deletion remove all evidence photos.
- Class deletion continues to null optional class context without removing
  evidence.
- Operator audit rows retain aggregate evidence counts only, never photo
  metadata or bytes.
- Deleted photos may remain within Neon's existing restore/history window,
  consistent with the documented database backup boundary.

## Privacy and monitoring

Photo content must never be sent to:

- Sentry
- Application logs
- Resend
- Analytics
- Support reports
- Raw error objects
- Client-visible error details

ClassTrace must not retain:

- The original filename
- EXIF metadata
- Device location
- Camera details
- The unnormalized original

Update public privacy and deletion copy to disclose validated photo storage and
local draft behavior. Because the feature materially changes the student data
ClassTrace handles, update the privacy, terms, and beta-agreement versions and
require renewed acknowledgement.

Do not claim legal de-identification, compliance, district approval,
production safety, or immunity from discovery or subpoenas.

## Failure behavior

- Unsupported image: retain the draft and show a safe format error.
- Oversized source: reject locally before processing.
- Normalization failure: do not upload and allow replacement.
- Local storage failure: keep the current preview but warn that refresh
  recovery is unavailable.
- Validation failure: retain the complete local draft.
- Database failure: store neither evidence nor photo.
- Photo-read failure: show a quiet unavailable state without exposing
  identifiers or provider details.

## Test requirements

### Local lifecycle

- Photo selection performs no network request.
- Camera and existing-photo paths produce the same draft shape.
- Reload restores the photo in the same session.
- Workspace mismatch rejects the draft.
- Midnight expiry removes the note and photo.
- Successful save and explicit deletion clear local photo data.
- Malformed and oversized local records are rejected.

### Domain and database

- Text-only, photo-only, and combined evidence save successfully.
- A record with neither note nor photo is rejected.
- Cross-workspace photo relations fail.
- Student and workspace deletion cascade to photos.
- Archive retains photos.
- Image bytes are absent from ordinary read-model queries.
- Migration replay succeeds against a deliberately disposable PostgreSQL
  database.

### UI and reporting

- Teachers can preview, replace, and remove a photo.
- Photo-only evidence can be validated.
- Unresolved students block saving.
- Feed and timeline render saved photos.
- Printable reports render photos without overflow.
- CSV contains only the photo-present indicator.
- Desktop and mobile keyboard and accessibility behavior are covered.

### Privacy

- Photo bytes and filenames never appear in logs or Sentry payloads.
- Public privacy tests reflect the new behavior.
- Photo responses use authenticated workspace predicates and no-store headers.

## Verification gates

Because this is a broad, privacy-sensitive schema change, implementation
verification requires:

~~~text
Prisma validation
Disposable-database migration tests
Focused domain and component tests
npm run lint
npm run test:coverage
npm run build
~~~

## Explicitly out of scope

- Multiple photos per evidence record
- Videos, audio, PDFs, or arbitrary files
- Photo annotations or editing tools
- Image search or media browsing
- AI, OCR, or image interpretation
- Shared photo links
- Standalone photo deletion from an otherwise saved record
- ZIP or bulk-media export
- Public image URLs
- Cross-teacher sharing
