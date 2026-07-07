import React, { useState, useEffect } from 'react';
import { Lock, Unlock, MessageCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);

  const loadQuestions = () => {
    const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
    setQuestions(storedQuestions);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions();
      
      // Listen for changes from other tabs to mock real-time throwing
      const handleStorage = (e) => {
        if (e.key === 'questions') {
          loadQuestions();
        }
      };
      
      window.addEventListener('storage', handleStorage);
      
      // Also poll every 2 seconds just in case it's same tab or mobile weirdness
      const interval = setInterval(loadQuestions, 2000);
      
      return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === '1234') { // Simple hardcoded PIN
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
      setPin('');
    }
  };

  const markAsAnswered = (id) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, answered: true } : q));
    // In reality, update Firebase here
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <Lock size={48} color="var(--primary-green)" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-light)', marginBottom: '20px', textShadow: '0 0 10px rgba(0,255,136,0.2)' }}>لوحة تحكم الخدام</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="أدخل الرمز السري" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '15px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '5px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
            />
            {error && <p style={{ color: '#ff4444', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>أسئلة الشباب</h2>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Unlock size={16} /> تسجيل خروج
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {questions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>لا توجد أسئلة حالياً.</p>
        ) : (
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, scale: 0.5, y: -100, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.05 }}
                className="glass-panel" 
                style={{ 
                  padding: '20px', borderRadius: '15px', display: 'flex', 
                  justifyContent: 'space-between', alignItems: 'center', 
                  opacity: q.answered ? 0.4 : 1,
                  borderLeft: q.answered ? '4px solid #444' : '4px solid var(--accent-gold)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <MessageCircle color={q.answered ? '#666' : 'var(--accent-gold)'} size={24} />
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px', color: 'var(--text-light)' }}>{q.text}</p>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {new Date(q.timestamp).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>
                {!q.answered && (
                  <button onClick={() => markAsAnswered(q.id)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}>
                    <CheckCircle size={16} /> تم الرد
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Admin;
