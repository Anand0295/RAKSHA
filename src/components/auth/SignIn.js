import React, { useState } from 'react';

function SignIn({ onLogin }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (loginId === 'admin@mod.gov.in' && password === 'demo123') {
      setTimeout(() => {
        onLogin({ email: 'admin@mod.gov.in', role: 'Admin' });
        setLoading(false);
      }, 500);
    } else {
      setTimeout(() => {
        setError('Invalid credentials');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img
          src="/Ministry-of-Defence-resized.jpg"
          alt="Ministry of Defence India"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-8 text-white space-y-2">
          <h1 className="text-2xl font-semibold tracking-wide">Ministry of Defence, India</h1>
          <p className="text-sm text-white/80 max-w-md">Indian Armed Forces Command Portal. Authorized personnel only.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg border">
          <div className="p-6 pb-4 lg:hidden text-center mb-4">
            <img
              src="/Ministry_of_Defence_India.svg"
              alt="Ministry of Defence India"
              className="h-16 mx-auto mb-3"
            />
          </div>
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold">Secure Sign In</h2>
            <p className="text-sm text-gray-600">Use your issued credentials</p>
          </div>
          <div className="px-6 pb-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="loginId" className="text-sm font-medium">Login ID</label>
                <input
                  id="loginId"
                  type="email"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  placeholder="your.email@mod.gov.in"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;