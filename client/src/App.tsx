import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createUsage, errorsFor, loadUsage, unmappedErrors } from './api';
import { EMPTY_FORM, USAGE_FIELDS } from './types';
import type { UsageField, UsageFormValues, UsageRecord } from './types';
import './App.css';

function App() {
  const [form, setForm] = useState<UsageFormValues>(EMPTY_FORM);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [allRecords, setAllRecords] = useState<UsageRecord[]>([]);
  const [rows, setRows] = useState<UsageRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterInput, setFilterInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [reloadToken, setReloadToken] = useState(0);

  const loadKey = `${reloadToken}:${activeFilter}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const loading = settledKey !== loadKey;

  useEffect(() => {
    let cancelled = false;

    loadUsage(activeFilter).then(
      ({ all, rows: next }) => {
        if (cancelled) return;
        setAllRecords(all);
        setRows(next);
        setLoadError(null);
        setSettledKey(loadKey);
      },
      (error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Could not reach the API');
        setSettledKey(loadKey);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [activeFilter, reloadToken, loadKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await createUsage(form);

      if (!result.ok) {
        setSubmitErrors(result.errors);
        return;
      }

      setSubmitErrors([]);
      setForm(EMPTY_FORM);
      setReloadToken((token) => token + 1);
    } catch (error) {
      setSubmitErrors([error instanceof Error ? error.message : 'Could not reach the API']);
    } finally {
      setSubmitting(false);
    }
  }

  const subscriberIds = useMemo(
    () => [...new Set(allRecords.map((record) => record.subscriberId))].sort(),
    [allRecords],
  );

  const visible = useMemo(
    () => [...rows].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [rows],
  );

  const formErrors = unmappedErrors(submitErrors);

  function setField(field: UsageField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main>
      <h1>Subscriber usage</h1>

      {/* noValidate: the API owns validation, so every submit round-trips and
          the field errors below come from the server rather than the browser. */}
      <form onSubmit={handleSubmit} noValidate>
        <h2>Record usage</h2>

        {formErrors.length > 0 && (
          <ul className="form-errors" role="alert">
            {formErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="fields">
          {USAGE_FIELDS.map(({ name, label, type }) => {
            const fieldErrors = errorsFor(submitErrors, name);

            return (
              <p className="field" key={name}>
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  step={type === 'number' ? 'any' : undefined}
                  value={form[name]}
                  aria-invalid={fieldErrors.length > 0 || undefined}
                  aria-describedby={fieldErrors.length > 0 ? `${name}-error` : undefined}
                  onChange={(event) => setField(name, event.target.value)}
                />
                {fieldErrors.length > 0 && (
                  <span className="field-error" id={`${name}-error`}>
                    {fieldErrors.join('. ')}
                  </span>
                )}
              </p>
            );
          })}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Record usage'}
        </button>
      </form>

      <section>
        <div className="table-head">
          <h2>
            Records <span className="count">({visible.length})</span>
          </h2>

          <form
            className="filter"
            onSubmit={(event) => {
              event.preventDefault();
              setActiveFilter(filterInput.trim());
            }}
          >
            <label htmlFor="filter">Subscriber ID</label>
            <input
              id="filter"
              list="subscriber-ids"
              placeholder="All subscribers"
              value={filterInput}
              onChange={(event) => setFilterInput(event.target.value)}
            />
            {/* Deduped, because a subscriber has many usage records. */}
            <datalist id="subscriber-ids">
              {subscriberIds.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>

            <button type="submit">Filter</button>
            <button
              type="button"
              onClick={() => {
                setFilterInput('');
                setActiveFilter('');
              }}
              disabled={activeFilter === '' && filterInput === ''}
            >
              Clear
            </button>
          </form>
        </div>

        {activeFilter !== '' && (
          <p className="active-filter">
            Filtered by <code>subscriberId={activeFilter}</code>
          </p>
        )}

        {loadError !== null && (
          <p className="load-error" role="alert">
            {loadError}. Is the API running on port 3000?
          </p>
        )}

        {/* Five columns with nowrap headers exceed a narrow viewport;
            scroll the table instead of the whole page. */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subscriber ID</th>
                <th className="numeric">Call minutes</th>
                <th className="numeric">SMS count</th>
                <th className="numeric">Data usage (MB)</th>
                <th>Recorded at</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={5}>
                    {loading
                      ? 'Loading…'
                      : activeFilter === ''
                        ? 'No usage recorded yet.'
                        : `No usage recorded for ${activeFilter}.`}
                  </td>
                </tr>
              ) : (
                visible.map((record) => (
                  <tr key={`${record.subscriberId}-${record.timestamp}`}>
                    <td>{record.subscriberId}</td>
                    <td className="numeric">{record.callMinutes.toLocaleString()}</td>
                    <td className="numeric">{record.smsCount.toLocaleString()}</td>
                    <td className="numeric">{record.dataUsageMB.toLocaleString()}</td>
                    <td>{new Date(record.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
