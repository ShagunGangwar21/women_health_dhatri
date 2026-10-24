import React, { useState, useEffect, useRef } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import UrgentCareBanner from '../components/UrgentCareBanner';
import Icon from '../components/Icon';

const SUGGESTED_PROMPTS_EN = [
  {
    title: 'Explain My Ferritin Drop',
    prompt: 'My ferritin dropped from 38 to 11 over 18 months while my hemoglobin stayed normal. What does this mean physiologically?',
    icon: 'activity'
  },
  {
    title: 'Luteal Phase Migraines',
    prompt: 'Why do I experience headaches and sensory sensitivity 3 days before my period starts, and how does progesterone relate to this?',
    icon: 'zap'
  },
  {
    title: 'Doctor Visit Questions',
    prompt: 'Help me draft 3 precise, evidence-based questions for my upcoming gynecologist appointment regarding heavy flow and fatigue.',
    icon: 'help-circle'
  },
  {
    title: 'Explain In Hindi (हिंदी में समझाइए)',
    prompt: 'पीरियड्स से पहले बहुत थकान और सिरदर्द क्यों होता है? मुझे क्या सावधानियां बरतनी चाहिए?',
    icon: 'message-circle'
  }
];

const SUGGESTED_PROMPTS_HI = [
  {
    title: 'फेरिटिन की कमी समझाइए',
    prompt: '18 महीनों में मेरा फेरिटिन 38 से गिरकर 11 हो गया, जबकि हीमोग्लोबिन सामान्य है। इसका स्वास्थ्य पर क्या असर होता है?',
    icon: 'activity'
  },
  {
    title: 'पीरियड्स से पहले सिरदर्द',
    prompt: 'पीरियड शुरू होने से 3 दिन पहले सिरदर्द और चिड़चिड़ापन क्यों होता है? प्रोजेस्टेरोन हार्मोन का इससे क्या संबंध है?',
    icon: 'zap'
  },
  {
    title: 'डॉक्टर से पूछने हेतु सवाल',
    prompt: 'मेरे आगामी गायनेकोलॉजिस्ट अपॉइंटमेंट के लिए 3 महत्वपूर्ण और स्पष्ट सवाल तैयार करें।',
    icon: 'help-circle'
  },
  {
    title: 'लक्षणों का चक्र से संबंध',
    prompt: 'थकान और ब्लोटिंग को कम करने के लिए ल्यूटियल फ़ेज़ में क्या खान-पान रखना चाहिए?',
    icon: 'message-circle'
  }
];

export default function AIAssistant() {
  const { currentCyclePhase, symptoms = [], reports = [], reportData } = useHealthData();
  const { language, t, isHindi } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState(language === 'hi' ? 'Hindi' : 'English');

  // Synchronize AI language mode with app language setting
  useEffect(() => {
    setSelectedLanguage(language === 'hi' ? 'Hindi' : 'English');
  }, [language]);

  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: isHindi
        ? `नमस्ते, मैं धात्री हूँ—आपकी पर्सनलाइज्ड वेलनेस सहेली और स्वास्थ्य सलाहकार।\n\nमैं आपके मासिक धर्म चक्र के अनुसार लक्षणों को समझने, फेरिटिन और TSH जैसी लैब रिपोर्ट्स को सरल भाषा में समझाने और डॉक्टर से मिलने की तैयारी में आपकी मदद कर सकती हूँ।\n\nआज मैं आपकी क्या सहायता करूँ? आप हिंदी या English में कुछ भी पूछ सकती हैं।`
        : `Hello, I'm Dhatri—your personalized Wellness Bestie and clinical health intelligence companion.\n\nI can help contextualize your symptoms across your cycle, explain laboratory report markers like Ferritin and TSH in clear language, and prepare targeted questions for your doctor.\n\nHow can I support your wellbeing today? You can ask me in English or Hindi / Hinglish.`,
      modelUsed: 'Clinical Safety Intelligence',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [aiConfigNotice, setAiConfigNotice] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load persistent conversation history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('dhatri_token');
      if (!token) return;
      try {
        const res = await fetch('/api/ai/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.conversations && data.conversations.length > 0) {
            const latest = data.conversations[0];
            if (latest.messages && latest.messages.length > 0) {
              const formatted = latest.messages.map((m, idx) => ({
                id: `hist_${idx}`,
                sender: m.sender === 'user' ? 'user' : 'ai',
                text: m.text,
                modelUsed: m.sender === 'user' ? undefined : (m.isClinicalObservation ? 'Clinical Reasoning' : 'Dhatri AI'),
                timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              }));
              setMessages(formatted);
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch chat history:', e);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorMessage('');
    setLastFailedMessage(null);

    // Context payload with defensive array checks
    const userSymptoms = Array.isArray(symptoms) ? symptoms : [];
    const userReports = Array.isArray(reports) && reports.length > 0 ? reports : reportData?.reports || [];
    const authorizedContext = includeContext
      ? {
          currentCyclePhase: currentCyclePhase || 'follicular',
          recentSymptoms: userSymptoms.slice(0, 5).map(s => `${s.name || s.category} (severity: ${s.severity}/5)`),
          recentReports: userReports.slice(0, 3).map(r => `${r.title} (${r.date || r.reportDate || 'Recent'})`),
          biomarkers: userReports.flatMap(r => r.biomarkers || []).slice(0, 4)
        }
      : null;

    try {
      const token = localStorage.getItem('dhatri_token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg.text,
          language: selectedLanguage,
          context: authorizedContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.configNotice) {
        setAiConfigNotice(data.configNotice);
      }

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || (isHindi
          ? "मैं आपकी जानकारी का विश्लेषण कर रही हूँ। कृपया व्यक्तिगत सलाह के लिए योग्य चिकित्सक से संपर्क करें।"
          : "I am currently synthesizing your question. Please consult a qualified medical professional for personal clinical guidance."),
        modelUsed: data.provider || data.modelUsed || 'Clinical Intelligence Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      setLastFailedMessage(userMsg.text);
      setErrorMessage(isHindi ? 'धात्री AI सेवा से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Unable to connect to Dhatri AI service. Click retry to send again.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          sender: 'ai',
          text: isHindi
            ? `⚠️ कनेक्शन में अस्थायी समस्या आई है। कृपया नेटवर्क जांचें या पुनः प्रयास (Retry) करें। यदि आप गंभीर दर्द या अत्यधिक रक्तस्राव महसूस कर रही हैं, तो तुरंत डॉक्टर से संपर्क करें।`
            : `⚠️ I encountered a temporary connection issue. Please verify your connection or click Retry. In the meantime: if you are experiencing severe acute pain or unusually heavy bleeding, please seek urgent medical care immediately.`,
          modelUsed: 'Offline Safety Notice',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: isHindi
          ? `बातचीत का इतिहास साफ़ कर दिया गया है। मैं आपके अगले स्वास्थ्य प्रश्न के लिए तैयार हूँ।`
          : `Conversation history cleared. I'm ready for your next health question or symptom discussion.`,
        modelUsed: 'Clinical Safety Intelligence',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const activePrompts = isHindi ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN;

  return (
    <div className="ai-assistant-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '1rem' }}>
      <UrgentCareBanner />

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌸</span>
            <h1 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--color-burgundy)' }}>
              {isHindi ? 'धात्री AI वेलनेस सहेली' : 'Dhatri AI Wellness Companion'}
            </h1>
            <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
              {isHindi ? 'द्विभाषी (हिंदी / EN)' : 'Bilingual (EN / HI)'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {isHindi ? 'स्वास्थ्य इतिहास विश्लेषण एवं प्रामाणिक चिकित्सीय जानकारी।' : 'Personalized health history synthesis & evidence-based medical education.'}
          </div>
        </div>

        {/* Language & Context Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
          >
            <option value="English">Language: English</option>
            <option value="Hindi">भाषा: हिंदी (Hindi)</option>
            <option value="Hinglish">भाषा: Hinglish</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              style={{ accentColor: 'var(--color-rose)' }}
            />
            {isHindi ? 'हेल्थ कॉन्टेक्स्ट साझा करें' : 'Authorize My Health Context'}
          </label>

          <button
            onClick={handleClearHistory}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            title={isHindi ? 'चैट रीसेट करें' : 'Reset Chat'}
          >
            <Icon name="refresh" size={14} /> {isHindi ? 'रीसेट' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Live AI Configuration Transparency Notice */}
      {aiConfigNotice && (
        <div style={{ padding: '0.6rem 1rem', background: 'rgba(217, 111, 137, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-soft-pink)', fontSize: '0.8rem', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>ℹ️ {aiConfigNotice}</span>
          <button onClick={() => setAiConfigNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'var(--color-surface)'
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '0.25rem'
              }}
            >
              <div
                style={{
                  maxWidth: '78%',
                  padding: '0.9rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'var(--control-active-bg)' : 'var(--bg-secondary)',
                  color: isUser ? 'var(--control-active-text)' : 'var(--text-primary)',
                  border: isUser ? '1px solid var(--control-active-border)' : '1px solid var(--border-card)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                  fontSize: '0.92rem'
                }}
              >
                {m.text}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                <span>{m.timestamp}</span>
                {m.modelUsed && <span>• {m.modelUsed}</span>}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
            {isHindi ? 'क्लिनिकल डेटा का विश्लेषण किया जा रहा है...' : 'Synthesizing clinical signals with medical guardrails...'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {activePrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isLoading}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Icon name={item.icon} size={14} color="var(--color-rose)" />
            {item.title}
          </button>
        ))}
      </div>

      {/* Error & Retry Banner */}
      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'rgba(217, 111, 137, 0.15)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-rose)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <span>{errorMessage}</span>
          {lastFailedMessage && (
            <button
              onClick={() => handleSendMessage(lastFailedMessage)}
              className="btn btn-primary"
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}
            >
              {isHindi ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={isHindi ? "धात्री से अपने लक्षणों, रिपोर्ट्स या डॉक्टर के सवालों के बारे में पूछें..." : "Ask Dhatri about your symptoms, lab reports, or doctor questions..."}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            background: 'var(--color-surface)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="btn btn-primary"
          style={{ padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>{isHindi ? 'भेजें' : 'Send'}</span>
          <Icon name="send" size={16} />
        </button>
      </div>

      {/* Safety Micro-Footer */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ⚖️ <strong>{isHindi ? 'चिकित्सीय सुरक्षा नियम:' : 'Medical Safety Protocol:'}</strong> {isHindi ? 'धात्री बीमारी का इलाज या निदान नहीं देती। यह जानकारी आपके डॉक्टर से परामर्श को आसान बनाने के लिए है।' : 'Dhatri does not provide diagnoses or prescribe medications. Contextual observations are formulated for collaborative discussion with your healthcare professional.'}
      </div>
    </div>
  );
}
