import React, { useState, useEffect } from 'react';
import { Lock, Unlock, MessageCircle, CheckCircle } from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);

  // Mock fetching questions
  useEffect(() => {
    if (isAuthenticated) {
      // In reality, this would fetch from Firebase
      const storedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
      if (storedQuestions.length === 0) {
        const mockQuestions = [
          { id: 1, text: 'هل الارتباط عن طريق الصالونات ناجح؟', timestamp: new Date().getTime(), answered: false },
          { id: 2, text: 'إزاي أعرف إن الشخص ده مناسب ليا نفسياً؟', timestamp: new Date().getTime() - 100000, answered: true },
        ];
        setQuestions(mockQuestions);
      } else {
        setQuestions(storedQuestions);
      }
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
          <h2 style={{ color: 'var(--dark-green)', marginBottom: '20px' }}>لوحة تحكم الخدام</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="أدخل الرمز السري" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '5px' }}
            />
            {error && <p style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)' }}>أسئلة الشباب</h2>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Unlock size={16} /> تسجيل خروج
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {questions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>لا توجد أسئلة حالياً.</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: q.answered ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <MessageCircle color={q.answered ? '#ccc' : 'var(--accent-gold)'} size={24} />
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{q.text}</p>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;
