import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Register = () => {
  const { register } = useAuth();
  const { push: toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ username, email, password, fullName });
      toast('Registration successful! Check your email to verify your account.', { type: 'success' });
    } catch (err) {
      toast(err?.response?.data?.message || 'Registration failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
    </form>
  );
};

export default Register;
