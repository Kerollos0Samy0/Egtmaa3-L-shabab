import React, { useState, useEffect } from 'react';
import { Lock, Unlock, MessageCircle, CheckCircle, Star, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../firebase';
import { ref, onValue, update, remove, set, push } from "firebase/database";
import { BarChart2, Plus, Trash2, StopCircle, QrCode, Home as HomeIcon } from 'lucide-react';

const pollBankData = [
  {
    day: "اليوم الأول: آبا أنا عايز أتجوز",
    sessions: [
      {
        title: "دوافع الارتباط",
        questions: [
          "الارتباط عشان أهرب من ضغوط البيت أو الوحدة هو دافع صحي جداً للزواج.",
          "مجرد إن سني كبر وكل أصحابي اتجوزوا ده سبب كافي يخليني أقرر أرتبط.",
          "الزواج المسيحي الناجح بيبدأ من رغبتي إني أسعد الطرف التاني مش بس إني أدور على سعادتي."
        ]
      },
      {
        title: "أعرف نفسي",
        questions: [
          "لو أنا مش مرتاح مع نفسي ومش فاهم عيوبي ونقاط ضعفي، مستحيل أرتاح مع شخص تاني.",
          "الإنسان بيتغير تلقائياً بعد الجواز، فمش مهم أصلح عيوبي دلوقتي."
        ]
      }
    ]
  },
  {
    day: "اليوم الثاني: مش عايز تتعرف عليا خالص؟",
    sessions: [
      {
        title: "لغات الحب الخمسة",
        questions: [
          "كل الناس بتحس بالحب بنفس الطريقة، المهم إني أكون بحبهم بصدق من قلبي.",
          "لو خطيبي/خطيبتي لغة حبهم الهدايا، ده معناه إنهم شخصيات مادية وبيحبوا الفلوس.",
          "من الذكاء العاطفي إني أتعلم أعبر عن حبي بالطريقة اللي الطرف التاني بيفهمها."
        ]
      },
      {
        title: "Green/Red Flags",
        questions: [
          "العصبية المفرطة والتطاول في فترة الخطوبة ممكن تعدي بعد الجواز لما نرتاح ونستقر.",
          "الشخص اللي بيعترف بغلطه ويعتذر بدون مكابرة دي علامة خضراء مهمة جداً.",
          "الغيرة الزيادة والتحكم في كل تفاصيل حياتي هي دليل قوي جداً على الحب الخالص."
        ]
      }
    ]
  },
  {
    day: "اليوم الثالث: أنا بزعل ع الشباب",
    sessions: [
      {
        title: "ضوابط الارتباط",
        questions: [
          "فترة الخطوبة معمولة في الأساس عشان نجهز الشقة والفرح ونعزم الناس.",
          "الصراحة والوضوح في فترة الخطوبة أهم بكتير من إني أمثل إني شخص مثالي وبلا عيوب."
        ]
      },
      {
        title: "الحدود",
        questions: [
          "بما إننا مخطوبين وبنحب بعض، يبقى مفيش أي داعي لوجود مسافات أو حدود شخصية بينا.",
          "الحدود الواضحة بتحمي العلاقة وبتخلي فيها احترام متبادل، مش بتبعد المسافات."
        ]
      }
    ]
  },
  {
    day: "اليوم الرابع: ليه إديتني كل حاجة و فجأة خدت مني كل حاجة",
    sessions: [
      {
        title: "كيف أميز صوت الله؟",
        questions: [
          "صوت ربنا دايماً بييجي عكس رغباتي وأحلامي الشخصية عشان يعلمني التخلي.",
          "السلام الداخلي بعد الصلاة والتفكير هو من أهم وأقوى علامات صوت ربنا في حياتنا."
        ]
      },
      {
        title: "متى يكون الانفصال حكمة؟",
        questions: [
          "الانفصال في فترة الخطوبة هو فشل كبير ونقطة سودة في حياة الشاب أو البنت.",
          "لو اكتشفنا إننا مش متوافقين في الأساسيات وتفكيرنا مختلف تماماً، الانفصال بيكون أكرم وأصح قرار."
        ]
      }
    ]
  }
];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [customPolls, setCustomPolls] = useState([]);
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
      
      const historyRef = ref(database, 'pollHistory');
      const unsubscribeHistory = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const historyArray = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => b.timestamp - a.timestamp);
          setPollHistory(historyArray);
        } else {
          setPollHistory([]);
        }
      });

      const feedbackRef = ref(database, 'feedback');
      const unsubscribeFeedback = onValue(feedbackRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const feedbackArray = Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => b.timestamp - a.timestamp);
          setFeedbacks(feedbackArray);
        } else {
          setFeedbacks([]);
        }
      });

      return () => {
        unsubscribeQuestions();
        unsubscribePoll();
        unsubscribeHistory();
        unsubscribeFeedback();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === 'YoUssef-2026') { // Simple hardcoded PIN
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
    if (livePoll.questionText) {
      const historyRef = ref(database, 'pollHistory');
      push(historyRef, {
        questionText: livePoll.questionText,
        trueCount: livePoll.trueCount || 0,
        falseCount: livePoll.falseCount || 0,
        timestamp: Date.now()
      });
    }

    const livePollRef = ref(database, 'livePoll');
    update(livePollRef, { isActive: false });
  };

  const addToPollBank = () => {
    if (newPollQuestion.trim() !== '') {
      setCustomPolls([newPollQuestion, ...customPolls]);
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
      <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-green)', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>لوحة تحكم الخدام</h2>
        <div className="flex-col-mobile" style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', background: 'transparent', border: '1px solid var(--primary-green)', color: 'var(--primary-green)' }}>
            <HomeIcon size={16} /> Home
          </button>
          <button onClick={() => window.open('/projector', '_blank')} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px' }}>
            <QrCode size={16} /> شاشة العرض
          </button>
          <button onClick={() => setIsAuthenticated(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Unlock size={16} /> تسجيل خروج
          </button>
        </div>
      </div>

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
            
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
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
            <div className="flex-col-mobile" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="أضف سؤال تصويت جديد لبنك الأسئلة..."
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
              />
              <button onClick={addToPollBank} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Plus size={20} /> إضافة</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
              {pollBankData.map((dayObj, dayIdx) => (
                <div key={dayIdx} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: 'var(--accent-gold)', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,207,51,0.3)', paddingBottom: '10px' }}>{dayObj.day}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {dayObj.sessions.map((session, sessionIdx) => (
                      <div key={sessionIdx}>
                        <h5 style={{ color: 'var(--primary-green)', marginBottom: '10px', fontSize: '1.1rem' }}>{session.title}</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '15px', borderRight: '2px solid rgba(0,255,136,0.3)' }}>
                          {session.questions.map((q, qIdx) => (
                            <div key={qIdx} className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                              <p style={{ color: 'white', fontSize: '1rem', flex: 1, marginLeft: '10px' }}>{q}</p>
                              <button onClick={() => activatePoll(q)} className="btn-primary" style={{ padding: '6px 15px', fontSize: '0.9rem' }}>تفعيل</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {customPolls.length > 0 && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ color: 'var(--accent-gold)', marginBottom: '15px', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,207,51,0.3)', paddingBottom: '10px' }}>أسئلة مضافة يدوياً</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customPolls.map((q, i) => (
                      <div key={i} className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <p style={{ color: 'white', fontSize: '1rem', flex: 1, marginLeft: '10px' }}>{q}</p>
                        <button onClick={() => activatePoll(q)} className="btn-primary" style={{ padding: '6px 15px', fontSize: '0.9rem' }}>تفعيل</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Poll History Section */}
      {pollHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '25px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #444' }}>
          <h3 style={{ color: 'var(--text-light)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History /> أرشيف التصويتات
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
            {pollHistory.map((poll) => (
              <div key={poll.id} className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '5px' }}>{poll.questionText}</p>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(poll.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>صح: {poll.trueCount}</div>
                  <div style={{ color: '#ff4444', fontWeight: 'bold' }}>خطأ: {poll.falseCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedbacks Section */}
      <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '15px' }}>تقييمات الشباب (Feedback)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {feedbacks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>لا توجد تقييمات حالياً.</p>
        ) : (
          <AnimatePresence>
            {feedbacks.map((f, i) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel" 
                style={{ 
                  padding: '20px', borderRadius: '15px', display: 'flex', 
                  flexDirection: 'column', gap: '10px',
                  borderRight: '4px solid var(--accent-gold)'
                }}
              >
                <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={20} fill={star <= f.rating ? "var(--accent-gold)" : "transparent"} color={star <= f.rating ? "var(--accent-gold)" : "#666"} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(f.timestamp).toLocaleString('ar-EG')}
                  </span>
                </div>
                {f.text && <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{f.text}</p>}
              </motion.div>
            ))}
          </AnimatePresence>
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
