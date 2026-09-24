import Image, { type ImageProps } from 'next/image';
import { supabaseUrl } from '@/lib/supabase/config';

/** True for addresses next/image can optimise: local files and Supabase Storage uploads. */
const optimisable = (src: string) => src.startsWith('/') || (Boolean(supabaseUrl) && src.startsWith(`${supabaseUrl}/storage/`));

/**
 * next/image for pictures that come from the content (and so from the admin
 * panel): a picture with no address yet renders nothing, and one hosted
 * elsewhere is shown as is rather than refused.
 */
export function ContentImage({ src, alt, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  if (!src) return null;
  return <Image src={src} alt={alt} unoptimized={!optimisable(src)} {...props} />;
}
