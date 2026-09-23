# ClassTrace QoL build plan

This is the active implementation plan following the repeated-use audit in [qol-sol-analysis.md](qol-sol-analysis.md). The earlier mobile shell, student context, and Capture-loop work is already represented in the current implementation.

Build and review these units separately, in order:

1. Feed retrieval
2. Evidence scanability
3. Student timeline interrogation

Explore URL durability and the broader mobile finishing pass are deferred.

## Product boundary

Timeline interrogation is a supporting feature on the student page, not a miniature Explore.

- Student identity, all-time summary, actions, and the chronological trace remain primary.
- A compact “Find in this timeline” area sits between the profile header and evidence results.
- Text search is immediately available; type, tag, and date controls sit behind a Filters disclosure that is collapsed by default on phones.
- Do not add a sentence builder, student/class picker, grouped view, saved search, analytics, inferred insight, or field-by-field query editor.
- Timeline filters affect only the visible trace. Reports and exports continue to use the student's complete history.

## Shared retrieval contract

- Put only applied retrieval state in the URL. Keep unsubmitted filter edits local.
- Omit empty values and page 1 from generated URLs. Applying or clearing retrieval state resets to page 1.
- Add a specific 200-character saved-evidence search limit and normalize every URL value before database work.
- Sort by `evidenceDate DESC`, then `createdAt DESC`, with an ID tie-breaker if required for stable pagination.
- Apply workspace, active-student, and archive predicates to matching queries and counts. Filtering happens before `skip` and `take`.
- Use 20-record pages and return total matches plus older/newer availability.
- Resolve an out-of-range page to page 1 while retaining valid retrieval state. Ignore malformed or unsupported values safely.
- Search and pagination navigation targets and focuses the evidence-results heading. Announce the new result count/page only after explicit navigation.
- Back, Forward, refresh, and copied URLs restore applied state.

Text search is deterministic case-insensitive substring search over scalar fields, plus exact normalized-tag matching:

| Surface | Searchable fields |
| --- | --- |
| Feed | Approved Evidence note, legacy summary, student display name/handle, class-at-capture name, classification, topic, performance, behavior/work habit, follow-up text, and tags. |
| Student timeline | Approved Evidence note, legacy summary, classification, topic, performance, behavior/work habit, follow-up text, and tags. Student/class fields are omitted because the route already fixes the student. |

On the feed, `@value` searches student handles without the prefix and `#value` performs exact normalized-tag matching. Do not introduce raw-SQL partial array search, ranking, or semantic search.

## Feed retrieval

### Domain and route

Change `getEvidenceFeedPageForWorkspace` to accept normalized `{ page, query }` input and return:

```ts
type EvidenceFeedPage = {
  records: EvidenceFeedRecord[];
  page: number;
  totalMatches: number;
  hasNewer: boolean;
  hasOlder: boolean;
};
```

The domain query must:

- retain authenticated workspace, active-student, and non-archived evidence predicates;
- apply search before pagination;
- count and read the same predicate;
- fetch at most 20 records; and
- retain photos and all currently rendered fields.

The route parses `q` and `page`. The existing `student` parameter remains one-time Capture initialization state; search and pagination URLs do not retain it.

### Interaction

- Label the field “Search all saved evidence” and use an explicit GET submission.
- Remove the `All`, `Needs review`, and `Validated` controls. Pending work remains in the draft-review queue.
- Show “N saved observations” by default or “N matching observations” with a query.
- When multiple pages exist, render compact Newer/Older controls by the heading and full controls after the list. Preserve `q` and target `#evidence-inbox-heading`.
- Move focus to the result heading after search submission, not while typing.
- Distinguish no saved evidence from no search matches; the latter offers Clear search.
- Keep Capture and its draft queue above the feed. Do not duplicate Explore filters.

### Acceptance checks

- A historical match appears on page 1 of its matching result set regardless of its unfiltered page.
- Results and counts exclude other workspaces, archived evidence, and archived students.
- Positive and negative tests cover note, legacy summary, student name/handle, class, classification, topic, performance, behavior, follow-up, and normalized tags.
- Test `@handle`, `#tag`, search/clear, boundaries, Back/Forward, refresh, and evidence-heading navigation.
- Both pager placements have descriptive accessible names.
- Check 390px and desktop layouts with text-only and photo-heavy evidence, keyboard focus, and no horizontal overflow.

## Evidence scanability

### Classification contract

Extract one shared saved-classification definition for capture review, evidence display, and timeline filtering:

| Saved label | Cue |
| --- | --- |
| Academic check-in | Book/check icon |
| Behavior observation | Eye/observation icon |
| Communication log | Message icon |
| Accommodation log | Sliders/support icon |
| Assessment observation | Clipboard/check icon |
| Progress monitoring | Trend/progress icon |
| General observation | Dot/general icon |

The installed icon set may determine the exact components, but the label-to-concept mapping is stable. `Unclear` remains parser/review state, not a supported saved classification. Unknown or legacy saved strings retain their original text and use a neutral fallback tag icon; never rewrite historical data.

### Rendering and checks

- Add one compact classification component inside shared `EvidenceRecordContent` so feed, timeline, Explore, and report stay consistent.
- Render icon and text together with an accessible name. Do not rely on icon or color alone.
- Use a restrained neutral badge family. Do not color whole cards, reuse the follow-up rail, or require a legend.
- Preserve the current note, photo, topic, performance, behavior, tag, and follow-up hierarchy.
- Reuse the shared label list for the timeline Type filter.
- Test all seven labels and the fallback, including accessible text and long legacy labels at 320px.
- Verify feed, timeline, Explore, report, and photo-only fixtures retain their content and layout.

## Student timeline interrogation

### URL contract

| Parameter | Meaning | Rule |
| --- | --- | --- |
| `q` | Free-text query | Trimmed; maximum 200 characters. |
| `type` | One classification | One of the seven supported labels; otherwise ignored. |
| `tag` | Selected tags | Repeated, normalized, deduplicated, maximum 10; any selected tag may match. |
| `from` | Earliest evidence date | Inclusive `YYYY-MM-DD`. |
| `fromOffset` | Earliest-date timezone offset | Bounded browser offset at the inclusive local midnight; present only with `from`. |
| `to` | Latest evidence date | Inclusive `YYYY-MM-DD`. |
| `toOffset` | Latest-date timezone offset | Bounded browser offset at the exclusive local midnight after `to`; present only with `to`. |
| `page` | Result page | Positive bounded integer; omitted for page 1. |

Use Explore's per-boundary browser-offset convention so ranges remain correct
across daylight-saving transitions. If a date or its required boundary offset
is invalid, or `from` follows `to`, ignore the invalid date portion and show a
safe inline explanation. Do not reinterpret calendar dates as UTC. The first
version uses explicit From/To inputs; relative-date shortcuts are out of scope.

### Domain result

After resolving an active student in the authenticated workspace, return:

```ts
type StudentTimelineResult = {
  student: StudentTimelineStudent;
  summary: {
    totalEvidenceCount: number;
    firstEvidenceDate?: string;
    lastEvidenceDate?: string;
  };
  results: {
    records: StudentTimelineRecord[];
    totalMatches: number;
    page: number;
    hasNewer: boolean;
    hasOlder: boolean;
  };
  options: { tags: string[] };
};
```

- `summary` always describes the student's complete active history and does not change under filters.
- `results` applies text/type/tag/date predicates before count and 20-record pagination.
- Tags use any-selected semantics; include-all and exclude remain Explore-only.
- `options.tags` contains sorted, normalized, deduplicated tags from this active student's evidence and respects the existing option limit.
- Group the current page by month without implying that a partially displayed month is complete.
- Preserve exact workspace/student/archive predicates in student resolution and evidence retrieval.

### Interaction

- Keep the profile header, switcher, Capture, report/export, all-time count, and date span above retrieval controls.
- Add a low-emphasis “Find in this timeline” region with search, Search button, Filters disclosure, and contextual Clear action.
- Filters contain one Type select, student-specific tag multi-select, and From/To inputs. Apply is explicit; draft changes do not alter results.
- Show total matches and compact pagination by the Evidence heading; repeat full pagination below the trace when needed.
- Search, Apply, Clear, Newer, and Older focus and announce the Evidence heading after navigation.
- Preserve chronological cards and month grouping; retrieval controls must not become the visual hero.
- Keep the existing capture-oriented state when the student has no history. Use a distinct no-match state with Clear filters when history exists.
- Do not add “More filters in Explore” until Explore has durable URL state that can receive a student scope.

### Acceptance checks

- Prove records, counts, summaries, and tag options cannot cross workspaces or resolve archived students.
- Cover every text field, classification, tag-any selection, date boundary, and a combined query with positive and negative domain tests.
- Verify filtering precedes pagination and page metadata at first, middle, last, and out-of-range pages.
- Verify all-time count/date span remains unchanged under filters.
- Verify URL round-trips and safe invalid-value behavior.
- Distinguish no-history from no-match and confirm report/export URLs remain full-history operations.
- At 390px, verify closed/open filters, keyboard, empty states, long months, and pagination remain reachable without horizontal overflow. Desktop must preserve the trace as dominant content.

## Delivery and verification

- Remove obsolete feed status-filter and client-only saved-record filtering code with the feed unit.
- Remove duplicate saved-label definitions with the classification unit while preserving parser keys and the rule that `Unclear` cannot complete a text observation.
- Replace the unbounded timeline read. Do not retain a separate full-record read just to compute header summaries.
- Add no schema migration, dependency, analytics, external service, or generative feature.
- Run focused domain/component tests and lint for each unit.
- After the timeline unit, run `npm run lint`, `npm run test:coverage`, and `npm run build`.
- Browser verification must cover keyboard navigation, focus restoration, announcements, Back/Forward, refresh, photo-heavy evidence, 320–430px widths, and reduced motion.

The work is complete when the feed can retrieve any saved observation without knowing its page, classifications are consistently scannable everywhere, and a teacher can interrogate one student's trace without the controls overtaking the page.
