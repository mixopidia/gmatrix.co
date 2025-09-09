import React, { useState } from 'react';

import { api, setToken } from '../lib/api';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('...');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const { data } = await api.post(url, { email, password });
      if (data?.token) {
        setToken(data.token);
        setMsg('✅ Token saved. You can close this tab and place orders.');
      } else {
        setMsg(JSON.stringify(data));
      }
    } catch (err) {
      setMsg('❌ ' + (err?.response?.data?.error || err.message));
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto' }}>
      <h3 style={{ marginBottom: 16 }}>Auth ({mode})</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          className={`btn btn-sm ${
            mode === 'login' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={`btn btn-sm ${
            mode === 'register' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setMode('register')}
        >
          Sign up
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="mb-2">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-success w-100">
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
      <div
        style={{
          marginTop: 12,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg}
      </div>
    </div>
  );
}
