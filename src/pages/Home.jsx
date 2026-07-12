import React, { useState, useEffect } from 'react';
import { courseData } from '../data/courseData';
import { Calendar, Clock, BookOpen, MessageCircle, Lock, BarChart2, QrCode, Star, Download } from 'lucide-react';
import { database } from '../firebase';
import { ref, push, set, onValue, runTransaction } from "firebase/database";

const Home = () => {
  const [now, setNow] = useState(new Date().getTime());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [currentNoteSession, setCurrentNoteSession] = useState({ dayId: null, sessionTitle: '' });
  const [noteText, setNoteText] = useState('');
  const [myQuestions, setMyQuestions] = useState([]);
  const [livePoll, setLivePoll] = useState({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    // Load my questions
    const saved = JSON.parse(localStorage.getItem('myQuestions') || '[]');
    setMyQuestions(saved);

    // Listen to Live Poll
    const livePollRef = ref(database, 'livePoll');
    const unsubscribe = onValue(livePollRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLivePoll(data);
        // Check if voted for this specific question
        const voted = localStorage.getItem(`voted_${data.questionText}`);
        setHasVoted(!!voted);
      } else {
        setLivePoll({ isActive: false, questionText: '', trueCount: 0, falseCount: 0 });
      }
    });

    // Update time every minute
    const interval = setInterval(() => setNow(new Date().getTime()), 60000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const isVisible = (fullDateString) => {
    const sessionTime = new Date(fullDateString).getTime();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    return now >= (sessionTime - twelveHoursMs);
  };

  const handleSendQuestion = () => {
    if (!questionText.trim()) return;
    
    const newQuestion = {
      text: questionText,
      timestamp: Date.now(),
      answered: false
    };

    const questionsRef = ref(database, 'questions');
    const newQuestionRef = push(questionsRef);
    set(newQuestionRef, newQuestion)
      .then(() => {
        const updatedMyQuestions = [newQuestion, ...myQuestions];
        setMyQuestions(updatedMyQuestions);
        localStorage.setItem('myQuestions', JSON.stringify(updatedMyQuestions));
        
        setQuestionText('');
        setIsModalOpen(false);
        alert('تم إرسال سؤالك بنجاح! شكراً لمشاركتك.');
      })
      .catch((error) => {
        console.error("Error saving question: ", error);
        alert('حدث خطأ أثناء إرسال السؤال. يرجى المحاولة مرة أخرى.');
      });
  };

  const openNotes = (dayId, sessionTitle) => {
    setCurrentNoteSession({ dayId, sessionTitle });
    const savedNote = localStorage.getItem(`note_${dayId}_${sessionTitle}`) || '';
    setNoteText(savedNote);
    setIsNotesOpen(true);
  };

  const saveNotes = () => {
    localStorage.setItem(`note_${currentNoteSession.dayId}_${currentNoteSession.sessionTitle}`, noteText);
    setIsNotesOpen(false);
    alert('تم حفظ ملاحظاتك بنجاح على جهازك!');
  };

  const downloadNotes = () => {
    if (!noteText.trim()) {
      alert('لا توجد ملاحظات لتحميلها.');
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([noteText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `ملاحظات_${currentNoteSession.sessionTitle.replace(/ /g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendFeedback = () => {
    if (feedbackRating === 0) {
      alert('يرجى اختيار التقييم بالنجوم أولاً');
      return;
    }
    const feedbackRef = ref(database, 'feedback');
    const newFeedbackRef = push(feedbackRef);
    set(newFeedbackRef, {
      rating: feedbackRating,
      text: feedbackText,
      timestamp: Date.now()
    }).then(() => {
      setFeedbackRating(0);
      setFeedbackText('');
      setIsFeedbackModalOpen(false);
      alert('شكراً لتقييمك! رأيك يهمنا جداً.');
    }).catch(err => {
      console.error(err);
      alert('حدث خطأ أثناء الإرسال، حاول مرة أخرى.');
    });
  };

  const handleVote = (voteType) => {
    if (hasVoted) return;

    const livePollRef = ref(database, 'livePoll');
    runTransaction(livePollRef, (poll) => {
      if (poll) {
        if (voteType === 'true') {
          poll.trueCount = (poll.trueCount || 0) + 1;
        } else {
          poll.falseCount = (poll.falseCount || 0) + 1;
        }
      }
      return poll;
    }).then(() => {
      localStorage.setItem(`voted_${livePoll.questionText}`, 'true');
      setHasVoted(true);
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Live Poll UI (Visible when poll is active) */}
      {livePoll.isActive && (
        <div style={{ backgroundColor: 'rgba(0,255,136,0.1)', border: '2px solid var(--primary-green)', padding: '25px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 0 30px rgba(0,255,136,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'red', boxShadow: '0 0 10px red', animation: 'pulse 1s infinite' }} />
            <h3 style={{ color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 /> تصويت لحظي</h3>
          </div>
          <p style={{ color: 'var(--primary-green)', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '25px' }}>{livePoll.questionText}</p>
          
          {hasVoted ? (
            <div>
              <p style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', marginBottom: '15px' }}>شكراً لتصويتك! ✅</p>
              <div className="flex-col-mobile" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <div style={{ color: 'white' }}>صح: <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>{livePoll.trueCount}</span></div>
                <div style={{ color: 'white' }}>خطأ: <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '1.2rem' }}>{livePoll.falseCount}</span></div>
              </div>
            </div>
          ) : (
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button onClick={() => handleVote('true')} className="btn-primary" style={{ padding: '15px 30px', fontSize: '1.4rem', flex: 1, maxWidth: '200px' }}>صح ✅</button>
              <button onClick={() => handleVote('false')} className="btn-primary" style={{ padding: '15px 30px', fontSize: '1.4rem', flex: 1, maxWidth: '200px', background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)', boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)' }}>خطأ ❌</button>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="title-mobile" style={{ fontSize: '2.5rem', color: 'var(--primary-green)', marginBottom: '10px', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>جدول الكورس</h2>
        <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '15px' }}>تفضل بمتابعة أيام الكورس ومواعيد الفقرات</p>
        <button onClick={() => setShowQr(true)} className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem' }}>
          <QrCode size={16} /> شارك الكورس مع صديق
        </button>
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
                    <div style={{ fontWeight: session.type === 'session' ? 'bold' : 'normal', flex: 1, color: session.type === 'break' ? 'var(--accent-gold)' : 'var(--text-light)' }}>
                      {session.title}
                    </div>
                    {session.type === 'session' && (
                      <button 
                        onClick={() => openNotes(day.id, session.title)}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
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

      {/* Floating Buttons */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 100 }}>
        <button 
          onClick={() => setIsFeedbackModalOpen(true)}
          className="hide-text-mobile"
          style={{
            backgroundColor: 'var(--accent-gold)',
            color: 'var(--dark-green)',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 5px 15px rgba(255, 207, 51, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Star size={20} fill="var(--dark-green)" />
          <span>تقييم اليوم</span>
        </button>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="hide-text-mobile"
          style={{
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
          }}
        >
          <MessageCircle size={20} />
          <span>إسأل براحتك</span>
        </button>
      </div>

      {/* Question Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel modal-panel" style={{
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

            {myQuestions.length > 0 && (
              <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <h4 style={{ color: 'var(--primary-green)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageCircle size={18} /> أسئلتي السابقة
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {myQuestions.map((q, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p style={{ color: 'var(--text-light)', marginBottom: '5px' }}>{q.text}</p>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(q.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {isNotesOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel modal-panel" style={{
            padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '500px',
            border: '1px solid var(--accent-gold)',
            boxShadow: '0 0 30px rgba(255, 207, 51, 0.2)'
          }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '5px', fontSize: '1.3rem' }}>كراسة الملاحظات</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '15px', fontSize: '0.9rem' }}>{currentNoteSession.sessionTitle}</p>
            <textarea 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظاتك وتأملاتك هنا... سيتم حفظها على جهازك الخاص ولن يطلع عليها أحد."
              style={{
                width: '100%', height: '200px', padding: '15px', borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px', fontSize: '1.1rem', resize: 'none',
                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', lineHeight: '1.6'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-gold" style={{ flex: 1 }} onClick={saveNotes}>حفظ الملاحظات</button>
                <button className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--primary-green)', color: 'var(--primary-green)' }} onClick={() => setIsNotesOpen(false)}>إغلاق</button>
              </div>
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--glass-bg)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }} onClick={downloadNotes}>
                <Download size={18} /> تحميل الملاحظات في ملف نصي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for Youth */}
      {showQr && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel modal-panel animate-fade-in" style={{
            padding: '30px', borderRadius: '20px', textAlign: 'center', width: '100%', maxWidth: '400px',
            border: '1px solid var(--accent-gold)', boxShadow: '0 0 30px rgba(255, 207, 51, 0.2)'
          }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '15px', fontSize: '1.4rem' }}>أظهر الكود لصديقك</h3>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin)}`} 
                alt="QR Code" 
                style={{ width: '200px', height: '200px' }} 
              />
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '20px', fontSize: '0.9rem' }}>دع صديقك يفتح كاميرا هاتفه ويمسح هذا الكود ليدخل الاجتماع فوراً!</p>
            <button onClick={() => setShowQr(false)} className="btn-primary" style={{ width: '100%' }}>إغلاق</button>
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel modal-panel animate-fade-in" style={{
            padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px',
            border: '1px solid var(--accent-gold)',
            boxShadow: '0 0 30px rgba(255, 207, 51, 0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '15px', fontSize: '1.5rem' }}>تقييم اليوم</h3>
            <p style={{ color: 'white', marginBottom: '20px', fontSize: '1rem' }}>رأيك يساعدنا نطور الكورس ونفهم احتياجاتك أكثر</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setFeedbackRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star size={35} fill={star <= feedbackRating ? "var(--accent-gold)" : "transparent"} color={star <= feedbackRating ? "var(--accent-gold)" : "#666"} />
                </button>
              ))}
            </div>

            <textarea 
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="اكتب تعليقك أو أي حاجة حابب تشاركنا بيها (اختياري)..."
              style={{
                width: '100%', height: '120px', padding: '15px', borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px', fontSize: '1.1rem', resize: 'none',
                backgroundColor: 'rgba(0,0,0,0.5)', color: 'white'
              }}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-gold" style={{ flex: 1 }} onClick={handleSendFeedback}>إرسال التقييم</button>
              <button className="btn-primary" style={{ flex: 1, background: 'transparent', border: '1px solid var(--primary-green)', color: 'var(--primary-green)' }} onClick={() => setIsFeedbackModalOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
