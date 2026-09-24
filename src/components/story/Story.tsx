import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import styles from './Story.module.css';

/** The pinned strip that holds every section. Motion moves `data-track` sideways on desktop. */
export function Story({ children }: { children: ReactNode }) {
  return (
    <div data-story>
      <div className={styles.pin} data-pin>
        <div className={styles.track} data-track>
          {children}
        </div>
      </div>
    </div>
  );
}

type PanelTone = { bg: string; fg: string; line: string };

type PanelProps = {
  as?: 'section' | 'footer';
  id: string;
  className?: string;
  /** Colours the rail takes on while this panel is under it. */
  tone: PanelTone;
  /** Edge-to-edge panel with no padding; "desktop" keeps the padding on phones. */
  bleed?: boolean | 'desktop';
  /** Panel as wide as its content (desktop). */
  fit?: boolean;
  /** Panel width on desktop as a CSS length, e.g. "52vw". Defaults to one screen. */
  width?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'id' | 'children'>;

/** One full-screen panel in the story. */
export function Panel({ as: Tag = 'section', id, className, tone, bleed, fit, width, style, children, ...rest }: PanelProps) {
  return (
    <Tag
      id={id}
      className={className ? `${styles.panel} ${className}` : styles.panel}
      data-panel
      data-rail-bg={tone.bg}
      data-rail-fg={tone.fg}
      data-rail-line={tone.line}
      data-bleed={bleed === 'desktop' ? 'desktop' : bleed ? '' : undefined}
      data-fit={fit ? '' : undefined}
      style={width ? ({ ...style, '--panel-w': width } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const cornerClass = styles.corner;

/** Rail colours for each kind of panel. */
export const tones = {
  hero: { bg: '#3a3632', fg: '#f3eee8', line: '#5a524d' },
  paper: { bg: '#faf9f6', fg: '#2e2b28', line: '#b8b3ac' },
  sand: { bg: '#edeae6', fg: '#2e2b28', line: '#b8b3ac' },
  dark: { bg: '#2e2b28', fg: '#faf9f6', line: '#5a524d' },
  darkroom: { bg: '#120d0c', fg: '#d9b3aa', line: '#3a2622' },
  night: { bg: '#1f1d1b', fg: '#cccccc', line: '#5a524d' },
} satisfies Record<string, PanelTone>;
