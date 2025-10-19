'use client';
import React, { useEffect, useState } from 'react';
import LoginModal from '../../components/LoginModal';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // ensure it opens when the route is visited
    setVisible(true);
  }, []);

  const hide = () => {
    setVisible(false);
    // navigate away when the dialog is closed so route doesn't remain /login
    router.push('/');
  };

  return (
    <div className="h-full w-full">
      <LoginModal visible={visible} onHide={hide} />
    </div>
  );
}