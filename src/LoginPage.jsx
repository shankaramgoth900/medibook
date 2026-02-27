import { useState } from 'react';
import { useAuth } from './AuthContext';

export const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onLoginSuccess?.();
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '30px', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1>{isSignup ? 'Sign Up' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: '#0f4c75', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
        </button>
      </form>
      <button 
        onClick={() => setIsSignup(!isSignup)}
        style={{ marginTop: '10px', background: 'none', border: 'none', color: '#0f4c75', cursor: 'pointer' }}
      >
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};
