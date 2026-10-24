import { AIConversation } from '../models/AIConversation.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

// Medical Safety System Prompt
const DHATRI_SYSTEM_PROMPT = `
You are Dhatri (धात्री) — Your Wellness Bestie, an intelligent, empathetic, and clinically grounded women's health companion.

CORE IDENTITY & ETHICAL MANDATE:
1. You are an educational and observational health companion, NEVER a doctor.
2. ABSOLUTE MEDICAL BOUNDARY: You must NEVER diagnose diseases (e.g. do not say "You have Endometriosis" or "This is PCOS") and NEVER prescribe medications or dosages.
3. Instead, frame insights as biological observations and correlations: "In women's health literature, this cluster of symptoms is often evaluated by clinicians in the context of..."
4. URGENT SYMPTOMS (RED FLAGS): If the user reports sudden severe pelvic pain, heavy hemorrhage (soaking 2+ pads/hour for 2 hours), high fever with stiff neck, fainting, or acute chest pain, immediately advise seeking emergency medical attention.
5. EXPLAINING LABS: Explain medical ranges and terminology simply. Distinguish between "laboratory reference range" (statistical average) vs. "optimal functional range". Never claim certainty.
6. DOCTOR PREPARATION: Help the user organize their observations into clear, concise questions for their healthcare provider (SBAR approach: Situation, Background, Assessment-ready data).
7. BILINGUAL SUPPORT: You support both English and Hindi / Hinglish. If the user asks in Hindi or Hinglish, respond warmly in the same language.
8. Distinguish user-reported subjective sensations from objective clinical tests.
`;

// Clinical knowledge fallback engine when external API keys are not yet configured
function generateClinicalGuidance(prompt, userContext = {}, language = 'en') {
  const q = prompt.toLowerCase();
  const isHindi = language === 'hi' ||
    q.includes('kya') || q.includes('hai') || q.includes('dard') || q.includes('madad') ||
    q.includes('meri') || q.includes('mujhe') || q.includes('thakaan') || q.includes('thakan') ||
    q.includes('kyu') || q.includes('kyun') || q.includes('batao') || q.includes('bataiye') ||
    q.includes('kaise') || q.includes('karo') || q.includes('kamzori') || q.includes('thakawat');

  const symptomContextEng = userContext.recentSymptoms?.length
    ? `\n- **Your Saved Record Signal:** You recently logged: ${userContext.recentSymptoms.slice(0, 2).join('; ')}.`
    : '';
  const symptomContextHin = userContext.recentSymptoms?.length
    ? `\n- **आपके सहेजे गए रिकॉर्ड:** आपके हालिया लक्षण: ${userContext.recentSymptoms.slice(0, 2).join('; ')}.`
    : '';

  // Red flag check
  if (q.includes('severe pain') || q.includes('heavy bleeding') || q.includes('fainting') || q.includes('emergency') || q.includes('soaking pad')) {
    if (isHindi) {
      return {
        text: `⚠️ **महत्वपूर्ण सूचना:** आपके द्वारा बताए गए लक्षण (जैसे अत्यधिक दर्द या भारी रक्तस्राव) में तत्काल डॉक्टर या इमरजेंसी देखभाल की आवश्यकता हो सकती है। कृपया बिना देरी किए नजदीकी अस्पताल या अपनी स्त्री रोग विशेषज्ञ (Gynecologist) से संपर्क करें। धात्री एक शैक्षिक साथी है, आपातकालीन चिकित्सा सेवा नहीं।`,
        isClinicalObservation: false,
        followUps: ['इमरजेंसी हेल्पलाइन नंबर', 'डॉक्टर से पूछने के सवाल']
      };
    }
    return {
      text: `⚠️ **Urgent Medical Notice:** The symptoms you described (such as severe acute pain, heavy hemorrhaging, or fainting) warrant prompt evaluation by an emergency healthcare professional. Please contact your local hospital or on-call gynecologist immediately. Dhatri is a wellness companion and does not replace acute clinical care.`,
      isClinicalObservation: false,
      followUps: ['Emergency Care Guidelines', 'Find Nearest Care']
    };
  }

  // 1. Doctor visit preparation check (takes precedence when user asks how to prepare for appointment)
  if (q.includes('doctor') || q.includes('gynecologist') || q.includes('appointment') || q.includes('questions') || q.includes('prepare')) {
    if (isHindi) {
      return {
        text: `**डॉक्टर से परामर्श की तैयारी (SBAR गाइड):**\n\n12 मिनट के क्लिनिकल परामर्श को अधिकतम प्रभावी बनाने के लिए अपनी हेल्थ स्टोरी ऐसे रखें:\n\n1. **Situation (वर्तमान स्थिति):** अपना मुख्य लक्षण स्पष्ट बताएं: *"हाल ही में मुझे लगातार थकान और ऊर्जा में गिरावट महसूस हो रही है।"*\n2. **Background (पृष्ठभूमि):** अपना बेसलाइन बताएं: *"मेरा साइकल ${userContext.averageCycleLength || 28} दिनों का है और मेरी हालिया ब्लड रिपोर्ट में फेरिटिन सीमा पर है।"*\n3. **Assessment-Ready Data:** *"मैंने अपने लक्षणों को धात्री ऐप में ट्रैक किया है।"*\n4. **Doctor Questions (प्रश्न):** *"क्या मुझे किसी अतिरिक्त बायोमार्कर या पोषण संबंधी सप्लीमेंट की आवश्यकता है?"*`,
        isClinicalObservation: true,
        followUps: ['3-Minute Doctor Dossier बनाएं', 'चेकलिस्ट देखें']
      };
    }
    return {
      text: `**Doctor Consultation Preparation Guide (SBAR Format):**\n\nHere is how to frame your health journey in the 12-minute doctor window:\n\n1. **Situation:** State your primary symptom and exact onset: *"For the past few months, I have noticed recurring fatigue and mid-cycle heaviness."*\n2. **Background:** Share your biological baseline: *"My cycle averages ${userContext.averageCycleLength || 28} days. My last ferritin test was recorded as low-normal."*\n3. **Assessment-Ready Data:** Mention your tracking: *"I have tracked this across consecutive cycles, correlating symptoms with my diagnostic blood panels."*\n4. **Your Key Question:** *"Given this cyclical pattern, what diagnostic tests or differential steps would you recommend?"*`,
      isClinicalObservation: true,
      followUps: ['Generate 3-Minute Doctor Dossier', 'Checklist for my visit', 'How to describe pain levels objectively']
    };
  }

  // 2. Ferritin / Iron / Fatigue / Reports
  if (
    q.includes('ferritin') || q.includes('iron') || q.includes('anemia') || q.includes('fatigue') ||
    q.includes('thakaan') || q.includes('thakan') || q.includes('kamzori') || q.includes('tired') ||
    q.includes('exhaustion') || (q.includes('report') && (q.includes('blood') || q.includes('lab') || q.includes('test')))
  ) {
    if (isHindi) {
      return {
        text: `**फेरिटिन (Ferritin) और ऊर्जा के स्तर का जैविक विश्लेषण:**\n\n- **फेरिटिन क्या है:** यह आपके शरीर में जमा आयरन (लोहा) का मुख्य प्रोटीन बैंक है।${symptomContextHin}\n- **सामान्य बनाम इष्टतम (Optimal) स्तर:** लैब्स अक्सर 12-150 ng/mL को 'नॉर्मल' मानती हैं, लेकिन महिलाओं में 40-50 ng/mL से कम होने पर भी अत्यधिक थकान, बालों का झड़ना और दोपहर में सुस्ती महसूस हो सकती है।\n- **डॉक्टर के लिए सवाल:**\n  1. "क्या मेरी थकान मेरे फेरिटिन स्तर से जुड़ी हो सकती है?"\n  2. "क्या मुझे टोटल आयरन और ट्रांसफेरिन सैचुरेशन (TIBC) जांचने की आवश्यकता है?"`,
        isClinicalObservation: true,
        followUps: ['आयरन युक्त आहार क्या है?', 'डॉक्टर से क्या पूछें?']
      };
    }
    return {
      text: `**Understanding Serum Ferritin & Cellular Vitality:**\n\n- **What it measures:** Ferritin reflects your body's total stored iron reserves (your physiological "iron savings account").${symptomContextEng}\n- **Reference vs. Optimal Range:** While standard laboratory reports flag anything above 12–15 ng/mL as "normal", women's health clinicians often note that energy vitality, hair density, and cognitive clarity function best when ferritin is between **45–70+ ng/mL**.\n- **Preparation for your Doctor:**\n  1. "Could my low-normal ferritin levels be contributing to my mid-luteal fatigue pattern?"\n  2. "Would checking a Complete Iron Panel (Total Iron, TIBC, and Transferrin Saturation) provide a fuller clinical picture?"`,
      isClinicalObservation: true,
      followUps: ['How does iron affect cycle energy?', 'Prepare doctor questions on ferritin', 'Foods high in bioavailable iron']
    };
  }

  // 3. Migraines / Headaches and Cycle Phase
  if (q.includes('migraine') || q.includes('headache') || q.includes('period headache') || q.includes('luteal')) {
    return {
      text: `**Neuro-Hormonal Cyclical Headaches:**\n\n- **The Biological Mechanism:** In the late luteal phase (days 24–28), circulating estrogen and progesterone levels drop sharply to trigger menstruation. This rapid hormonal withdrawal frequently influences cerebral vascular tone, triggering menstrual migraines.\n- **Observations in your health story:** Tracking whether your headaches consistently cluster within 48–72 hours of your period onset gives your doctor invaluable objective signal.\n- **Questions for your Physician:**\n  1. "My tracking indicates headaches recurring specifically during my late luteal transition. Could this be a menstrual migraine pattern?"\n  2. "Are there targeted non-hormonal or cycle-pacing options to discuss for prevention?"`,
      isClinicalObservation: true,
      followUps: ['Why does estrogen withdrawal cause headaches?', 'Cycle pacing tips for the luteal phase', 'Doctor dossier for neurologist/gynecologist']
    };
  }

  // General Wellness
  return {
    text: `Hello! I am your Dhatri Wellness Bestie. I'm here to help you understand your unique biological rhythms, demystify medical reports, and prepare for confident conversations with your healthcare providers.\n\nHere are a few ways we can explore together:\n• **"Explain my recent ferritin and CBC lab results"**\n• **"Why do I experience energy dips during my luteal phase?"**\n• **"Help me prepare 3 questions for my gynecologist visit tomorrow"**\n• **"Hindi mein samjhaiye: Hormonal balance kya hota hai?"**\n\nWhat would you like to explore about your body today?`,
    isClinicalObservation: false,
    followUps: ['Explain my lab results', 'Why does luteal phase cause fatigue?', 'Prepare for doctor visit', 'हिंदी में बातचीत करें']
  };
}

// Live LLM Provider Adapter (Gemini / OpenAI / Clinical Engine)
async function callLLMProvider(messages, userContext, language) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const lastUserMessage = messages[messages.length - 1]?.text || '';

  // 1. Check for Gemini Key
  if (provider === 'gemini' && geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${DHATRI_SYSTEM_PROMPT}\n\nUser Context:\n${JSON.stringify(userContext)}\n\nUser Query: ${lastUserMessage}` }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            text,
            isLiveAI: true,
            provider: 'Google Gemini 1.5 Flash',
            followUps: ['Tell me more', 'Prepare doctor questions', 'What lifestyle steps are evidence-based?']
          };
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to clinical engine:', e.message);
    }
  }

  // 2. Check for OpenAI Key
  if ((provider === 'openai' || (!geminiKey && openaiKey)) && openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: DHATRI_SYSTEM_PROMPT },
            { role: 'user', content: `Context: ${JSON.stringify(userContext)}\n\nQuery: ${lastUserMessage}` }
          ],
          temperature: 0.4
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return {
            text,
            isLiveAI: true,
            provider: 'OpenAI GPT-4o-mini',
            followUps: ['Explain in simpler terms', 'Doctor questions', 'Lifestyle tips']
          };
        }
      }
    } catch (e) {
      console.warn('OpenAI API call failed, falling back to clinical engine:', e.message);
    }
  }

  // 3. Resilient Clinical Guidance Engine with transparent status notice
  const guidance = generateClinicalGuidance(lastUserMessage, userContext, language);
  return {
    ...guidance,
    isLiveAI: false,
    provider: 'Dhatri Clinical Knowledge Engine (Local)',
    configNotice: !geminiKey && !openaiKey
      ? 'Note: Running on Dhatri Clinical Knowledge Engine. To enable real-time Gemini/OpenAI models, add GEMINI_API_KEY in server/.env.'
      : null
  };
}

export const chatWithAssistant = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { message, language = 'en', threadId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Retrieve authorized user context to ground the assistant in her real health story
    let recentSymptoms = [];
    let recentReports = [];
    if (isMongoConnected) {
      recentSymptoms = await SymptomLog.find({ userId }).sort({ date: -1 }).limit(5);
      recentReports = await HealthReport.find({ userId }).sort({ date: -1 }).limit(3);
    } else {
      recentSymptoms = fallbackStore.find('symptoms', { userId }).slice(-5);
      recentReports = fallbackStore.find('reports', { userId }).slice(-3);
    }

    const userContext = {
      userName: req.user.name,
      birthYear: req.user.birthYear,
      isMenstruating: req.user.isMenstruating,
      averageCycleLength: req.user.averageCycleLength || 28,
      recentSymptoms: recentSymptoms.map(s => `${s.date}: ${s.category} (severity ${s.severity}/5)`),
      recentReports: recentReports.map(r => `${r.date} ${r.title}`)
    };

    // Call Provider
    const aiResult = await callLLMProvider([{ text: message }], userContext, language);

    // Save conversation to database
    let conversation;
    const userMsg = { sender: 'user', text: message, timestamp: new Date().toISOString() };
    const assistantMsg = {
      sender: 'assistant',
      text: aiResult.text,
      timestamp: new Date().toISOString(),
      isClinicalObservation: aiResult.isClinicalObservation || false,
      suggestedFollowUps: aiResult.followUps || []
    };

    if (isMongoConnected) {
      if (threadId) {
        conversation = await AIConversation.findOneAndUpdate(
          { _id: threadId, userId },
          { $push: { messages: { $each: [userMsg, assistantMsg] } } },
          { new: true }
        );
      }
      if (!conversation) {
        conversation = await AIConversation.create({
          userId,
          title: message.substring(0, 36) + '...',
          language,
          messages: [userMsg, assistantMsg]
        });
      }
    } else {
      if (threadId) {
        conversation = fallbackStore.findOne('conversations', { _id: threadId, userId });
        if (conversation) {
          conversation.messages.push(userMsg, assistantMsg);
          fallbackStore.findByIdAndUpdate('conversations', threadId, { messages: conversation.messages });
        }
      }
      if (!conversation) {
        conversation = fallbackStore.insert('conversations', {
          userId,
          title: message.substring(0, 36) + '...',
          language,
          messages: [userMsg, assistantMsg]
        });
      }
    }

    res.json({
      success: true,
      reply: aiResult.text,
      isLiveAI: aiResult.isLiveAI,
      provider: aiResult.provider,
      modelUsed: aiResult.provider,
      configNotice: aiResult.configNotice,
      suggestedFollowUps: aiResult.followUps || [],
      threadId: conversation?._id || conversation?.id
    });
  } catch (err) {
    console.error('AI Controller Error:', err);
    res.status(500).json({ success: false, message: 'Assistant communication error.' });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let conversations = [];
    if (isMongoConnected) {
      conversations = await AIConversation.find({ userId }).sort({ updatedAt: -1 }).limit(10);
    } else {
      conversations = fallbackStore.find('conversations', { userId });
    }

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve conversation history.' });
  }
};

export const clearConversation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { threadId } = req.params;

    if (isMongoConnected) {
      await AIConversation.findOneAndDelete({ _id: threadId, userId });
    } else {
      fallbackStore.findByIdAndDelete('conversations', threadId);
    }

    res.json({ success: true, message: 'Conversation cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear conversation.' });
  }
};
