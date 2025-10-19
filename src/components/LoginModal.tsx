'use client';
import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useUser } from '../context/UserContext';

type LoginModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function LoginModal({ visible, onHide }: LoginModalProps) {
  const { loginUser } = useUser();
  const formRef = useRef<HTMLFormElement | null>(null);

  const submit = async (e: React.FormEvent) => {
    try {
      // loginUser expects the form event and calls preventDefault itself
      await loginUser(e);
      // close modal on success
      onHide();
    } catch (err) {
      console.error('Login failed', err);
      // keep modal open for user to retry
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        className="p-button-text"
        onClick={() => {
          onHide();
        }}
      />
      <Button
        label="Sign In"
        onClick={() => {
          // request form submit so loginUser receives event.currentTarget
          formRef.current?.requestSubmit();
        }}
      />
    </div>
  );

  return (
    <Dialog
      header="Sign in"
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      className="w-full max-w-md"
      footer={footer}
    >
      <form
        ref={formRef}
        onSubmit={submit}
        className="flex flex-col gap-4"
        aria-label="login-form"
      >
        <label className="text-sm font-medium text-gray-700">Email</label>
        <InputText
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="w-full"
        />

        <label className="text-sm font-medium text-gray-700">Password</label>
        <Password
          name="password"
          placeholder="Enter your password"
          toggleMask
          feedback={false}
          required
          className="w-full"
        />

        {/* Hidden submit for accessibility; footer Sign In triggers requestSubmit */}
        <button type="submit" className="hidden" aria-hidden />
      </form>
    </Dialog>
  );
}