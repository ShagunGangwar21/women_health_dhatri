import React, { useState, useEffect, useRef } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import UrgentCareBanner from '../components/UrgentCareBanner';
import FormattedMessage from '../components/FormattedMessage';
import Icon from '../components/Icon';

const SUGGESTED_PROMPTS_EN = [
  {
    title: 'Relief for Period Cramps',
    prompt: 'I am experiencing severe cramps during my period. What evidence-based self-care options, warm compress techniques, and gentle yoga poses can help relieve pelvic pain?',
    icon: 'activity'
  },
  {
    title: 'Headache & Migraine Guidance',
    prompt: 'I have a throbbing headache and light sensitivity. Could this be related to my menstrual cycle phases and what precautions should I take?',
    icon: 'zap'
  },
  {
    title: 'Iron-Rich Indian Diet',
    prompt: 'Can you suggest practical, affordable Indian meals (breakfast, lunch, dinner, snacks with palak, dal, ragi, chana) rich in iron, folate, and protein for sustained energy?',
    icon: 'heart'
  },
  {
    title: 'Explain Ferritin Drop',
    prompt: 'My ferritin dropped from 38 to 11 over 18 months while hemoglobin stayed normal. What does this mean physiologically?',
    icon: 'activity'
  },
  {
    title: 'Gentle Yoga for Period Days',
    prompt: 'What are safe, low-impact yoga stretches and breathing exercises during menstrual flow days, and which movements should I avoid?',
    icon: 'smile'
  },
  {
    title: 'Doctor Visit Questions',
    prompt: 'Help me draft 3 precise, evidence-based questions for my upcoming gynecologist appointment regarding irregular cycles and fatigue.',
    icon: 'help-circle'
  }
];

const SUGGESTED_PROMPTS_HI = [
  {
    title: 'पीरियड्स के दर्द (क्रैम्प्स) में राहत',
    prompt: 'मुझे पीरियड्स के समय बहुत क्रैम्प्स (पेट के निचले हिस्से में दर्द) हो रहे हैं। तुरंत राहत के लिए क्या घरेलू उपाय और योगासन करने चाहिए?',
    icon: 'activity'
  },
  {
    title: 'सिरदर्द और माइग्रेन की समझ',
    prompt: 'मेरे सिर में दर्द हो रहा है। क्या यह हार्मोनल बदलाव से जुड़ा हो सकता है? मुझे क्या सावधानियां बरतनी चाहिए?',
    icon: 'zap'
  },
  {
    title: 'आयरन युक्त भारतीय भोजन',
    prompt: 'कमजोरी और थकान दूर करने के लिए किफायती भारतीय आहार (पालक, दाल, रागी, गुड़-चना) का नाश्ता, लंच और डिनर प्लान बताइए।',
    icon: 'heart'
  },
  {
    title: 'फेरिटिन की कमी समझाइए',
    prompt: '18 महीनों में मेरा फेरिटिन 38 से गिरकर 11 हो गया, जबकि हीमोग्लोबिन सामान्य है। इसका स्वास्थ्य पर क्या असर होता है?',
    icon: 'activity'
  },
  {
    title: 'पीरियड्स में सुरक्षित योगासन',
    prompt: 'पीरियड्स के दौरान दर्द और बेचैनी कम करने के लिए कौन से आसान योगासन (जैसे बालासन, सुप्त बद्ध कोणासन) करने चाहिए?',
    icon: 'smile'
  },
  {
    title: 'डॉक्टर से पूछने हेतु सवाल',
    prompt: 'मेरे आगामी गायनेकोलॉजिस्ट अपॉइंटमेंट के लिए 3 महत्वपूर्ण और स्पष्ट सवाल तैयार करें।',
    icon: 'help-circle'
  }
];

const SUGGESTED_PROMPTS_HINGLISH = [
  {
    title: 'Period Cramps se Relief',
    prompt: 'Mujhe periods ke time bohot severe cramps ho rahe hain. Immediate relief ke liye safe home remedies aur gentle yoga poses batayein?',
    icon: 'activity'
  },
  {
    title: 'Sir Dard & Migraine Care',
    prompt: 'Mere sir mein bohot dard ho raha hai aur light se sensitivity hai. Kya yeh cycle hormones ki wajah se ho sakta hai? Kya precautions loon?',
    icon: 'zap'
  },
  {
    title: 'Iron-Rich Indian Diet',
    prompt: 'Weakness aur fatigue door karne ke liye simple Indian meal plan (palak, dal, ragi, chana) batayein rich in iron and protein.',
    icon: 'heart'
  },
  {
    title: 'Ferritin Level Drop Samjhein',
    prompt: 'Mera ferritin 38 se drop hokar 11 ho gaya hai par hemoglobin normal hai. Iska health aur energy par kya effect hota hai?',
    icon: 'activity'
  },
  {
    title: 'Periods mein Safe Yoga',
    prompt: 'Periods flow ke dino mein pelvic pain kam karne ke liye kaun se gentle yoga poses (jaise Balasana) safe hain aur kya avoid karein?',
    icon: 'smile'
  },
  {
    title: 'Gynecologist ke Sawaal',
    prompt: 'Meri upcoming gynecologist appointment ke liye irregular cycle aur fatigue ke 3 clear aur precise sawaal draft kar dein.',
    icon: 'help-circle'
  }
];

export default function AIAssistant() {
  const { currentCyclePhase, symptoms = [], reports = [], reportData } = useHealthData();
  const { language, setLanguage, t, isHindi, isHinglish } = useLanguage();

  const [threadId, setThreadId] = useState(null);

  const getWelcomeMessage = (lang) => {
    if (lang === 'hi') {
      return {
        id: 'welcome_hi',
        sender: 'ai',
        text: `### नमस्ते! मैं धात्री हूँ — आपकी पर्सनल वेलनेस सहेली 🌸\n\nमैं आपके मासिक धर्म चक्र, लक्षणों (जैसे **क्रैम्प्स, सिरदर्द, थकान**), पोषण व भारतीय आहार (जैसे **पालक, दाल, रागी, चना**), और डॉक्टर से बातचीत की तैयारी में मदद कर सकती हूँ।\n\n* **लक्षणों की समझ:** क्रैम्प्स, सिरदर्द या थकान के शारीरिक कारण व घरेलू राहत।\n* **संतुलित पोषण:** आयरन, प्रोटीन और कैल्शियम से भरपूर भारतीय भोजन योजना।\n* **सुरक्षित व्यायाम:** पीरियड्स के अनुकूल आसान योगासन व स्ट्रेचिंग।\n\nआज मैं आपकी क्या सहायता करूँ? आप **हिंदी, English या Hinglish** ("Mere sir me dard ho raha hai") में बेझिझक पूछ सकती हैं!`,
        modelUsed: 'Google Gemini Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    if (lang === 'hinglish') {
      return {
        id: 'welcome_hinglish',
        sender: 'ai',
        text: `### Namaste! Main Dhatri hoon — Aapki Personal Wellness Saheli 🌸\n\nMain aapke menstrual cycle, symptoms (jaise **cramps, headache, fatigue**), Indian diet aur nutrition (jaise **palak, dal, ragi, chana**), aur doctor se consult karne ki preparation mein help kar sakti hoon.\n\n* **Symptoms Ki Samajh:** Cramps, headache ya fatigue ke causes aur gentle home care tips.\n* **Indian Nutrition:** Iron, protein aur calcium se bharpoor affordable meal ideas.\n* **Safe Yoga & Exercise:** Cycle-friendly aasan yoga poses aur gentle stretches.\n\nAaj main aapki kya help karoon? Aap mujhse **Hinglish, Hindi ya English** mein naturally pooch sakti hain!`,
        modelUsed: 'Google Gemini Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return {
      id: 'welcome_en',
      sender: 'ai',
      text: `### Hello! I am Dhatri — Your Personalized Wellness Companion 🌸\n\nI can help contextualize your symptoms across your cycle (such as **cramps, headaches, fatigue**), suggest wholesome Indian meal ideas (like **dal, palak, ragi, sprouts, chana**), safe yoga/exercise guidance, and prepare targeted questions for your doctor.\n\n* **Symptom Guidance:** Understanding physiological causes and gentle self-care.\n* **Indian Nutrition:** Affordable iron-, calcium-, and folate-rich meal ideas.\n* **Exercise Adaptation:** Cycle-aware movement, yoga (Balasana, Supta Baddha Konasana).\n\nHow can I support your wellbeing today? You can ask me naturally in **English, Hindi, or Hinglish**!`,
      modelUsed: 'Google Gemini Flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const [messages, setMessages] = useState([getWelcomeMessage(language)]);
  const [inputText, setInputText] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [aiConfigNotice, setAiConfigNotice] = useState(null);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState([]);

  // Voice Input (Web Speech API) States
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechErrorNotice, setSpeechErrorNotice] = useState(null);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When language changes:
  // If the conversation is currently only the initial welcome message, update it to the selected language.
  // If an active conversation has multiple messages, preserve the user history.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome_')) {
        return [getWelcomeMessage(language)];
      }
      return prev;
    });
  }, [language]);

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
            if (latest._id) {
              setThreadId(latest._id);
            }
            if (latest.messages && latest.messages.length > 0) {
              const formatted = latest.messages.map((m, idx) => ({
                id: `hist_${idx}`,
                sender: m.sender === 'user' ? 'user' : 'ai',
                text: m.text,
                modelUsed: m.sender === 'user' ? undefined : (m.isClinicalObservation ? 'Clinical Reasoning' : 'Google Gemini Flash'),
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

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Web Speech API Handlers
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startVoiceInput = () => {
    setSpeechErrorNotice(null);
    if (!isSpeechSupported) {
      setSpeechErrorNotice({
        type: 'unsupported',
        message: t('assistant.speechUnsupported') || (isHindi
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Web Speech API) समर्थित नहीं है। कृपया लिखकर पूछें।'
          : isHinglish
          ? 'Aapke browser mein voice speech recognition support nahi hai. Please type karke poochein.'
          : 'Speech recognition is not supported in this browser. Please type your message.')
      });
      return;
    }

    try {
      // Abort any previous instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      // Speech recognition language: Hindi for 'hi', Indian English (which handles accents & Hinglish well) for 'en' and 'hinglish'
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInputText((prev) => {
            const separator = prev.trim() && !prev.endsWith(' ') ? ' ' : '';
            return (prev.trim() ? prev + separator : '') + final.trim();
          });
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechErrorNotice({
            type: 'permission',
            message: t('assistant.micPermissionDenied') || (isHindi
              ? 'माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
              : isHinglish
              ? 'Microphone permission deny ho gayi hai. Browser settings mein mic allow karein.'
              : 'Microphone permission was denied. Please allow microphone access in browser settings.')
          });
        } else if (event.error === 'no-speech') {
          setSpeechErrorNotice({
            type: 'no-speech',
            message: t('assistant.speechNoSpeech') || (isHindi
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया पुनः माइक दबाकर बोलें।'
              : isHinglish
              ? 'Koi aawaaz detect nahi hui. Please mic button dubara daba kar bolein.'
              : 'No speech was detected. Please try clicking the microphone again.')
          });
        } else if (event.error !== 'aborted') {
          setSpeechErrorNotice({
            type: 'error',
            message: t('assistant.speechError') || (isHindi
              ? `आवाज़ पहचान में समस्या: ${event.error}`
              : isHinglish
              ? `Voice input mein problem: ${event.error}`
              : `Speech recognition error: ${event.error}`)
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechErrorNotice({
        type: 'error',
        message: err.message || 'Could not start voice recognition'
      });
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    // Stop active voice input if still listening
    if (isListening) {
      stopVoiceInput();
    }

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Construct conversation history for multi-turn follow-up context
    const recentHistory = messages.slice(-10).map((m) => ({
      sender: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorMessage('');
    setLastFailedMessage(null);
    setSuggestedFollowUps([]);

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
          language: language,
          threadId: threadId,
          history: recentHistory,
          context: authorizedContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (data.configNotice) {
        setAiConfigNotice(data.configNotice);
      }

      if (Array.isArray(data.suggestedFollowUps) && data.suggestedFollowUps.length > 0) {
        setSuggestedFollowUps(data.suggestedFollowUps);
      }

      const defaultReply = isHindi
        ? "मैं आपकी जानकारी का विश्लेषण कर रही हूँ। कृपया व्यक्तिगत सलाह के लिए योग्य चिकित्सक से संपर्क करें।"
        : (isHinglish
        ? "Main aapki details analyze kar rahi hoon. Personal diagnosis ke liye doctor se zaroor consult karein."
        : "I am currently synthesizing your question. Please consult a qualified medical professional for personal clinical guidance.");

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || defaultReply,
        modelUsed: data.provider || data.modelUsed || 'Google Gemini Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      setLastFailedMessage(userMsg.text);
      setErrorMessage(
        isHindi
          ? 'धात्री AI सेवा से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।'
          : (isHinglish
          ? 'Dhatri AI service se connect hone mein issue hua. Phir se try karein.'
          : 'Unable to connect to Dhatri AI service. Click retry to send again.')
      );
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_err_' + Date.now(),
          sender: 'ai',
          text: isHindi
            ? `⚠️ **कनेक्शन में अस्थायी समस्या आई है।**\n\nकृपया नेटवर्क जांचें या नीचे दिए गए **पुनः प्रयास (Retry)** बटन पर क्लिक करें।\n\n*यदि आप गंभीर तीव्र दर्द, अत्यधिक रक्तस्राव या बेहोशी महसूस कर रही हैं, तो तुरंत नजदीकी चिकित्सा केंद्र से संपर्क करें।*`
            : (isHinglish
            ? `⚠️ **Connection mein temporary issue aaya hai.**\n\nNetwork check karein ya neeche diye gaye **Retry** button par click karein.\n\n*Emergency notice: Agar severe pain, heavy bleeding ya dizziness ho rahi hai toh turant emergency medical care lein.*`
            : `⚠️ **Temporary Connection Issue**\n\nI was unable to retrieve a response from the service. Please verify your connection or click **Retry** below.\n\n*Safety Notice: If you are experiencing sudden severe pelvic pain, high fever, or hemorrhage, please seek emergency medical attention immediately.*`),
          modelUsed: 'Offline Safety Notice',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setThreadId(null);
    setSuggestedFollowUps([]);
    const resetText = isHindi
      ? `### बातचीत का इतिहास साफ़ कर दिया गया है ✨\n\nमैं आपके अगले स्वास्थ्य प्रश्न, लक्षण, आहार या व्यायाम संबंधी सवाल के लिए तैयार हूँ। आप हिंदी, English या Hinglish में कुछ भी पूछ सकती हैं।`
      : (isHinglish
      ? `### Chat history clear kar di gayi hai ✨\n\nMain aapke agle health question, symptoms, diet ya exercise ke sawaal ke liye ready hoon. Aap Hinglish, Hindi ya English mein pooch sakti hain!`
      : `### Conversation history cleared ✨\n\nI'm ready for your next health question, symptom discussion, diet inquiry, or cycle observation. Feel free to ask in English, Hindi, or Hinglish!`);

    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: resetText,
        modelUsed: 'Google Gemini Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const activePrompts = isHindi
    ? SUGGESTED_PROMPTS_HI
    : (isHinglish ? SUGGESTED_PROMPTS_HINGLISH : SUGGESTED_PROMPTS_EN);

  return (
    <div className="ai-assistant-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '1rem' }}>
      <UrgentCareBanner />

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌸</span>
            <h1 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--color-burgundy)' }}>
              {isHindi ? 'धात्री AI वेलनेस सहेली' : (isHinglish ? 'Dhatri AI Wellness Saheli' : 'Dhatri AI Wellness Companion')}
            </h1>
            <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
              {isHindi ? 'Google Gemini Flash • हिंदी' : (isHinglish ? 'Google Gemini Flash • Hinglish' : 'Google Gemini Flash • English')}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {isHindi
              ? 'लक्षण समझ, भारतीय आहार, योगासन एवं प्रामाणिक चिकित्सीय जानकारी।'
              : (isHinglish
              ? 'Symptoms guidance, desi nutrition, gentle yoga aur clinical health awareness.'
              : 'Symptom guidance, wholesome Indian nutrition, gentle yoga, and clinical health education.')}
          </div>
        </div>

        {/* Language & Context Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            id="ai-language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <option value="en">Language: English</option>
            <option value="hi">भाषा: हिंदी (Hindi)</option>
            <option value="hinglish">भाषा: Hinglish (मिक्स हिंदी-English)</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              style={{ accentColor: 'var(--color-rose)' }}
            />
            {t('assistant.authContext') || (isHindi ? 'हेल्थ कॉन्टेक्स्ट साझा करें' : (isHinglish ? 'Mera Health Context Share Karein' : 'Authorize My Health Context'))}
          </label>

          <button
            onClick={handleClearHistory}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            title={t('assistant.clearChat') || (isHindi ? 'चैट रीसेट करें' : (isHinglish ? 'Chat reset karein' : 'Reset Chat'))}
          >
            <Icon name="refresh" size={14} /> {t('assistant.clearChat') || (isHindi ? 'रीसेट' : (isHinglish ? 'Reset' : 'Reset'))}
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
        id="ai-chat-messages-container"
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
                  maxWidth: isUser ? '78%' : '88%',
                  padding: '1rem 1.35rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'var(--control-active-bg)' : 'var(--bg-secondary)',
                  color: isUser ? 'var(--control-active-text)' : 'var(--text-primary)',
                  border: isUser ? '1px solid var(--control-active-border)' : '1px solid var(--border-card)',
                  lineHeight: 1.6,
                  fontSize: '0.94rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <FormattedMessage text={m.text} isUser={isUser} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                <span>{m.timestamp}</span>
                {m.modelUsed && <span>• {m.modelUsed}</span>}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted)', fontSize: '0.88rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', alignSelf: 'flex-start' }}>
            <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
            <span>
              {isHindi
                ? 'धात्री AI विचार कर रही है (Gemini Flash)...'
                : (isHinglish
                ? 'Dhatri AI soch rahi hai (Gemini Flash)...'
                : 'Dhatri AI is synthesizing with Gemini Flash...')}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-Ups from AI (if provided) */}
      {suggestedFollowUps.length > 0 && !isLoading && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.25rem 0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {isHindi ? 'सुझाए गए सवाल:' : (isHinglish ? 'Suggested sawaal:' : 'Suggested follow-ups:')}
          </span>
          {suggestedFollowUps.map((fu, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(fu)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--color-primary-rose)',
                background: 'var(--bg-accent-soft)',
                color: 'var(--color-burgundy)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {fu}
            </button>
          ))}
        </div>
      )}

      {/* Suggested Prompts Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {activePrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isLoading}
            style={{
              padding: '0.5rem 0.95rem',
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
              {isHindi ? 'पुनः प्रयास करें' : (isHinglish ? 'Phir Try Karein' : 'Retry')}
            </button>
          )}
        </div>
      )}

      {/* Listening Status Bar */}
      {isListening && (
        <div
          id="speech-listening-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 1rem',
            background: 'rgba(217, 111, 137, 0.12)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-rose)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#dc2626' }}></span>
            <strong style={{ color: '#dc2626' }}>
              {t('assistant.listening') || (isHindi ? 'सुन रहे हैं...' : (isHinglish ? 'Sun rahe hain...' : 'Listening...'))}
            </strong>
            {interimTranscript && (
              <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "{interimTranscript}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={stopVoiceInput}
            className="btn btn-outline"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--color-rose)', color: 'var(--color-rose)' }}
          >
            {t('assistant.stopVoice') || (isHindi ? 'रोकें' : (isHinglish ? 'Rokein' : 'Stop'))}
          </button>
        </div>
      )}

      {/* Speech Error / Permission / Fallback Notice Banner */}
      {speechErrorNotice && (
        <div
          id="speech-error-notice"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.9rem',
            background: speechErrorNotice.type === 'permission' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${speechErrorNotice.type === 'permission' ? '#ef4444' : '#f59e0b'}`,
            fontSize: '0.82rem',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{speechErrorNotice.type === 'permission' ? '🔒' : 'ℹ️'}</span>
            <span>{speechErrorNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechErrorNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.6rem', position: 'relative', alignItems: 'center' }}>
        <input
          id="ai-chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={
            isHindi
              ? "धात्री से अपने लक्षणों, क्रैम्प्स, सिरदर्द, भोजन या योगासन के बारे में पूछें..."
              : (isHinglish
              ? "Dhatri se symptoms ('Cramps ho rahe hain...'), diet, yoga ke baare mein poochein..."
              : "Ask Dhatri about symptoms, Indian diet, cramps, yoga...")
          }
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

        {/* Microphone Button */}
        <button
          id="ai-chat-mic-btn"
          type="button"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          disabled={isLoading}
          aria-label={isListening ? (t('assistant.stopVoice') || 'Stop Voice') : (t('assistant.startVoice') || 'Start Voice')}
          aria-pressed={isListening}
          title={isListening
            ? (t('assistant.stopVoice') || (isHindi ? 'आवाज़ रिकॉर्डिंग रोकें' : (isHinglish ? 'Voice stop karein' : 'Stop voice input')))
            : (t('assistant.startVoice') || (isHindi ? 'बोलकर पूछें (माइक)' : (isHinglish ? 'Bol kar poochein (Mic)' : 'Speak to Dhatri (Microphone)')))}
          className={`btn ${isListening ? 'btn-secondary' : 'btn-outline'}`}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: isListening ? '#dc2626' : 'var(--border-color)',
            background: isListening ? '#fef2f2' : 'var(--color-surface)',
            color: isListening ? '#dc2626' : 'var(--text-primary)',
            transition: 'all var(--transition-fast)',
            boxShadow: isListening ? '0 0 0 3px rgba(220, 38, 38, 0.2)' : 'none'
          }}
        >
          <Icon name={isListening ? 'mic-off' : 'mic'} size={18} color={isListening ? '#dc2626' : 'var(--color-rose)'} />
        </button>

        {/* Send Button */}
        <button
          id="ai-chat-send-btn"
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="btn btn-primary"
          style={{ padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>{t('assistant.send') || (isHindi ? 'भेजें' : (isHinglish ? 'Bhejein' : 'Send'))}</span>
          <Icon name="send" size={16} />
        </button>
      </div>

      {/* Safety Micro-Footer */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ⚖️ <strong>{isHindi ? 'चिकित्सीय सुरक्षा नियम:' : (isHinglish ? 'Medical Safety Protocol:' : 'Medical Safety Protocol:')}</strong>{' '}
        {isHindi
          ? 'धात्री बीमारी का इलाज या दवाइयों की खुराक नहीं देती। यह जानकारी आपके डॉक्टर से परामर्श और दैनिक वेलनेस के लिए है।'
          : (isHinglish
          ? 'Dhatri medical diagnosis ya dawaiyon ka prescription nahi deti. Yeh guidance wellness self-care aur doctor se consultation ke liye hai.'
          : 'Dhatri does not provide medical diagnoses or prescribe medications. Guidance is formulated for wellness self-care and collaborative discussion with your healthcare professional.')}
      </div>
    </div>
  );
}
