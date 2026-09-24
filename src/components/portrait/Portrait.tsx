import Image from 'next/image';
import type { Image as ImageData } from '@/content';
import styles from './Portrait.module.css';

type Props = {
  logo: ImageData;
  alt: string;
  className?: string;
  sizes: string;
};

/** The drawn portrait: a body shape with the logo in the head circle. */
export function Portrait({ logo, alt, className, sizes }: Props) {
  return (
    <span className={className ? `${styles.portrait} ${className}` : styles.portrait} role="img" aria-label={alt}>
      <span className={styles.head}>
        <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes={sizes} />
      </span>
    </span>
  );
}
