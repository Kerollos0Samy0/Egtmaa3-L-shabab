import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from "firebase/database";
import { BarChart2, QrCode } from 'lucide-react';

const Projector = () => {
  const [livePoll, setLivePoll] = useState({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });

  useEffect(() => {
    const livePollRef = ref(database, 'livePoll');
    const unsubscribe = onValue(livePollRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLivePoll(data);
      } else {
        setLivePoll({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'var(--bg-dark)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px'
    }}>
      {livePoll.isActive ? (
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
      ) : (
        <div className="glass-panel animate-fade-in" style={{ padding: '60px', borderRadius: '30px', textAlign: 'center', width: '100%', maxWidth: '800px', border: '2px solid var(--accent-gold)' }}>
          <h1 style={{ color: 'var(--primary-green)', fontSize: '4rem', marginBottom: '10px', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>نعمل جبانيوت؟</h1>
          <h2 style={{ color: 'var(--accent-gold)', fontSize: '2rem', marginBottom: '40px' }}>اجتماع يوسف الصديق للشباب</h2>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', display: 'inline-block', marginBottom: '30px' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.origin)}`} 
              alt="QR Code" 
              style={{ width: '400px', height: '400px' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: 'var(--text-light)' }}>
            <QrCode size={40} />
            <p style={{ fontSize: '2rem' }}>امسح الكود للدخول والمشاركة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projector;
