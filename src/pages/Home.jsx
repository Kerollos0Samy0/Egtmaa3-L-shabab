import React, { useState, useEffect } from 'react';
import { courseData } from '../data/courseData';
import { Calendar, Clock, BookOpen, MessageCircle, Lock } from 'lucide-react';

const Home = () => {
  const [now, setNow] = useState(new Date().getTime());

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

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)', marginBottom: '10px' }}>جدول الكورس</h2>
        <p style={{ color: '#666' }}>تفضل بمتابعة أيام الكورس ومواعيد الفقرات</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courseData.map((day) => (
          <div key={day.id} className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--dark-green)' }}>
                اليوم {day.id}:{' '}
                <span style={{ 
                  filter: day.id !== 1 ? 'blur(6px)' : 'none',
                  userSelect: day.id !== 1 ? 'none' : 'auto',
                  transition: 'filter 0.3s ease'
                }}>
                  {day.title}
                </span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#555', fontWeight: 'bold' }}>
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
                    backgroundColor: session.type === 'break' ? '#f0f0f0' : 'white',
                    padding: '12px',
                    borderRadius: '10px',
                    border: session.type === 'break' ? '1px dashed #ccc' : '1px solid #eee'
                  }}>
                    <div style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '5px', width: '80px' }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.9rem' }}>{session.time}</span>
                    </div>
                    <div style={{ fontWeight: session.type === 'session' ? 'bold' : 'normal', flex: 1 }}>
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
                  padding: '20px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '10px',
                  color: '#666',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Lock size={32} color="var(--accent-gold)" />
                  <p style={{ fontWeight: 'bold' }}>تفاصيل اليوم لم تظهر بعد!</p>
                  <p style={{ fontSize: '0.9rem' }}>ستظهر التفاصيل تلقائياً يوم السبت الساعة 7 صباحاً</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Ask Button */}
      <button 
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
          zIndex: 1000,
        }}
      >
        <MessageCircle size={20} />
        إسأل براحتك
      </button>
    </div>
  );
};

export default Home;
