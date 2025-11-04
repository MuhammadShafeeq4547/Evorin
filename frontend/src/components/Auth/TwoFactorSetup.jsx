import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('initial'); // 'initial', 'verify', 'success'
  const { setupTwoFactor, verifyTwoFactor } = useAuth();

  const handleSetup = async () => {
    try {
      const result = await setupTwoFactor();
      if (result.success) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setBackupCodes(result.backupCodes);
        setStep('verify');
      } else {
        setError(result.error || 'Failed to set up 2FA');
      }
    } catch (err) {
      setError('An error occurred during setup');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const result = await verifyTwoFactor(verificationCode);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || 'Invalid verification code');
    }
  };

  if (step === 'initial') {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
        <p className="mb-4 text-gray-600">
          Two-factor authentication adds an extra layer of security to your account.
          Once enabled, you'll need to enter a code from your authenticator app when signing in.
        </p>
        <button
          onClick={handleSetup}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Begin Setup
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">1. Scan QR Code</h3>
          <div className="mb-4">
            <img src={qrCode} alt="QR Code" className="max-w-xs mx-auto" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Scan this QR code with your authenticator app, or manually enter this secret:
          </p>
          <code className="block p-2 bg-gray-100 rounded text-sm mb-4">
            {secret}
          </code>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">2. Save Backup Codes</h3>
          <p className="text-sm text-gray-600 mb-2">
            Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-100 rounded">
            {backupCodes.map((code, index) => (
              <code key={index} className="text-sm">{code}</code>
            ))}
          </div>
        </div>

        <form onSubmit={handleVerify} className="mt-6">
          <h3 className="text-lg font-semibold mb-2">3. Verify Setup</h3>
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Enter the code from your authenticator app
            </label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Verify and Enable
          </button>
        </form>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Setup Complete!</h2>
        <p className="text-green-600 mb-4">
          Two-factor authentication has been successfully enabled for your account.
        </p>
        <p className="text-gray-600">
          You'll need to enter a code from your authenticator app the next time you sign in.
        </p>
      </div>
    );
  }
};

export default TwoFactorSetup;