import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, remove } from "firebase/database";
import { BarChart2, QrCode, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Projector = () => {
  const [livePoll, setLivePoll] = useState({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const livePollRef = ref(database, 'livePoll');
    const unsubscribePoll = onValue(livePollRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLivePoll(data);
      } else {
        setLivePoll({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
      }
    });

    const questionsRef = ref(database, 'questions');
    const unsubscribeQuestions = onValue(questionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const questionsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        // Only show up to 5 most recent unanswered questions on the projector
        setQuestions(questionsArray.filter(q => !q.answered).slice(0, 5));
      } else {
        setQuestions([]);
      }
    });
    
    return () => {
      unsubscribePoll();
      unsubscribeQuestions();
    };
  }, []);

  const markAsAnswered = (id) => {
    const questionRef = ref(database, `questions/${id}`);
    remove(questionRef);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'var(--bg-dark)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      padding: '40px',
      overflowY: 'auto'
    }}>
      {livePoll.isActive ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '60px', borderRadius: '30px', textAlign: 'center', width: '100%', maxWidth: '1000px', border: '3px solid var(--primary-green)', boxShadow: '0 0 50px rgba(0,255,136,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'red', boxShadow: '0 0 20px red', animation: 'pulse 1s infinite' }} />
              <h2 style={{ color: 'white', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><BarChart2 size={40} /> تصويت مباشر</h2>
            </div>
            <p style={{ color: 'var(--primary-green)', fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '50px', lineHeight: '1.4' }}>{livePoll.questionText}</p>
            
            <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
              <div style={{ backgroundColor: 'rgba(0,255,136,0.2)', padding: '40px', borderRadius: '20px', border: '2px solid var(--primary-green)', flex: 1 }}>
                <p style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>صح ✅</p>
                <p style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--primary-green)', margin: 0 }}>{livePoll.trueCount}</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255,68,68,0.2)', padding: '40px', borderRadius: '20px', border: '2px solid #ff4444', flex: 1 }}>
                <p style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>خطأ ❌</p>
                <p style={{ fontSize: '6rem', fontWeight: 'bold', color: '#ff4444', margin: 0 }}>{livePoll.falseCount}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', height: '100%', gap: '40px' }}>
          
          {/* Left Side: Title and QR Code */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingRight: '40px' }}>
            <h1 style={{ color: 'var(--primary-green)', fontSize: '4rem', marginBottom: '10px', textShadow: '0 0 20px rgba(0,255,136,0.3)', textAlign: 'center' }}>نعمل جبانيوت؟</h1>
            <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', marginBottom: '50px', textAlign: 'center' }}>اجتماع يوسف الصديق للشباب</h2>
            
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '30px', textAlign: 'center', border: '2px solid var(--accent-gold)' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin)}`} 
                  alt="QR Code" 
                  style={{ width: '300px', height: '300px' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: 'var(--text-light)' }}>
                <QrCode size={30} />
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>امسح الكود للدخول والمشاركة</p>
              </div>
            </div>
          </div>

          {/* Right Side: Live Questions Feed */}
          <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-light)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <MessageCircle size={40} color="var(--primary-green)" /> الأسئلة المباشرة
            </h2>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>
              {questions.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#666', fontSize: '2rem', textAlign: 'center' }}>في انتظار أسئلتكم...</p>
                </div>
              ) : (
                <AnimatePresence>
                  {questions.map((q, i) => (
                    <motion.div 
                      key={q.id}
                      initial={{ opacity: 0, x: 100, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 100, damping: 12, delay: i * 0.1 }}
                      className="glass-panel"
                      style={{ 
                        padding: '25px 30px', 
                        borderRadius: '20px', 
                        borderRight: '5px solid var(--primary-green)',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px'
                      }}
                    >
                      <p style={{ fontSize: '1.8rem', color: 'white', lineHeight: '1.5', fontWeight: 'bold', flex: 1 }}>{q.text}</p>
                      <button 
                        onClick={() => markAsAnswered(q.id)} 
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '1.2rem', flexShrink: 0 }}
                      >
                        <Trash2 size={24} /> تم الرد (حذف)
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Projector;
