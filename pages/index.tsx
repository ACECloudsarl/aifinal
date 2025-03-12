// pages/index.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/explore');
    } else {
      router.push('/login');
    }
  }, [router, session, status]);
  
  return null;
}