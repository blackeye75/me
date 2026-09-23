import type { CSSProperties } from 'react';
import type { Cover as CoverData, TermLine } from '@/content';
import styles from './Cover.module.css';

type Props = {
  cover: CoverData;
  /** Extra class from the parent, for sizing the cover in its context. */
  className?: string;
};

const bars = [38, 52, 44, 70, 58, 82, 66, 92, 74, 88];

const cssVars = (vars: Record<string, string>) => vars as CSSProperties;

function WindowBar() {
  return <span className={styles.bar}><i /><i /><i /></span>;
}

function TermLineView({ line }: { line: TermLine }) {
  if ('command' in line) return <b>{line.command}</b>;
  const Tag = line.tone === 'error' ? 's' : line.tone === 'warn' ? 'u' : 'span';
  return (
    <span>
      {line.stamp && <em>{line.stamp}</em>}
      {line.stamp && ' '}
      {line.tag && <Tag>{line.tag}</Tag>}
      {line.tag && ' '}
      {line.text}
    </span>
  );
}

/** A small, CSS-drawn picture of a project: dashboard, terminal, shop, whiteboard or search. */
export function Cover({ cover, className }: Props) {
  const variantClass = cover.variant === 'dash' ? '' : styles[cover.variant];
  const classes = [styles.cover, variantClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden="true">
      <span className={styles.win}>
        <WindowBar />
        {cover.variant === 'dash' && (
          <>
            <span className={styles.kpis}><i /><i /><i /></span>
            <span className={styles.chart}>
              {bars.map((h, i) => <i key={i} style={cssVars({ '--h': `${h}%` })} />)}
            </span>
            <span className={styles.rows}><i /><i /><i /></span>
          </>
        )}
        {cover.variant === 'term' && (
          <span className={styles.lines}>
            {cover.lines.map((line, i) => <TermLineView key={i} line={line} />)}
            <b className={styles.cursor}>_</b>
          </span>
        )}
        {cover.variant === 'shop' && (
          <>
            <span className={styles.nav}><i /><i /></span>
            <span className={styles.grid}>
              <span className={styles.tile}><i /></span>
              <span className={styles.tile}><i /></span>
              <span className={styles.tile}><i /></span>
            </span>
            <span className={styles.rows}><i /><i /></span>
          </>
        )}
        {cover.variant === 'board' && (
          <span className={styles.canvas}>
            <span className={styles.node} style={cssVars({ '--x': '8%', '--y': '18%' })}>Client</span>
            <span className={styles.node} style={cssVars({ '--x': '40%', '--y': '50%' })}>Relay</span>
            <span className={styles.node} style={cssVars({ '--x': '72%', '--y': '18%' })}>Store</span>
            <span className={styles.edge} style={cssVars({ '--x': '24%', '--y': '34%', '--w': '20%', '--r': '32deg' })} />
            <span className={styles.edge} style={cssVars({ '--x': '56%', '--y': '52%', '--w': '20%', '--r': '-32deg' })} />
            <span className={styles.tag} style={cssVars({ '--x': '62%', '--y': '70%' })}>Ana</span>
            <span className={`${styles.tag} ${styles.tagB}`} style={cssVars({ '--x': '20%', '--y': '66%' })}>Sam</span>
          </span>
        )}
        {cover.variant === 'search' && (
          <>
            <span className={styles.query}>{cover.query}</span>
            {cover.tags.map((tag) => (
              <span key={tag} className={styles.result}><i /><i /><i /><b>{tag}</b></span>
            ))}
          </>
        )}
      </span>
    </span>
  );
}
