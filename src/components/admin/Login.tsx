'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import styles from './admin.module.css';

/** Email and password sign-in with a Supabase user. */
export function Login({ name }: { name: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: signInError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className={styles.root}>
      <div className={styles.split}>
        <div className={styles.poster}>
          <span className={styles.brandSub}>{name} · Studio</span>
          <p className={styles.posterTitle}>Studio</p>
          <p className={styles.posterNote}>Edit every word, picture and project on the site. Changes publish as soon as you save.</p>
        </div>
        <div className={styles.panel}>
          <form className={styles.form} onSubmit={submit}>
            <h1 className={styles.formTitle}>Sign in</h1>
            <p className={styles.formSub}>Use the account you created in Supabase.</p>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input className={styles.input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input className={styles.input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={`${styles.btn} ${styles.primary}`} type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            <a className={`${styles.btn} ${styles.quiet}`} href="/">Back to the site</a>
          </form>
        </div>
      </div>
    </div>
  );
}
