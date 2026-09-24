'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const signOut = async () => {
    await createClient().auth.signOut();
    router.refresh();
  };
  return <button type="button" className={className} onClick={signOut}>Sign out</button>;
}
