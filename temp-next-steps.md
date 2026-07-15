# ClassTrace Beta-Readiness Scope

ClassTrace is at the point where normal feature development should pause. The core product loop is already coherent and mostly polished. The current focus should be turning the app into something that can safely support a very small real-teacher beta.

The large evidence feed component is intentionally out of scope and will be handled separately.

## Primary Goal

Prepare ClassTrace for a controlled beta with a few invited teachers without building enterprise infrastructure or a full admin dashboard.

## Build Now

### 1. Minimal Operator Console

Create a private owner-only route for basic account administration.

This console is a sanctioned, narrowly scoped exception to the normal
workspace-boundary rule. Operator reads and mutations may resolve a target
workspace from an exact account email only after server-side owner
authorization. The exception does not permit browsing teacher evidence,
impersonation, or reusable cross-workspace access elsewhere in the product.

Required capabilities:

- Search for a user by email
- View safe account metadata
- View counts for classes, students, and evidence records
- Delete an entire workspace after explicit confirmation
- Clearly handle database deletion and Clerk-user deletion as separate actions
- Record basic destructive-action audit information without retaining deleted student data

The audit record is an intentional schema addition. Update the schema-shape
test with the model and migration so the existing no-admin-product guardrail
continues to reject broad administration models without treating this narrow
audit table as drift to route around.

Do not include analytics, impersonation, district controls, or casual access to teacher evidence.

### 2. Help and Feedback Form

Add a simple **Help and Feedback** section inside Settings.

#### Build specification

##### Outcome

Add an authenticated Help and Feedback form to `/app/settings` that collects a
small, privacy-bounded support report and hands it to a narrow delivery
boundary. The form must be useful for beta support without creating a support
database, ticket system, analytics surface, or new student-data path.

This item owns the form, validation, trusted metadata assembly, submission
contract, and interaction behavior. Item 3 owns the Resend adapter and operator
email configuration. The enabled form must not be released until Item 3 is
connected: a submission may show success only after the delivery adapter has
accepted the message.

##### Agreed language

- **Help and Feedback** is one new section inside the existing Settings page,
  not a new route or navigation item.
- **Form type** is one required value from the fixed list below.
- **Reply email** is editable and initially uses the signed-in teacher's
  primary Clerk email.
- **Context metadata** is diagnostic context collected specifically for this
  report. It is not analytics and is not stored by ClassTrace.
- **Submission** means a server-validated report passed to the delivery
  boundary. Item 2 does not add Resend or another delivery provider.

##### User experience

Place the section after Workspace and before Sign out on the existing Settings
page. Match the current bordered `bg-card/60` settings surfaces, shared field
focus treatment, shared `Textarea`, and shared `Button`; do not introduce a
card grid or a new visual vocabulary.

The form contains:

1. A visible, required **What can we help with?** control with exactly these
   choices:
   - Something broke
   - Something was confusing
   - Feature idea
   - Account or data request
2. A visible, required **Description** textarea.
3. A visible, required **Reply email** input, prefilled from Clerk and editable.
4. Short privacy guidance beside the description: do not include student
   names, evidence notes, or other student information.
5. One **Send feedback** primary action.

Do not display or ask the teacher to edit the diagnostic metadata. While a
submission is pending, disable repeat submission and label the action **Sending
feedback…**. On validation or delivery failure, preserve all entered values,
associate field errors with their controls, and move focus to an accessible
error summary. On success, show a polite status confirmation, clear the type
and description, and retain the reply email for another report.

The form must work in the narrow mobile Settings layout without horizontal
scrolling and remain fully usable by keyboard. Success must never be optimistic.

##### Submission contract

Use a discriminated union for the public action result:

```ts
type SubmitFeedbackResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Partial<
        Record<"type" | "description" | "replyEmail", string>
      >;
    };
```

The client submits only:

```ts
type FeedbackFormInput = {
  type: "BROKE" | "CONFUSING" | "FEATURE_IDEA" | "ACCOUNT_OR_DATA";
  description: string;
  replyEmail: string;
  currentRoute: string;
  browserAndDevice: string;
};
```

Build `currentRoute` from `usePathname()` so it contains a pathname only, never
query parameters or a hash. Build `browserAndDevice` from the bounded browser
user-agent string; do not add fingerprinting, screen dimensions, IP lookup, or
a user-agent parsing dependency.

The Server Action authenticates with `getCurrentWorkspace()` and derives these
values after authentication rather than accepting them from the client:

- Clerk user ID
- Workspace ID
- Server submission timestamp in ISO 8601 form
- Release identifier: `VERCEL_GIT_COMMIT_SHA` when available, otherwise the
  package version, otherwise `unknown`

Keep the release identifier server-only; it does not need a `NEXT_PUBLIC_`
variable. Treat route and browser/device strings as untrusted metadata even
though the client supplies them.

After validation, assemble one provider-neutral delivery value containing the
human-readable form labels, description, reply email, pathname, release,
browser/device string, timestamp, Clerk user ID, and workspace ID. The domain
function accepts an injected delivery port so its behavior can be tested
without network calls. Item 3 supplies the production Resend implementation.

##### Validation and privacy boundaries

Add explicit limits to `lib/validation/input-limits.ts` and enforce them before
calling the delivery port:

- Description: required after trimming; maximum 5,000 characters.
- Reply email: required, trimmed, syntactically valid, and no more than the
  existing 320-character account-email limit.
- Type: one of the four exact allowlisted values; reject any other value.
- Current route: required pathname beginning with `/`, with no `?` or `#`, and
  maximum 2,048 characters.
- Browser and device: maximum 1,000 characters; use `Unavailable` when the
  browser cannot provide it.
- Release and authenticated identifiers: bounded before delivery with the
  shared identifier-sized limits.

The implementation must not:

- Query roster students or evidence records.
- Read capture state, unrelated form state, `sessionStorage`, or
  `localStorage`.
- Automatically attach student names, class names, roster data, evidence-note
  content, raw capture text, screenshots, URLs with query strings, cookies, or
  request bodies.
- Write feedback to PostgreSQL or add a feedback schema model.
- Log the description, reply email, route, browser string, user ID, workspace
  ID, or the assembled delivery payload. Unexpected failures may log only a
  fixed operation prefix and a safe provider/error classification.
- Claim the report was sent when validation or delivery fails.

The privacy guidance reduces accidental disclosure but is not a claim that
free-text feedback is de-identified. The outbound description is exactly what
the teacher chooses to submit after trimming and validation.

##### Implementation shape

1. Extend `SettingsPageData` so the existing server-side Clerk lookup supplies
   a usable reply-email initial value to the form. If Clerk has no primary
   email, render an empty required field rather than the display fallback
   `Email unavailable`.
2. Add a focused `lib/feedback/` module for the category union, normalization,
   input limits, provider-neutral delivery payload, injected delivery port,
   and typed result. Keep it direct; do not add generic service or repository
   layers.
3. Add a thin authenticated Server Action under `actions/feedback.ts`. It
   resolves the current workspace, derives timestamp and release server-side,
   delegates validation/delivery, maps unexpected failures to safe copy, and
   does not revalidate a route because no app-owned read model changes.
4. Add `components/settings/help-feedback-form.tsx` as the only new Client
   Component. It owns local field state, `usePathname()`, browser user-agent
   capture, pending state, status rendering, focus management, and calling the
   typed action. Authentication, release resolution, and delivery stay out of
   the component.
5. Compose the form into `app/app/settings/page.tsx` between Workspace and Sign
   out, passing only the initial reply email.
6. In Item 3, connect the action to the production delivery adapter and add the
   fixed operator/from-address configuration. Do not expose the enabled form in
   a release before that adapter is present.
7. Once the operational form is connected, update the current-state docs rather
   than creating another build record: Settings behavior in
   `context/project-overview.md` and the outbound support-data/privacy boundary
   in `context/architecture.md`. Update `context/ui-registry.md` only if the
   implementation establishes a genuinely reusable form/status pattern.

##### Required tests

- Domain tests prove all four categories are accepted and unknown categories
  are rejected; required fields, trimming, email syntax, and every length
  boundary are enforced before delivery.
- Domain tests prove client-supplied ownership/timestamp/release values cannot
  enter the final payload and the delivery port is not called for invalid
  input.
- Action tests prove authentication runs first, Clerk/workspace IDs come from
  `getCurrentWorkspace()`, timestamp and release are server-derived, delivery
  failures map to safe copy, and no route revalidation occurs.
- Settings-data tests cover a real primary email and the missing-email empty
  form value without exposing internal IDs in display data.
- Rendered interaction tests cover the four labels, Clerk-prefilled email,
  privacy copy, submitted pathname/user-agent values, pending behavior,
  duplicate-submit prevention, field errors, focused error summary, failure
  value preservation, and success reset behavior.
- Privacy-focused tests prove the module does not query Prisma and the action
  does not log submitted payload fields. Do not use source-spelling assertions
  where an injected dependency or console spy can prove behavior directly.
- Perform a practical desktop/mobile keyboard and accessibility check for the
  Settings section.

Before completion, run:

```bash
npm run lint
npm run test
npm run build
```

No Prisma migration or `npm run test:db` is required because this item adds no
database storage.

##### Acceptance criteria

- A signed-in teacher can complete the form from Settings with one of the four
  approved categories, a description, and an editable prefilled reply email.
- The delivery payload contains only the submitted form values and explicitly
  approved diagnostic metadata.
- Ownership, timestamp, and release metadata are derived server-side; client
  values cannot select another user or workspace.
- Invalid or failed submissions remain editable and never show success.
- A successful submission is reported only after the Item 3 delivery adapter
  accepts it.
- No feedback, student data, or raw-note content is written to the ClassTrace
  database, browser persistence, analytics, or logs.
- The change adds no support inbox, ticket history, analytics, screenshots,
  attachments, or automatic GitHub issue creation.

### 3. Minimal Resend Integration

#### Build specification

##### Outcome

Replace the fail-closed `lib/feedback/feedback-delivery.ts` stub with one
server-only Resend adapter. After Item 2 has authenticated and validated a
report, the adapter sends one plain-text email to the configured ClassTrace
operator. The form reports success only when Resend accepts the send request.

This item adds the official `resend` runtime package and the minimum production
configuration needed for that adapter. It does not add another application
data store, delivery queue, webhook, inbound-email path, or support workflow.
The Resend MCP may help the operator inspect or configure the Resend account,
but it is development/operations tooling only; it is not part of the ClassTrace
runtime and must not receive feedback submissions from application code.

##### Agreed language and decisions

- **Resend integration** means server-only outbound email through Resend's Email
  API. It does not include inbound email, webhooks, broadcasts, contacts,
  templates, analytics, or automated sequences.
- **Accepted** means the Resend API returned a successful send result with an
  email ID. It does not mean the message reached the operator's inbox.
- **Operator address** is one fixed server environment value and the sole `to`
  recipient. A teacher cannot select or add recipients.
- **From address** is one fixed server environment value on a Resend-verified
  ClassTrace domain. Application code supplies the fixed display name
  `ClassTrace Feedback`.
- **Reply-To** is the teacher-entered reply email already trimmed and validated
  by Item 2. It is the only user-controlled email header.
- Send a plain-text body only. Do not add HTML, React Email, a Resend-hosted
  template, attachments, or rendering dependencies.
- Resend stores sent-message content and API request bodies by default. Treat
  that as an explicit outbound support-data boundary, not as ClassTrace-owned
  persistence and not as a claim that reports are de-identified.

##### Email contract

Call `resend.emails.send` once with exactly:

- `from`: `ClassTrace Feedback <configured-from-address>`
- `to`: the single configured operator address
- `replyTo`: the validated payload `replyEmail`
- `subject`: `[ClassTrace feedback] ${payload.typeLabel}`
- `text`: a deterministic plain-text representation of the approved delivery
  payload

The subject contains only fixed text and the allowlisted category label. Do not
put the description, reply email, route, release, browser string, Clerk user ID,
or workspace ID in the subject, tags, custom headers, or Resend metadata.

Use this body order so messages are easy to scan and tests can assert one stable
contract:

```text
ClassTrace Help and Feedback

Category: <human-readable category label>
Reply email: <reply email>
Submitted at: <ISO 8601 timestamp>
Route: <pathname>
Release: <release identifier>
Browser/device: <bounded browser string>
Clerk user ID: <authenticated Clerk user ID>
Workspace ID: <authenticated workspace ID>

Description:
<trimmed teacher description>
```

Use the values already present in `FeedbackDeliveryPayload`; do not query Clerk,
Prisma, roster students, classes, evidence records, browser storage, or request
headers again in the adapter. Preserve the normalized description exactly. Do
not reinterpret, summarize, sanitize, redact, or interpolate it into another
field.

Do not add CC, BCC, tags, attachments, HTML, scheduled sending, open/click
tracking code, or custom headers. The operator manually reviews and sanitizes a
report before creating any GitHub issue.

##### Configuration and Resend account setup

Add and document these required server-only environment variables:

```env
RESEND_API_KEY=re_replace_me
CLASSTRACE_FEEDBACK_FROM_EMAIL=feedback@example.com
CLASSTRACE_FEEDBACK_TO_EMAIL=jeremy@example.com
```

None may use a `NEXT_PUBLIC_` prefix. Treat all three as deployment secrets or
server configuration; never return them from a Server Action or include them in
client bundles or logs.

The adapter validates configuration before making a network call:

- API key is present after trimming.
- From and operator values are each one syntactically valid email address, no
  more than the existing 320-character account-email limit.
- Comma-separated or otherwise multi-recipient operator configuration is
  rejected rather than split.

For the Resend account:

1. Verify the domain used by `CLASSTRACE_FEEDBACK_FROM_EMAIL` before enabling
   the form in the beta deployment.
2. Create a dedicated API key with **Sending access**, restricted to that
   domain where Resend permits domain restriction. Do not use a full-access
   key.
3. Store the key only in the local/deployment environment. Do not commit it.
4. Configure the one operator mailbox in
   `CLASSTRACE_FEEDBACK_TO_EMAIL` and confirm it can receive the smoke-test
   message.
5. Keep Resend dashboard access limited because sent emails and request logs may
   expose the submitted description and diagnostic metadata.

Update `.env.example`, the README local/deployment setup, and the environment
contract in `context/code-standards.md`. The Resend MCP is not required in the
production environment.

##### Adapter and failure behavior

Keep `FeedbackDeliveryPort` and the authenticated action unchanged. Implement
the production port directly in `lib/feedback/feedback-delivery.ts`; do not add
generic provider, notification, mailer, repository, or service layers.

The adapter must:

1. Read and validate server-only configuration.
2. Construct the fixed subject and plain-text body.
3. Create/use the official Resend client with `RESEND_API_KEY`.
4. Await one `emails.send` call.
5. Return normally only when Resend returns no error and a non-empty email ID.
6. Otherwise throw so `submitFeedbackForWorkspace` preserves Item 2's existing
   safe failure result and the UI retains the teacher's values.

Do not pass Resend's error object or message to the client. If the adapter logs,
log only a fixed operation prefix and one allowlisted classification such as
`configuration`, `provider_rejected`, or `provider_unavailable`. Never log the
request object, Resend response body, provider error message, API key, email ID,
recipient/from address, reply email, description, route, browser string, Clerk
user ID, workspace ID, or assembled email.

Do not add automatic retry, a queue, or scheduled redelivery. Without a stable
submission identifier across separate Server Action requests, retrying after an
ambiguous network timeout could send duplicates. The teacher may deliberately
retry after the UI reports failure; a duplicate operator email in that narrow
edge case is an accepted controlled-beta risk. Resend idempotency can be added
later only with a stable end-to-end submission identity and an explicit need.

No application-level rate-limit store is added here. The authenticated,
controlled-beta surface, the form's pending-state duplicate guard, and Resend's
account quota bound normal use. Scripted abuse by an authenticated beta account
remains an operational risk to monitor; do not solve it by adding a database,
cache service, queue, or unreliable process-local limiter in this item.

##### Privacy and data boundaries

The only outbound values are those already approved in
`FeedbackDeliveryPayload`: category, description, reply email, pathname,
browser/device string, release, timestamp, Clerk user ID, and workspace ID,
plus the fixed configured sender and recipient.

The implementation must not:

- Add roster, student, class, evidence, capture, cookie, IP, screen, query-string,
  hash, screenshot, attachment, or request-body data.
- Store the feedback or Resend email ID in PostgreSQL, browser storage, logs,
  analytics, or a new support model.
- Send the message to GitHub or any provider other than the configured Resend
  account and operator mailbox.
- Claim that privacy guidance prevents a teacher from voluntarily typing
  student information into the free-text field.
- Claim delivery, production safety, legal compliance, or de-identification.

After the adapter is operational, update `context/project-overview.md` to list
Help and Feedback as current Settings behavior and `context/architecture.md` to
show this explicit flow:

```text
authenticated Settings form
  -> validated provider-neutral feedback payload
    -> server-only Resend adapter
      -> Resend email/log systems
        -> configured ClassTrace operator mailbox
```

The architecture document must state that ClassTrace does not persist the
report in its own database, while Resend and the operator mailbox retain/process
the email under their own operational settings.

##### Implementation shape

1. Add the current supported `resend` package to `dependencies` and commit the
   lockfile change. Do not add React Email or another email package.
2. Replace the `feedbackDelivery` stub in
   `lib/feedback/feedback-delivery.ts` with the server-only adapter, small
   configuration validator, deterministic text formatter, and safe provider
   failure classification.
3. Keep `actions/feedback.ts`, `FeedbackDeliveryPort`,
   `FeedbackDeliveryPayload`, and the form submission contract stable unless a
   test exposes a concrete defect. No route revalidation is needed.
4. Add focused adapter tests beside the module using a mocked Resend client; no
   normal test may call the network or send a real email.
5. Update `.env.example`, README, and the three current-state context documents
   identified above. Do not create another completion record or integration
   guide.
6. Configure Resend outside the codebase, deploy with all three environment
   values, and complete one sanitized end-to-end smoke test before inviting
   beta teachers.

##### Required tests

- Configuration tests cover missing/blank API key, missing/invalid sender,
  missing/invalid operator address, over-limit addresses, and attempted
  multi-recipient configuration. Invalid configuration must not construct a
  send request.
- Formatter tests assert the fixed subject, exact field order, plain-text-only
  body, normalized description preservation, and absence of HTML, attachments,
  CC/BCC, tags, custom headers, or extra metadata.
- Adapter tests assert the configured from/to values, validated reply-to value,
  and exactly one `emails.send` call for a valid payload.
- Success tests require a non-empty Resend email ID and no returned error.
- Failure tests cover a returned Resend error, a thrown SDK/network error, and a
  malformed success response. Each must reject through the delivery port so the
  existing domain/action result remains unsuccessful.
- Logging tests prove only the fixed prefix and safe classification may be
  emitted. Use sentinel sensitive values and assert none appear in logged
  arguments; do not log the provider error message.
- Existing domain/action/component tests continue to prove authentication,
  payload bounds, failure value preservation, duplicate-submit prevention, and
  non-optimistic success.
- A build/config test or direct review confirms the API key and address variables
  are server-only and the `resend` package is absent from client output. Do not
  use brittle source-spelling assertions when module behavior or the production
  build proves the boundary.

Before completion, run:

```bash
npm run lint
npm run test
npm run build
```

No Prisma migration or `npm run test:db` is required because the integration
adds no application-owned persistence.

The pre-beta operational check must then submit one sanitized report through a
deployment configured like production and confirm:

- The operator mailbox receives the expected plain-text message.
- Reply targets the submitted reply email.
- The form shows success only after Resend acceptance.
- In an automated test or disposable preview deployment, deliberately invalid
  or missing configuration shows the safe failure state and retains the entered
  values. Do not break the beta deployment to exercise this case.
- Resend and Vercel logs contain no application-emitted feedback payload dump.

Do not run this smoke test in the normal automated suite, and never use real
student information in it.

##### Acceptance criteria

- Each valid authenticated feedback action attempt produces exactly one Resend
  send request to the configured operator with the fixed sender and teacher
  reply-to.
- The operator email contains the complete approved provider-neutral payload in
  the documented plain-text format and no additional application data.
- The UI reports success only after Resend returns an accepted email ID; config,
  provider, network, or malformed-response failures remain safe failures.
- No Resend secret or provider detail reaches client code, user-facing errors,
  application logs, PostgreSQL, or browser storage.
- Resend's message-content retention and the operator-mailbox boundary are
  described honestly in current-state architecture documentation.
- The Resend API key has sending-only access, the from domain is verified, and a
  sanitized deployed smoke test reaches the operator before beta use.
- The change adds no ticket database, support threads, inbound email, webhooks,
  contacts, broadcasts, templates, sequences, analytics, automatic retries,
  attachments, or automatic GitHub issue creation.

### 4. App-Wide Error Handling

Create a friendly fallback for unexpected failures.

The error state should:

- Explain that something went wrong
- Avoid claiming that data was saved
- Offer **Retry**
- Offer **Report this problem**
- Display a generated reference ID

The same reference ID should appear in server logs so support reports can be matched without collecting student information.

### 5. Controlled Beta Access

Do not leave public registration unrestricted.

Use one of the following:

- Invite-only Clerk signups
- An allowlist of approved email addresses
- Manual tester invitations

This only needs to support a small initial pilot.

### 6. Basic Trust and Support Pages

Add simple links for:

- Privacy
- Beta terms or terms of use
- Contact and support
- Data deletion requests

The language should truthfully describe the current product and should not claim FERPA compliance or district approval.

### 7. Operational Readiness

Confirm and document:

- Production database separation from development
- Neon backups or point-in-time recovery
- Migration deployment process
- Vercel runtime and deployment logs
- Production environment variables
- Recovery procedure after a failed deployment
- A simple support-response process

Sentry is optional at this stage. Vercel and Neon logs may be enough for a very small beta. If Sentry is added, session replay and sensitive request-body capture must remain disabled.

## Do Not Build Yet

Do not build:

- Full admin dashboard
- Usage analytics
- District or organization accounts
- User impersonation
- In-app chat support
- Notification center
- Public status page
- Feature voting
- Mass email tools
- Automated onboarding campaigns
- Advanced monitoring infrastructure
- Self-service deletion without a carefully verified deletion flow

## Recommended Implementation Order

1. Controlled beta access
2. Operator console
3. Feedback form and Resend integration
4. Error fallback with reference IDs
5. Privacy, support, and deletion-request pages
6. Backup and recovery verification
7. Clean-account rehearsal before inviting testers

## Completion Standard

This phase is complete when ClassTrace can support three to five invited teachers, receive bug reports, identify failures, process deletion requests, recover from deployment problems, and operate without the owner manually editing production database records for normal support tasks.
