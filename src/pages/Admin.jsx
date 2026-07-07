import React, { useState, useEffect } from 'react';
import { Lock, Unlock, MessageCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../firebase';
import { ref, onValue, update, remove, set } from "firebase/database";
import { BarChart2, Plus, Trash2, StopCircle, QrCode } from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [pollBank, setPollBank] = useState([
    "الارتباط عن طريق الصالونات ناجح؟",
    "الشكل الخارجي أهم من الطبع في البداية؟",
    "الحدود ضرورية حتى في الخطوبة المتقدمة؟"
  ]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [livePoll, setLivePoll] = useState({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const questionsRef = ref(database, 'questions');
      const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const questionsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a, b) => b.timestamp - a.timestamp);
          setQuestions(questionsArray);
        } else {
          setQuestions([]);
        }
      });

      const livePollRef = ref(database, 'livePoll');
      const unsubscribePoll = onValue(livePollRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLivePoll(data);
        } else {
          setLivePoll({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
        }
      });
      
      return () => {
        unsubscribeQuestions();
        unsubscribePoll();
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
    const questionRef = ref(database, `questions/${id}`);
    remove(questionRef);
  };

  const activatePoll = (questionText) => {
    const livePollRef = ref(database, 'livePoll');
    set(livePollRef, { isActive: true, questionText, trueCount: 0, falseCount: 0 });
  };

  const endPoll = () => {
    const livePollRef = ref(database, 'livePoll');
    update(livePollRef, { isActive: false });
  };

  const addToPollBank = () => {
    if (newPollQuestion.trim() !== '') {
      setPollBank([newPollQuestion, ...pollBank]);
      setNewPollQuestion('');
    }
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
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>لوحة تحكم الخدام</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setShowQr(true)} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}>
            <QrCode size={16} /> QR Code
          </button>
          <button onClick={() => setIsAuthenticated(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Unlock size={16} /> تسجيل خروج
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{
            padding: '40px', borderRadius: '20px', textAlign: 'center',
            border: '2px solid var(--accent-gold)'
          }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '20px', fontSize: '1.5rem' }}>امسح الكود للدخول</h3>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin)}`} 
                alt="QR Code" 
                style={{ width: '250px', height: '250px' }} 
              />
            </div>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>يمكنك عرض هذا الكود على شاشة البروجيكتور أو طباعته.</p>
            <button onClick={() => setShowQr(false)} className="btn-primary" style={{ width: '100%' }}>إغلاق</button>
          </div>
        </div>
      )}

      {/* Live Poll Section */}
      <div className="glass-panel" style={{ padding: '25px', borderRadius: '15px', marginBottom: '30px', border: '1px solid var(--accent-gold)' }}>
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 /> نظام التصويت اللحظي
        </h3>
        
        {livePoll.isActive ? (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'red', boxShadow: '0 0 10px red', animation: 'pulse 1s infinite' }} />
              <h4 style={{ color: 'white', fontSize: '1.2rem' }}>التصويت مفعل الآن للشباب</h4>
            </div>
            <p style={{ color: 'var(--primary-green)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>{livePoll.questionText}</p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'rgba(0,255,136,0.2)', padding: '15px 30px', borderRadius: '15px', border: '1px solid var(--primary-green)' }}>
                <p style={{ fontSize: '1.2rem', color: 'white' }}>صح ✅</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{livePoll.trueCount}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255,68,68,0.2)', padding: '15px 30px', borderRadius: '15px', border: '1px solid #ff4444' }}>
                <p style={{ fontSize: '1.2rem', color: 'white' }}>خطأ ❌</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff4444' }}>{livePoll.falseCount}</p>
              </div>
            </div>
            <button onClick={endPoll} className="btn-primary" style={{ background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)' }}>
              <StopCircle size={20} /> إيقاف وإخفاء التصويت
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="أضف سؤال تصويت جديد لبنك الأسئلة..."
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
              />
              <button onClick={addToPollBank} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={20} /> إضافة</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pollBank.map((q, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'white', fontSize: '1.1rem' }}>{q}</p>
                  <button onClick={() => activatePoll(q)} className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>تفعيل الآن</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-green)', marginBottom: '15px' }}>الأسئلة المجهولة الواردة</h2>

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
                  <MessageCircle color={'var(--accent-gold)'} size={24} />
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px', color: 'var(--text-light)' }}>{q.text}</p>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {new Date(q.timestamp).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>
                <button onClick={() => markAsAnswered(q.id)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}>
                  <Trash2 size={16} /> تم الرد (حذف)
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Admin;
