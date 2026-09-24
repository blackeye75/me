'use client';

import { type ChangeEvent, useId, useState } from 'react';
import type { Field, ListItem } from '@/cms/schema';
import { MEDIA_BUCKET } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/browser';
import styles from './admin.module.css';

type Obj = Record<string, unknown>;
type Change<T = unknown> = (value: T) => void;

const asObj = (value: unknown): Obj => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Obj) : {});
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asText = (value: unknown) => (value === undefined || value === null ? '' : String(value));

/** A title for a list item, from its title field (joined if it is a list of lines). */
const titleOf = (item: unknown, key: string) => {
  const value = asObj(item)[key];
  return Array.isArray(value) ? value.join(' ') : asText(value);
};

/** One form control for a field description, recursing into groups and lists. */
export function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: Change }) {
  switch (field.kind) {
    case 'text': return <TextField field={field} value={asText(value)} onChange={onChange} />;
    case 'number': return <NumberField field={field} value={value} onChange={onChange} />;
    case 'select': return <SelectField field={field} value={asText(value)} onChange={onChange} />;
    case 'lines': return <LinesField field={field} value={asList(value).map(asText)} onChange={onChange} />;
    case 'image': return <ImageField field={field} value={asObj(value)} onChange={onChange} />;
    case 'media': return <MediaField field={field} value={asText(value)} onChange={onChange} />;
    case 'group': return <GroupField field={field} value={asObj(value)} onChange={onChange} />;
    case 'list': return <ListField label={field.label} hint={field.hint} item={field.item} value={asList(value)} onChange={onChange} />;
  }
}

/** Several fields of one object, laid out in order. */
export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: Change<Obj> }) {
  return (
    <>
      {fields.map((field) => (
        <FieldInput key={field.key} field={field} value={value[field.key]} onChange={(next) => onChange({ ...value, [field.key]: next })} />
      ))}
    </>
  );
}

function Label({ id, field }: { id: string; field: { label: string; hint?: string } }) {
  return (
    <>
      <label className={styles.label} htmlFor={id}>{field.label}</label>
      {field.hint && <p className={styles.hint}>{field.hint}</p>}
    </>
  );
}

function TextField({ field, value, onChange }: { field: Extract<Field, { kind: 'text' }>; value: string; onChange: Change }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      {field.multiline
        ? <textarea id={id} className={`${styles.textarea} ${field.mono ? styles.mono : ''}`} rows={field.rows ?? 3} value={value} spellCheck={!field.mono} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function NumberField({ field, value, onChange }: { field: Extract<Field, { kind: 'number' }>; value: unknown; onChange: Change }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <input id={id} className={styles.input} type="number" inputMode="numeric" value={typeof value === 'number' && !Number.isNaN(value) ? value : ''} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
    </div>
  );
}

function SelectField({ field, value, onChange }: { field: Extract<Field, { kind: 'select' }>; value: string; onChange: Change }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const clean = (t: string) => t.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');

/** A list of short texts edited as lines. Blank lines are dropped from the saved value. */
function LinesField({ field, value, onChange }: { field: Extract<Field, { kind: 'lines' }>; value: string[]; onChange: Change }) {
  const id = useId();
  const joined = value.join('\n');
  const [text, setText] = useState(joined);
  const [seen, setSeen] = useState(joined);
  // Follow outside changes (discard, reset) without fighting the cursor while typing.
  if (joined !== seen) {
    setSeen(joined);
    if (clean(text) !== joined) setText(joined);
  }
  const change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean));
  };
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <textarea id={id} className={styles.textarea} rows={Math.max(2, value.length + 1)} value={text} onChange={change} />
    </div>
  );
}

function GroupField({ field, value, onChange }: { field: Extract<Field, { kind: 'group' }>; value: Obj; onChange: Change }) {
  return (
    <fieldset className={styles.group}>
      <legend className="sr-only">{field.label}</legend>
      <div className={styles.groupTitle} aria-hidden="true">{field.label}</div>
      {field.hint && <p className={styles.hint}>{field.hint}</p>}
      <Fields fields={field.fields} value={value} onChange={onChange} />
    </fieldset>
  );
}

/** A list of objects: open an item to edit it; add, remove, duplicate and reorder. */
export function ListField({ label, hint, item, value, onChange }: { label: string; hint?: string; item: ListItem; value: unknown[]; onChange: Change<unknown[]> }) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    if (open === from) setOpen(to);
  };
  const remove = (index: number) => {
    const name = titleOf(value[index], item.titleKey) || `this ${item.noun}`;
    if (!window.confirm(`Remove ${name}?`)) return;
    onChange(value.filter((_, i) => i !== index));
    setOpen(null);
  };
  const duplicate = (index: number) => {
    const next = [...value];
    next.splice(index + 1, 0, structuredClone(value[index]));
    onChange(next);
    setOpen(index + 1);
  };
  const add = () => {
    onChange([...value, item.empty()]);
    setOpen(value.length);
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.list}>
        {value.length === 0 && <p className={styles.empty}>No {item.noun}s yet.</p>}
        {value.map((entry, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={styles.item} data-open={isOpen ? '' : undefined}>
              <div className={styles.itemHead}>
                <button type="button" className={styles.itemToggle} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className={styles.itemNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.itemTitle}>{titleOf(entry, item.titleKey)}</span>
                  <span className={styles.chev} aria-hidden="true">›</span>
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
                <button type="button" className={styles.iconBtn} onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Move down" title="Move down">↓</button>
                <button type="button" className={styles.iconBtn} onClick={() => duplicate(i)} aria-label="Duplicate" title="Duplicate">⧉</button>
                <button type="button" className={styles.iconBtn} onClick={() => remove(i)} aria-label="Remove" title="Remove">✕</button>
              </div>
              {isOpen && (
                <div className={styles.itemBody}>
                  <Fields fields={item.fields} value={asObj(entry)} onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))} />
                </div>
              )}
            </div>
          );
        })}
        <button type="button" className={styles.add} onClick={add}>+ Add {item.noun}</button>
      </div>
    </div>
  );
}

/** Uploads a file to the media bucket and returns its public address. */
async function upload(file: File) {
  const supabase = createClient();
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
  const path = `uploads/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Reads a picture's natural size, so the site can reserve its space. */
const measure = (src: string) => new Promise<{ width: number; height: number } | null>((resolve) => {
  const img = new Image();
  img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
  img.onerror = () => resolve(null);
  img.src = src;
});

function Preview({ src }: { src: string }) {
  const isVideo = /\.(webm|mp4|mov)(\?|$)/i.test(src);
  return (
    <div className={styles.thumb}>
      {!src && <span className={styles.thumbEmpty}>No file</span>}
      {src && isVideo && <video src={src} muted playsInline loop autoPlay />}
      {/* Previews of any address the editor types; next/image would need every host allowed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && !isVideo && <img src={src} alt="" />}
    </div>
  );
}

function UploadButton({ accept, onUploaded, onError }: { accept?: string; onUploaded: (url: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      onUploaded(await upload(file));
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <span className={`${styles.btn} ${styles.small} ${styles.upload}`} aria-disabled={busy}>
      {busy ? 'Uploading…' : 'Upload'}
      <input type="file" accept={accept} onChange={pick} disabled={busy} aria-label="Upload a file" />
    </span>
  );
}

/** A file address (logo, video) with preview and upload. */
function MediaField({ field, value, onChange }: { field: Extract<Field, { kind: 'media' }>; value: string; onChange: Change }) {
  const id = useId();
  const [error, setError] = useState('');
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <div className={styles.media}>
        <Preview src={value} />
        <div className={styles.mediaFields}>
          <div className={styles.inline}>
            <input id={id} className={styles.input} value={value} placeholder="/assets/… or https://…" onChange={(e) => onChange(e.target.value)} />
            <UploadButton accept={field.accept} onUploaded={(url) => { setError(''); onChange(url); }} onError={setError} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

/** A picture: address with preview and upload, description and size. */
function ImageField({ field, value, onChange }: { field: Extract<Field, { kind: 'image' }>; value: Obj; onChange: Change }) {
  const id = useId();
  const [error, setError] = useState('');
  const set = (patch: Obj) => onChange({ ...value, ...patch });
  const uploaded = async (url: string) => {
    setError('');
    const size = await measure(url);
    set({ src: url, ...(size ?? {}) });
  };
  return (
    <div className={styles.field}>
      <Label id={id} field={field} />
      <div className={styles.media}>
        <Preview src={asText(value.src)} />
        <div className={styles.mediaFields}>
          <div className={styles.inline}>
            <input id={id} className={styles.input} value={asText(value.src)} placeholder="/assets/… or https://…" onChange={(e) => set({ src: e.target.value })} />
            <UploadButton accept="image/*" onUploaded={uploaded} onError={setError} />
          </div>
          <input className={styles.input} value={asText(value.alt)} placeholder="Description for screen readers" aria-label={`${field.label}: description`} onChange={(e) => set({ alt: e.target.value })} />
          <div className={styles.row}>
            <input className={styles.input} type="number" value={Number(value.width) || ''} placeholder="Width" aria-label={`${field.label}: width in pixels`} onChange={(e) => set({ width: Number(e.target.value) || 0 })} />
            <input className={styles.input} type="number" value={Number(value.height) || ''} placeholder="Height" aria-label={`${field.label}: height in pixels`} onChange={(e) => set({ height: Number(e.target.value) || 0 })} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
