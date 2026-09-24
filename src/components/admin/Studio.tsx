'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { resetSection, saveSection } from '@/app/admin/actions';
import { type Field, sections } from '@/cms/schema';
import { Fields, FieldInput, ListField } from './Fields';
import { SignOutButton } from './SignOutButton';
import styles from './admin.module.css';

type Stored = Record<string, { data: unknown; updatedAt: string }>;
type Props = { defaults: Record<string, unknown>; stored: Stored; email: string; name: string };
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
/** What the editor starts from: the saved copy laid over the default, as the site does. */
const initial = (fallback: unknown, saved?: unknown) => {
  if (saved === undefined) return structuredClone(fallback);
  if (isObj(fallback) && isObj(saved)) return structuredClone({ ...fallback, ...saved });
  return structuredClone(saved);
};
const snapshot = (v: unknown) => JSON.stringify(v);
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');

/** The editor: pick a section on the left, edit it on the right, save to publish. */
export function Studio({ defaults, stored, email, name }: Props) {
  const [active, setActive] = useState(sections[0].key);
  const [drafts, setDrafts] = useState<Obj>(() => Object.fromEntries(sections.map((s) => [s.key, initial(defaults[s.key], stored[s.key]?.data)])));
  const [baseline, setBaseline] = useState<Record<string, string>>(() => Object.fromEntries(sections.map((s) => [s.key, snapshot(initial(defaults[s.key], stored[s.key]?.data))])));
  const [savedAt, setSavedAt] = useState<Record<string, string | undefined>>(() => Object.fromEntries(sections.map((s) => [s.key, stored[s.key]?.updatedAt])));
  const [toast, setToast] = useState<{ text: string; tone?: 'error' } | null>(null);
  const [pending, startTransition] = useTransition();

  const section = sections.find((s) => s.key === active)!;
  const dirty = useCallback((key: string) => snapshot(drafts[key]) !== baseline[key], [drafts, baseline]);
  const anyDirty = useMemo(() => sections.some((s) => dirty(s.key)), [dirty]);
  const groups = useMemo(() => [...new Set(sections.map((s) => s.group))], []);

  const setDraft = (key: string, value: unknown) => setDrafts((d) => ({ ...d, [key]: value }));
  const notify = (text: string, tone?: 'error') => setToast({ text, tone });

  const save = useCallback(() => {
    const key = active;
    const value = drafts[key];
    startTransition(async () => {
      const result = await saveSection(key, value);
      if (!result.ok) { notify(result.error, 'error'); return; }
      setBaseline((b) => ({ ...b, [key]: snapshot(value) }));
      setSavedAt((s) => ({ ...s, [key]: result.savedAt }));
      notify('Saved and published. The site shows it on the next visit.');
    });
  }, [active, drafts]);

  const discard = () => setDraft(active, JSON.parse(baseline[active]));

  const reset = () => {
    if (!window.confirm(`Go back to the built-in ${section.title} content? Your saved version will be deleted.`)) return;
    const key = active;
    startTransition(async () => {
      const result = await resetSection(key);
      if (!result.ok) { notify(result.error, 'error'); return; }
      const fresh = structuredClone(defaults[key]);
      setDraft(key, fresh);
      setBaseline((b) => ({ ...b, [key]: snapshot(fresh) }));
      setSavedAt((s) => ({ ...s, [key]: undefined }));
      notify('Back to the default content.');
    });
  };

  // Cmd/Ctrl + S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty(active) && !pending) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => { if (anyDirty) e.preventDefault(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onLeave);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('beforeunload', onLeave); };
  }, [active, anyDirty, dirty, pending, save]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.tone === 'error' ? 7000 : 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const state = (key: string) => (dirty(key) ? 'dirty' : savedAt[key] ? 'custom' : 'default');
  const isDirty = dirty(active);
  const value = drafts[active];

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <aside className={styles.side}>
          <div className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Studio</span>
              <span className={styles.brandSub}>{name}</span>
            </span>
          </div>

          <select className={`${styles.select} ${styles.picker}`} value={active} onChange={(e) => setActive(e.target.value as typeof active)} aria-label="Section">
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {sections.filter((s) => s.group === g).map((s) => <option key={s.key} value={s.key}>{s.title}{dirty(s.key) ? ' •' : ''}</option>)}
              </optgroup>
            ))}
          </select>

          <nav className={styles.nav} aria-label="Sections">
            {groups.map((g) => (
              <div key={g} className={styles.navGroup}>
                <span className={styles.navHeading}>{g}</span>
                {sections.filter((s) => s.group === g).map((s) => (
                  <button key={s.key} type="button" className={styles.navItem} aria-current={s.key === active} onClick={() => setActive(s.key)}>
                    <span className={styles.navLabel}>{s.title}</span>
                    <span className={styles.dot} data-state={state(s.key)} />
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.legend}>
            <span><i className={styles.dot} data-state="custom" /> Edited</span>
            <span><i className={styles.dot} data-state="default" /> Default</span>
            <span><i className={styles.dot} data-state="dirty" /> Unsaved</span>
          </div>

          <div className={styles.sideFoot}>
            <span className={styles.who} title={email}>{email}</span>
            <div className={styles.sideLinks}>
              <a className={styles.sideLink} href="/" target="_blank" rel="noopener">View site ↗</a>
              <SignOutButton className={styles.sideLink} />
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <header className={styles.head}>
            <div>
              <span className={styles.crumb}>{section.group}</span>
              <h1 className={styles.title}>{section.title}</h1>
              <p className={styles.desc}>{section.description}</p>
            </div>
            <div className={styles.actions}>
              <span className={styles.status}>
                <i className={styles.dot} data-state={state(active)} />
                {isDirty ? 'Unsaved changes' : savedAt[active] ? `Saved ${when(savedAt[active])}` : 'Default content'}
              </span>
              {savedAt[active] && <button type="button" className={`${styles.btn} ${styles.quiet} ${styles.danger}`} onClick={reset} disabled={pending}>Reset to default</button>}
              <button type="button" className={styles.btn} onClick={discard} disabled={!isDirty || pending}>Discard</button>
              <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={save} disabled={!isDirty || pending}>{pending ? 'Saving…' : 'Save & publish'}</button>
            </div>
          </header>

          <div className={styles.body} key={active}>
            {'list' in section
              ? (
                <section className={styles.card}>
                  <ListField label={section.title} item={section.list} value={Array.isArray(value) ? value : []} onChange={(next) => setDraft(active, next)} />
                </section>
              )
              : <SectionCards fields={section.fields} value={isObj(value) ? value : {}} onChange={(next) => setDraft(active, next)} />}
          </div>
        </main>
      </div>
      {toast && <div className={styles.toast} data-tone={toast.tone} role="status">{toast.text}</div>}
    </div>
  );
}

/** Plain fields together in one card; each group or list in a card of its own. */
function SectionCards({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  const blocks: { title?: string; hint?: string; fields: Field[] }[] = [];
  for (const field of fields) {
    if (field.kind === 'group') blocks.push({ title: field.label, hint: field.hint, fields: field.fields.map((f) => ({ ...f, key: `${field.key}.${f.key}` })) });
    else if (field.kind === 'list') blocks.push({ fields: [field] });
    else {
      const last = blocks[blocks.length - 1];
      if (last && !last.title && last.fields.every((f) => f.kind !== 'list')) last.fields.push(field);
      else blocks.push({ fields: [field] });
    }
  }
  return (
    <>
      {blocks.map((block, i) => (
        <section key={i} className={styles.card}>
          {block.title && <h2 className={styles.cardTitle}>{block.title}</h2>}
          {block.hint && <p className={styles.cardHint}>{block.hint}</p>}
          {block.title
            ? <GroupBody fields={block.fields} value={value} onChange={onChange} />
            : <Fields fields={block.fields} value={value} onChange={onChange} />}
        </section>
      ))}
    </>
  );
}

/** A group's fields shown directly in its card (keys are "group.field"). */
function GroupBody({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <>
      {fields.map((field) => {
        const [group, key] = field.key.split('.');
        const inner = isObj(value[group]) ? (value[group] as Obj) : {};
        return (
          <FieldInput
            key={field.key}
            field={{ ...field, key }}
            value={inner[key]}
            onChange={(next) => onChange({ ...value, [group]: { ...inner, [key]: next } })}
          />
        );
      })}
    </>
  );
}
