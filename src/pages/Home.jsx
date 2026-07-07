import React, { useState, useEffect } from 'react';
import { courseData } from '../data/courseData';
import { Calendar, Clock, BookOpen, MessageCircle, Lock } from 'lucide-react';

const Home = () => {
  const [now, setNow] = useState(new Date().getTime());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');

  useEffect(() => {
    // Update time every minute to refresh visibility automatically
    const interval = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isVisible = (fullDateString) => {
    const sessionTime = new Date(fullDateString).getTime();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    return now >= (sessionTime - twelveHoursMs);
  };

  const handleSendQuestion = () => {
    if (!questionText.trim()) return;
    const existing = JSON.parse(localStorage.getItem('questions') || '[]');
    const newQuestion = {
      id: Date.now(),
      text: questionText,
      timestamp: Date.now(),
      answered: false
    };
    localStorage.setItem('questions', JSON.stringify([newQuestion, ...existing]));
    setQuestionText('');
    setIsModalOpen(false);
    alert('تم إرسال سؤالك بنجاح! شكراً لمشاركتك.');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-green)', marginBottom: '10px', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>جدول الكورس</h2>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>تفضل بمتابعة أيام الكورس ومواعيد الفقرات</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courseData.map((day) => (
          <div key={day.id} className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-light)' }}>
                اليوم {day.id}:{' '}
                <span style={{ 
                  filter: day.id !== 1 ? 'blur(6px)' : 'none',
                  userSelect: day.id !== 1 ? 'none' : 'auto',
                  transition: 'filter 0.3s ease',
                  color: 'var(--accent-gold)'
                }}>
                  {day.title}
                </span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#aaa', fontWeight: 'bold' }}>
                <Calendar size={18} />
                <span>{day.date}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isVisible(day.fullDate) ? (
                day.sessions.map((session, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px',
                    backgroundColor: session.type === 'break' ? 'rgba(255, 207, 51, 0.05)' : 'var(--glass-bg)',
                    padding: '12px',
                    borderRadius: '10px',
                    border: session.type === 'break' ? '1px dashed var(--accent-gold)' : '1px solid var(--glass-border)'
                  }}>
                    <div style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '5px', width: '80px' }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.9rem' }}>{session.time}</span>
                    </div>
                    <div style={{ fontWeight: session.type === 'session' ? 'bold' : 'normal', flex: 1, color: session.type === 'break' ? 'var(--accent-gold)' : 'var(--text-light)' }}>
                      {session.title}
                    </div>
                    {session.type === 'session' && (
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <BookOpen size={14} /> ملاحظات
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px', 
                  background: 'var(--glass-bg)', 
                  borderRadius: '15px',
                  color: '#aaa',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <Lock size={40} color="var(--accent-gold)" />
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-light)' }}>تفاصيل اليوم لم تظهر بعد!</p>
                  <p style={{ fontSize: '0.9rem' }}>ستظهر التفاصيل تلقائياً يوم السبت الساعة 7 صباحاً</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Ask Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'var(--dark-green)',
          color: 'var(--accent-gold)',
          border: 'none',
          padding: '15px 25px',
          borderRadius: '30px',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
        }}
      >
        <MessageCircle size={20} />
        إسأل براحتك
      </button>

      {/* Question Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{
            padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px',
            border: '1px solid var(--primary-green)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)'
          }}>
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '15px', fontSize: '1.5rem' }}>اسأل براحتك (بدون اسم)</h3>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="اكتب سؤالك أو استفسارك هنا ولن يعرف أحد هويتك..."
              style={{
                width: '100%', height: '150px', padding: '15px', borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px', fontSize: '1.1rem', resize: 'none',
                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white'
              }}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSendQuestion}>إرسال السؤال</button>
              <button className="btn-gold" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
