import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { AIConversation } from '../models/AIConversation.js';
import { SymptomLog } from '../models/SymptomLog.js';
import { HealthReport } from '../models/HealthReport.js';
import { CycleLog } from '../models/CycleLog.js';
import { isMongoConnected, fallbackStore } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive Clinical, Nutritional & Cultural System Instruction
const DHATRI_SYSTEM_PROMPT = `
You are Dhatri (धात्री) — Your Wellness Bestie, an intelligent, empathetic, compassionate, and clinically grounded women's health companion.

CORE IDENTITY & ETHICAL MANDATE:
1. EDUCATIONAL & OBSERVATIONAL COMPANION: You are an educational guide and wellness companion, NEVER a doctor.
2. ABSOLUTE MEDICAL BOUNDARY: You must NEVER diagnose diseases (e.g. do NOT say "You have Endometriosis", "This is PCOS", or "You are anemic"). NEVER prescribe prescription drugs, medical dosages, or high-dose pharmaceutical supplements.
3. COMMUNICATE UNCERTAINTY: Frame observations objectively: "In women's health physiology, these symptoms are often explored by clinicians in the context of..."
4. EMERGENCY RED FLAGS: If the user reports sudden severe abdominal/pelvic pain, hemorrhage soaking 2+ pads/hour for 2+ hours, high fever with stiff neck, fainting/loss of consciousness, severe dizziness, or acute distress: immediately advise seeking emergency medical attention or contacting nearest hospital.

WOMEN'S HEALTH & SYMPTOM GUIDANCE:
- Handle common symptoms naturally: pelvic cramps, low energy/fatigue, migraine/headaches, bloating, mood shifts/anxiety, breast tenderness, acne flare-ups, temperature fluctuations.
- Explain physiological mechanisms in simple, understandable terms (e.g., prostaglandins causing uterine muscle contractions during menstruation; estrogen/progesterone drop triggering late luteal headaches/migraines; hydration deficit elevating vasopressin).
- Ask relevant follow-up questions (onset, cycle phase, pain characteristics, accompanying factors).
- Provide safe, comforting self-care options (warm compress, hydration with electrolytes, gentle restorative stretches, herbal teas like chamomile or ginger, resting in a dim room).

INDIAN DIET & NUTRITION GUIDANCE:
- Provide practical, affordable, and culturally familiar Indian meal suggestions using commonly available ingredients:
  * Breakfast: Poha with roasted peanuts and lemon, moong dal chilla with fresh coriander-mint chutney, ragi malt/cheela, vegetable oats, boiled eggs with whole-grain toast.
  * Lunch: Palak or methi dal with brown rice or whole-wheat roti, rajma/chole with seasonal subzi, sprouts salad with cucumber & amla, fresh homemade curd.
  * Dinner: Light comforting moong dal khichdi with a teaspoon of ghee, paneer bhurji with multigrain roti, bottle gourd (lauki) sabzi with dal, vegetable soup.
  * Healthy snacks: Roasted chana, makhana (foxnuts), seasonal fruits (guava, papaya, pomegranate, amla), til-gur (sesame-jaggery) laddu, fresh chaas (buttermilk) with roasted cumin.
- Explain specific nutrient sources simply:
  * Iron: Spinach (palak), methi, lentils, beetroot, jaggery, sesame seeds (til), pomegranate. Pair with Vitamin C (lemon, amla) for bio-absorption.
  * Protein: Moong/masoor/toor dal, paneer, eggs, curd, soybean, chickpeas, peanuts.
  * Calcium: Dairy curd/milk, ragi, white sesame seeds, paneer.
  * Folate: Green leafy vegetables, lentils, beans, citrus fruits.
  * Vitamin B12: Dairy, eggs, fortified cereals; mention testing for vegetarians.
- Ask relevant questions about age group, dietary preference (vegetarian, vegan, non-vegetarian), food allergies, or restrictions.
- Never assume a nutrient deficiency based on symptoms alone; recommend medical testing (e.g., Serum Ferritin, Vitamin D3, Complete Blood Count) and clinical consultation.

EXERCISE & LIFESTYLE GUIDANCE:
- Safe, practical physical activities: brisk walking, gentle stretching, yoga poses (Balasana/Child's pose, Supta Baddha Konasana/Reclining butterfly, Marjaryasana-Bitilasana/Cat-Cow, Viparita Karani/Legs up the wall for pelvic relief).
- Cycle Phase-Aware Adaptation:
  * Menstrual Phase: Restorative movement, gentle walking, light stretching, deep diaphragmatic breathing.
  * Follicular & Ovulatory Phase: Moderate-to-high aerobic exercise, strength training, higher energy tasks.
  * Luteal Phase: Steady-state cardio, pilates, yoga, prioritizing sleep and stress management.
- Highlight safety precautions: avoid heavy abdominal straining or strenuous inversion during acute cramp flare-ups.

MENSTRUAL CYCLE & REPRODUCTIVE HEALTH:
- Explain cycle phases (Menstrual, Follicular, Ovulatory, Luteal), PMS, hormonal balance, perimenopause, and menopause support.
- When authorized user context is provided (cycle length, current day/phase, recent symptoms, lab biomarkers), correlate observations with her real health history without exposing sensitive private details.
- Never diagnose PCOS or anemia through chat. Suggest relevant questions she can bring to her gynecologist (SBAR framework).

MULTILINGUAL & FORMATTING DIRECTIVES:
- Respond in the language requested or implied:
  * Hindi (हिंदी): If user asks in Hindi or Hindi language is selected, respond in warm, fluent, empathetic Hindi (हिंदी लिपि).
  * Hinglish: If user asks in conversational Romanized Hindi (e.g., "Mere sir me dard ho raha hai", "periods ke time cramps"), reply in warm, relatable Hinglish that blends everyday Hindi with clear English medical/wellness terms.
  * English: Respond in clear, compassionate, evidence-based English.
- Structure responses with clear Markdown headings (###), organized bullet points, bold key concepts, and gentle follow-up questions.
`;

// Primary and fallback Gemini Flash models
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

/**
 * Call Gemini Flash using the official @google/genai SDK
 */
async function callGeminiSDK(messages, userContext, language) {
  let geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    try {
      const envPath = path.resolve(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GEMINI_API_KEY\s*=\s*(["']?)([^"'\r\n]+)\1/);
        if (match && match[2]) {
          process.env.GEMINI_API_KEY = match[2].trim();
          geminiKey = process.env.GEMINI_API_KEY;
        }
      }
    } catch (e) {}
  }

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server/.env');
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });

  // Explicit language determination
  const normLang = (language || 'en').toLowerCase().trim();
  const isHinglish = normLang.includes('hing');
  const isHindi = !isHinglish && (normLang === 'hi' || normLang.includes('hindi'));

  let languageDirective = '';
  if (isHinglish) {
    languageDirective = `\n\nCRITICAL LANGUAGE MANDATE:
The user has chosen HINGLISH.
1. You MUST formulate your entire response in conversational Hinglish using the Latin/Roman alphabet (everyday Hindi mixed naturally with English health terms).
2. DO NOT use Devanagari script (no हिंदी लिपि).
3. DO NOT write solely in pure formal English.
4. Example style: "Aapko periods ke time cramps isliye hote hain kyunki prostaglandins uterine contractions cause karte hain. Aap warm water bottle use kar sakti hain aur moong dal khichdi ya chamomile tea le sakti hain..."
5. Always keep the tone friendly, empathetic, and reassuring.`;
  } else if (isHindi) {
    languageDirective = `\n\nCRITICAL LANGUAGE MANDATE:
The user has chosen HINDI (हिंदी).
1. You MUST formulate your entire response in fluent, respectful, natural Hindi using DEVANAGARI script (हिंदी लिपि).
2. DO NOT write in English paragraphs or Romanized Hindi. Standard clinical acronyms (like TSH, CBC, Hb, PCOS) in parentheses are acceptable.
3. Keep the tone warm, clear, and reassuring.`;
  } else {
    languageDirective = `\n\nCRITICAL LANGUAGE MANDATE:
The user has chosen ENGLISH.
1. You MUST formulate your response in clear, compassionate, evidence-based English.`;
  }

  // Format multi-turn conversation contents
  const contents = [];

  // If user context exists, inject as context snippet
  let contextSnippet = '';
  if (userContext && Object.keys(userContext).length > 0) {
    const parts = [];
    if (userContext.currentCyclePhase) parts.push(`Current Inferred Phase: ${userContext.currentCyclePhase}`);
    if (userContext.averageCycleLength) parts.push(`Average Cycle: ${userContext.averageCycleLength} days`);
    if (userContext.recentSymptoms?.length) parts.push(`Recent Logged Symptoms: ${userContext.recentSymptoms.slice(0, 3).join(', ')}`);
    if (userContext.recentReports?.length) parts.push(`Recent Lab Reports: ${userContext.recentReports.slice(0, 2).join(', ')}`);
    if (parts.length > 0) {
      contextSnippet = `\n[Authorized Patient Context (Self-Reported Baseline)]: ${parts.join(' | ')}`;
    }
  }

  // Map incoming multi-turn history
  if (Array.isArray(messages) && messages.length > 1) {
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.text && typeof msg.text === 'string' && msg.text.trim()) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }
  }

  // Add the latest user query with language tag
  const lastMsg = messages[messages.length - 1];
  const queryText = (lastMsg?.text || '').trim();
  const langTag = isHinglish
    ? `[Instruction: Respond in conversational Hinglish (Roman script)]`
    : isHindi
    ? `[Instruction: Respond in fluent Hindi (Devanagari script)]`
    : `[Instruction: Respond in English]`;

  const fullUserText = contextSnippet ? `${queryText}\n${contextSnippet}\n${langTag}` : `${queryText}\n${langTag}`;

  contents.push({
    role: 'user',
    parts: [{ text: fullUserText }]
  });

  // Try supported flash models with graceful cascade
  let lastError = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: `${DHATRI_SYSTEM_PROMPT}${languageDirective}`,
          temperature: 0.5,
          maxOutputTokens: 1000
        }
      });

      if (response && response.text) {
        return {
          text: response.text,
          provider: `Google Gemini Flash (${modelName})`,
          isLiveAI: true
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Dhatri AI] Model ${modelName} returned notice: ${err.message}. Trying next fallback...`);
    }
  }

  throw lastError || new Error('All Gemini Flash models currently unavailable.');
}

/**
 * Resilient clinical knowledge engine when external API keys are unavailable or network is down
 */
function generateClinicalKnowledgeFallback(prompt, userContext = {}, language = 'en') {
  const q = (prompt || '').toLowerCase();
  const normLang = (language || 'en').toLowerCase().trim();
  const isHinglish = normLang.includes('hing') ||
    (!normLang.includes('hi') && (q.includes('hai') || q.includes('kya') || q.includes('dard') || q.includes('bohot') || q.includes('meri') || q.includes('mujhe') || q.includes('batao')));
  const isHindi = !isHinglish && (normLang === 'hi' || normLang.includes('hindi'));

  // Red flags
  if (q.includes('severe pain') || q.includes('heavy bleeding') || q.includes('fainting') || q.includes('emergency') || q.includes('soaking pad') || q.includes('behosh')) {
    if (isHinglish) {
      return {
        text: `⚠️ **Urgent Medical Notice (Emergency Guidance):**\n\nAapne jo symptoms mention kiye hain (jaise severe acute pain, heavy bleeding soaking 2+ pads/hour, ya dizziness/fainting), inme turant emergency medical attention ki zaroorat ho sakti hai.\n\n• Please bina delay kiye apne nearest hospital emergency ya Gynecologist se consult karein.\n• Dhatri ek wellness companion hai aur emergency clinical care ka substitute nahi hai.`,
        isClinicalObservation: false,
        followUps: ['Emergency Care Guidelines', 'Doctor se kya kahein']
      };
    }
    if (isHindi) {
      return {
        text: `⚠️ **महत्वपूर्ण चिकित्सीय सूचना (Urgent Medical Warning):**\n\nआपके द्वारा बताए गए लक्षण (जैसे अत्यधिक तीव्र दर्द, अत्यधिक रक्तस्राव या बेहोशी) में तत्काल डॉक्टर या इमरजेंसी देखभाल की आवश्यकता हो सकती है।\n\n• तुरंत किसी नजदीकी अस्पताल या स्त्री रोग विशेषज्ञ (Gynecologist) से संपर्क करें।\n• धात्री एक शैक्षिक साथी है, यह आपातकालीन चिकित्सा सेवा का विकल्प नहीं है।`,
        isClinicalObservation: false,
        followUps: ['इमरजेंसी हेल्पलाइन', 'डॉक्टर से क्या कहें']
      };
    }
    return {
      text: `⚠️ **Urgent Medical Notice:**\n\nThe symptoms you described (such as severe acute pain, heavy hemorrhaging, or fainting) warrant prompt evaluation by an emergency healthcare professional.\n\n• Please contact your local hospital or on-call gynecologist immediately.\n• Dhatri is a wellness companion and does not replace emergency clinical evaluation.`,
      isClinicalObservation: false,
      followUps: ['Emergency Care Guidelines', 'Find Nearest Care']
    };
  }

  // Symptom: Headaches / Migraine
  if (q.includes('sir mein dard') || q.includes('headache') || q.includes('migraine') || q.includes('sir dard')) {
    if (isHinglish) {
      return {
        text: `### Periods Ke Aas-Paas Sir Dard (Menstrual Headaches)\n\nPeriods se pehle ya luteal phase me sir dard hona kaafi common hai. Yeh generally estrogen aur progesterone hormones ke sudden drop ki wajah se neurovascular reactivity badhne se hota hai.\n\n**Helpful Self-Care Tips:**\n• **Hydration:** Khoob paani aur electrolytes pijiye. Dehydration se headaches trigger hote hain.\n• **Hot/Cold Compress:** Maathe par ya neck ke peeche cold pack ya warm cloth lagayein.\n• **Adrak Ki Chai:** Ginger me natural anti-inflammatory properties hoti hain jo pain relief me help karti hain.\n• **Screen Rest:** Bright lights aur screen time kam karein aur dim light wale room me aaram karein.\n\n*Notice: Agar headache sudden aur unbearable ho ya aankhon ke aage darkness aaye, toh turant doctor ko dikhayein.*`,
        isClinicalObservation: true,
        followUps: ['Cramps relief tips', 'Iron rich Indian diet', 'Doctor questions']
      };
    }
    if (isHindi) {
      return {
        text: `### पीरियड्स से पहले या दौरान सिरदर्द (Menstrual Headaches)\n\nपीरियड्स के आसपास सिरदर्द होना काफी सामान्य है। अक्सर यह एस्ट्रोजन और प्रोजेस्टेरोन हार्मोन के स्तर में गिरावट के कारण होता है।\n\n**आसान घरेलू उपाय (Self-Care Options):**\n• **हाइड्रेशन:** पर्याप्त गुनगुना पानी पिएं, नींबू पानी या नारियल पानी लें। डिहाइड्रेशन से सिरदर्द बढ़ सकता है।\n• **सेंक (Compress):** माथे या गर्दन के पीछे ठंडी या हल्की गर्म सिंकाई करें।\n• **अदरक की चाय:** अदरक सूजन कम करने में सहायक होती है।\n• **आराम:** स्क्रीन टाइम कम करें और शांत, हल्के अंधेरे कमरे में विश्राम करें।\n\n**डाइट सहायता:** बादाम, कद्दू के बीज और केला (मैग्नीशियम से भरपूर) मांसपेशियों को आराम देते हैं।\n\n*नोट: यदि सिरदर्द असहनीय हो या दृष्टि में धुंधलापन आए, तो तुरंत चिकित्सक से परामर्श लें।*`,
        isClinicalObservation: true,
        followUps: ['आयरन युक्त आहार क्या है?', 'डॉक्टर से क्या पूछें?']
      };
    }
    return {
      text: `### Cyclical & Menstrual Headaches\n\nHeadaches clustering around your period are frequently linked to the premenstrual drop in circulating estrogen and progesterone, which increases neurovascular reactivity.\n\n**Evidence-Based Self-Care:**\n• **Hydration:** Ensure adequate water intake with electrolytes; dehydration elevates vasopressin and worsens vascular headaches.\n• **Temperature Compress:** Apply a cool or warm compress to your forehead or the back of your neck.\n• **Ginger Infusion:** Fresh ginger tea has natural anti-inflammatory properties that can soothe menstrual headache onset.\n• **Magnesium-Rich Nutrition:** Snack on almonds, pumpkin seeds, or bananas to support neuromuscular relaxation.\n\n*Safety Notice: If you experience sudden thunderclap headaches, visual disturbances, or neurological numbness, consult a medical professional immediately.*`,
      isClinicalObservation: true,
      followUps: ['Why does estrogen withdrawal cause headaches?', 'Cycle pacing tips for luteal phase', 'Doctor questions for headache']
    };
  }

  // Symptom: Cramps / Pelvic Pain
  if (q.includes('cramp') || q.includes('dard') || q.includes('pain') || q.includes('pet dard') || q.includes('dysmenorrhea')) {
    if (isHinglish) {
      return {
        text: `### Period Cramps Aur Pelvic Pain (Understanding Dysmenorrhea)\n\nPeriods me cramps isliye hote hain kyunki uterine lining me **prostaglandins** bante hain jo uterus ke muscles ko contract karte hain. Yeh contractions pelvic pain cause karti hain.\n\n**Effective Relief Measures:**\n• **Heat Therapy:** Lower abdomen par hot water bottle ya heating pad rakhein. Heat blood flow badhati hai aur myometrium ko relax karti hai.\n• **Gentle Yoga Asanas:** Balasana (Child's Pose) aur Supta Baddha Konasana pelvic tension release karne me bohot effective hain.\n• **Garam Liquids:** Chamomile tea, ajwain-methi water ya adrak ki chai cramps ko calm karti hai.\n• **Light Walking:** Gentle walking endorphins release karti hai jo natural painkiller ka kaam karte hain.\n\n*Doctor Visit Guidance: Agar pain unbearable ho aur painkillers se bhi aaram na mile, toh Gynecologist se adenomyosis ya endometriosis check karwayein.*`,
        isClinicalObservation: true,
        followUps: ['Gentle yoga for cramps', 'Wholesome period diet', 'Questions for Gynecologist']
      };
    }
    if (isHindi) {
      return {
        text: `### पीरियड क्रैम्प्स एवं पेल्विक दर्द (Menstrual Cramps)\n\nपीरियड्स के दौरान गर्भाशय में प्रोस्टाग्लैंडिन्स (Prostaglandins) नामक रसायन की वजह से संकुचन (contractions) होता है, जिससे क्रैम्प्स महसूस होते हैं।\n\n**राहत के सुरक्षित उपाय:**\n• **गर्म सिंकाई (Heat Therapy):** पेट के निचले हिस्से पर हीटिंग पैड या गर्म पानी की थैली रखें। यह मांसपेशियों के तनाव को कम करती है।\n• **हल्के योगासन:** बालासन (Child's Pose) और मार्जरीआसन (Cat-Cow Pose) पेल्विक हिस्से को आराम देते हैं।\n• **गुनगुने तरल पदार्थ:** कैमोमाइल, अदरक या सौंफ का काढ़ा गर्भाशय की ऐंठन को शांत करने में मदद करता है।\n• **डाइट:** अधिक नमक और तली-भुनी चीजों से बचें जो ब्लोटिंग बढ़ा सकती हैं।\n\n*सलाह: यदि दर्द इतना अधिक है कि दैनिक कार्य बाधित हो रहे हैं, तो स्त्री रोग विशेषज्ञ से जांच अवश्य कराएं।*`,
        isClinicalObservation: true,
        followUps: ['क्रैम्प्स के लिए योगासन', 'दर्द के दौरान क्या खाएं?']
      };
    }
    return {
      text: `### Understanding Menstrual Cramps (Dysmenorrhea)\n\nMenstrual cramping is primarily triggered by prostaglandins—hormone-like lipids produced in the uterine lining that cause uterine muscle contractions to shed the endometrium.\n\n**Practical Supportive Measures:**\n• **Continuous Heat Therapy:** Applying a heating pad or hot water bottle to your lower abdomen relaxes the myometrium.\n• **Gentle Yoga Asanas:** Restorative poses such as Child's Pose (Balasana) and Reclining Butterfly (Supta Baddha Konasana) reduce pelvic floor tension.\n• **Hydration & Electrolytes:** Dehydration exacerbates uterine contractions. Drink warm water, herbal teas (ginger, chamomile), or electrolyte broths.\n• **Dietary Anti-Inflammatories:** Incorporate turmeric, ginger, and omega-rich seeds while minimizing excess sodium.\n\n*Clinical Note: Severe, debilitating pain that does not respond to standard self-care deserves clinical evaluation to rule out secondary causes such as adenomyosis or endometriosis.*`,
      isClinicalObservation: true,
      followUps: ['Yoga for menstrual cramps', 'Anti-inflammatory Indian foods', 'Doctor consultation checklist']
    };
  }

  // Nutrition & Diet
  if (q.includes('diet') || q.includes('nutrition') || q.includes('khana') || q.includes('food') || q.includes('bhojan') || q.includes('khayein') || q.includes('iron') || q.includes('protein')) {
    if (isHinglish) {
      return {
        text: `### Women's Health Ke Liye Balanced Indian Diet Guide\n\nHormonal vitality aur energy maintain rakhne ke liye affordable aur wholesome Indian meals kaafi effective hain:\n\n**Daily Meal Inspiration:**\n• **Breakfast:** Peanuts wala poha, moong dal chilla with mint chutney, ya ragi malt/cheela.\n• **Lunch:** Palak dal / rajma, roti ya brown rice, cucumber salad aur fresh dahi (probiotics).\n• **Evening Snack:** Roasted chana, makhana (foxnuts), ya seasonal fruits (guava, amla, pomegranate).\n• **Dinner:** Light moong dal khichdi with 1 spoon A2 ghee, ya paneer bhurji with multigrain roti.\n\n**Key Nutrients:**\n• **Iron & Folate:** Palak, methi, dal, beetroot aur til-gur (Vitamin C jaise nimbu ke sath lein absorption badhane ke liye).\n• **Protein:** Dal, sprouts, paneer, eggs, curd.\n• **Calcium:** Ragi, safed til, milk aur dahi.\n\n*Tip: Kisi bhi supplement se pehle Serum Ferritin aur Vitamin D3 test karwana behtar rehta hai.*`,
        isClinicalObservation: true,
        followUps: ['Iron rich breakfast options', 'Yoga for period days', 'Doctor visit questions']
      };
    }
    if (isHindi) {
      return {
        text: `### महिलाओं के लिए संतुलित भारतीय आहार (Balanced Indian Diet Guide)\n\nहार्मोनल संतुलन और ऊर्जा बनाए रखने के लिए किफायती और आसानी से उपलब्ध भारतीय खाद्य पदार्थ बहुत लाभकारी हैं:\n\n**दिन की भोजन योजना (Sample Meal Ideas):**\n• **नाश्ता:** मूंगफली वाला पोहा, बेसन-मेथी का चीला, या रागी का डोसा / दलिया।\n• **दोपहर का भोजन:** पालक दाल / राजमा, ब्राउन राइस या मल्टीग्रेन रोटी, सलाद और ताज़ा दही।\n• **शाम का स्नैक:** भुने हुए चने, मखाने, या गुड़-तिल की चिक्की के साथ मौसमी फल (अमरूद, सेब या पपीता)।\n• **रात का भोजन:** हल्की मूंग दाल खिचड़ी थोड़े देसी घी के साथ, या पनीर भुर्जी के साथ रोटी और लौकी की सब्जी।\n\n**महत्वपूर्ण पोषक तत्व:**\n• **आयरन:** पालक, मेथी, चुकंदर, दालें और गुड़ (साथ में नींबू का रस लें)।\n• **प्रोटीन:** दालें, पनीर, अंडे, अंकुरित अनाज (स्प्राउट्स)।\n• **कैल्शियम:** दही, दूध, रागी और सफेद तिल।\n\n*नोट: अपनी उम्र, किसी एलर्जी और पसंद के अनुसार आहार में बदलाव करें। किसी विशेष कमी के लिए डॉक्टर से जांच कराएं।*`,
        isClinicalObservation: true,
        followUps: ['आयरन बढ़ाने के उपाय', 'PCOS में क्या खाएं?']
      };
    }
    return {
      text: `### Nourishing Indian Diet & Women's Nutritional Balance\n\nA culturally grounded, accessible approach to balancing micronutrients and hormonal vitality:\n\n**Practical Daily Meal Inspiration:**\n• **Breakfast:** Lemon poha with roasted peanuts, moong dal chilla with coriander chutney, or ragi porridge.\n• **Lunch:** Iron-rich palak dal or rajma with roti/rice, cucumber-amla salad, and homemade curd for gut microbiome health.\n• **Snack:** Roasted chana, makhana (foxnuts), or seasonal fruits (guava, pomegranate, papaya).\n• **Dinner:** Light comforting khichdi with a dash of A2 ghee, or paneer bhurji with multigrain rotis and seasonal sabzi.\n\n**Key Micronutrient Priorities:**\n• **Iron & Folate:** Green leafy vegetables, lentils, beetroot, and jaggery paired with Vitamin C (lemon/amla) for absorption.\n• **Protein:** Pulses, sprouts, paneer, eggs, and Greek yogurt to support muscle and hormone synthesis.\n• **Calcium:** Ragi, sesame seeds (til), and dairy curd.\n\n*Guidance: Always verify suspected nutritional deficiencies with objective laboratory tests (e.g. Ferritin, Vitamin D3) rather than self-diagnosing.*`,
      isClinicalObservation: true,
      followUps: ['Foods for boosting Ferritin', 'PCOS-friendly meal tips', 'Cycle-syncing nutrition']
    };
  }

  // General fallback
  if (isHinglish) {
    return {
      text: `Hello dost! Main Dhatri hoon — Aapki Personalized Wellness Bestie. 🌸\n\nMain aapke menstrual cycle, symptoms (jaise sir dard, cramps, fatigue), balanced Indian diet, aur doctor consultation ki tayari me help kar sakti hoon.\n\nAap mujhse kuch bhi pooch sakti hain, jaise:\n• *"Mere periods ke time cramps aur headache me kya relief lu?"*\n• *"Low energy aur iron improve karne ke liye Indian diet plan"* \n• *"Period days ke dauran safe yoga stretches kaun se hain?"*`,
      isClinicalObservation: false,
      followUps: ['Period cramps tips', 'Healthy Indian diet', 'Doctor questions']
    };
  }

  if (isHindi) {
    return {
      text: `नमस्ते! मैं आपकी धात्री वेलनेस सहेली हूँ। 🌸\n\nमैं आपके मासिक धर्म चक्र, लक्षणों (जैसे सिरदर्द, क्रैम्प्स, थकान), भारतीय खान-पान, और डॉक्टर से परामर्श की तैयारी में मदद कर सकती हूँ।\n\nआप मुझसे कुछ भी पूछ सकती हैं, जैसे:\n• *"पीरियड्स के समय कमजोरी और सिरदर्द से कैसे राहत पाएं?"*\n• *"आयरन बढ़ाने के लिए क्या खाना चाहिए?"*\n• *"हार्मोनल संतुलन के लिए आसान योग और डाइट बताएं"*`,
      isClinicalObservation: false,
      followUps: ['पीरियड्स के लक्षण', 'स्वस्थ आहार गाइड', 'डॉक्टर से क्या पूछें?']
    };
  }

  return {
    text: `Hello! I'm Dhatri, your personalized Wellness Bestie. 🌸\n\nI can help contextualize your menstrual symptoms, recommend nourishing Indian nutrition plans, suggest cycle-aware exercises, and prepare targeted questions for your doctor.\n\nHere are some questions we can explore together:\n• **"Why do I get headaches and fatigue right before my period?"**\n• **"Can you suggest practical Indian meals for energy and iron?"**\n• **"What gentle stretches help relieve menstrual cramps?"**\n• **"Help me organize 3 questions for my upcoming gynecologist appointment"**\n\nHow can I support your wellbeing today?`,
    isClinicalObservation: false,
    followUps: ['Explain premenstrual symptoms', 'Indian nutrition for women', 'Gentle yoga for cramps']
  };
}

/**
 * Main Controller: Handle chat with assistant
 */
export const chatWithAssistant = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { message, language = 'en', threadId, history = [], context } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Retrieve authorized user context from MongoDB if authorized
    let recentSymptoms = [];
    let recentReports = [];
    let recentCycle = null;

    try {
      if (isMongoConnected) {
        recentSymptoms = await SymptomLog.find({ userId }).sort({ date: -1 }).limit(5);
        recentReports = await HealthReport.find({ userId }).sort({ date: -1 }).limit(3);
        recentCycle = await CycleLog.findOne({ userId }).sort({ startDate: -1 });
      } else {
        recentSymptoms = fallbackStore.find('symptoms', { userId }).slice(-5);
        recentReports = fallbackStore.find('reports', { userId }).slice(-3);
        recentCycle = fallbackStore.find('cycle', { userId })[0];
      }
    } catch (e) {
      console.warn('Could not query user background records for AI context:', e.message);
    }

    const userContext = context || {
      userName: req.user.name,
      birthYear: req.user.birthYear,
      isMenstruating: req.user.isMenstruating,
      averageCycleLength: req.user.averageCycleLength || 28,
      currentCyclePhase: recentCycle?.phase || req.body?.context?.currentCyclePhase || 'unknown',
      recentSymptoms: recentSymptoms.map(s => `${s.date}: ${s.name || s.category} (severity ${s.severity}/5)`),
      recentReports: recentReports.map(r => `${r.date} ${r.title}`)
    };

    // Reconstruct full multi-turn conversation messages
    let conversationTurns = [];
    if (Array.isArray(history) && history.length > 0) {
      conversationTurns = history.map(h => ({
        sender: h.sender === 'user' ? 'user' : 'assistant',
        text: h.text || ''
      }));
    } else if (threadId) {
      // Look up previous messages from DB
      try {
        let existingConv = null;
        if (isMongoConnected) {
          existingConv = await AIConversation.findOne({ _id: threadId, userId });
        } else {
          existingConv = fallbackStore.findOne('conversations', { _id: threadId, userId });
        }
        if (existingConv && Array.isArray(existingConv.messages)) {
          conversationTurns = existingConv.messages.slice(-8).map(m => ({
            sender: m.sender,
            text: m.text
          }));
        }
      } catch (e) {}
    }

    // Add current user message
    conversationTurns.push({ sender: 'user', text: message.trim() });

    // Execute Live AI Call via Gemini SDK
    let aiResult;
    try {
      aiResult = await callGeminiSDK(conversationTurns, userContext, language);
    } catch (llmErr) {
      console.warn('[Dhatri AI] Live Gemini SDK call unsuccessful:', llmErr.message);
      // Fallback to internal clinical knowledge engine
      const fallback = generateClinicalKnowledgeFallback(message, userContext, language);
      aiResult = {
        ...fallback,
        isLiveAI: false,
        provider: 'Dhatri Clinical Knowledge Engine (Local)',
        configNotice: process.env.GEMINI_API_KEY
          ? `Notice: Gemini API temporarily unavailable (${llmErr.message?.substring(0, 75)}). Provided clinical guidance via Dhatri Knowledge Engine.`
          : 'Notice: GEMINI_API_KEY not configured. Running on Dhatri Clinical Knowledge Engine.'
      };
    }

    // Persist conversation turn in database
    let conversation;
    const userMsg = { sender: 'user', text: message.trim(), timestamp: new Date().toISOString() };
    const assistantMsg = {
      sender: 'assistant',
      text: aiResult.text,
      timestamp: new Date().toISOString(),
      isClinicalObservation: aiResult.isClinicalObservation || false,
      suggestedFollowUps: aiResult.followUps || []
    };

    try {
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
            title: message.substring(0, 40) + '...',
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
            title: message.substring(0, 40) + '...',
            language,
            messages: [userMsg, assistantMsg]
          });
        }
      }
    } catch (saveErr) {
      console.warn('Could not save conversation turn to DB:', saveErr.message);
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
    res.status(500).json({
      success: false,
      message: 'Assistant communication error.',
      error: err.message
    });
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
      if (threadId && threadId !== 'all') {
        await AIConversation.findOneAndDelete({ _id: threadId, userId });
      } else {
        await AIConversation.deleteMany({ userId });
      }
    } else {
      if (threadId && threadId !== 'all') {
        fallbackStore.findByIdAndDelete('conversations', threadId);
      } else {
        fallbackStore.deleteMany('conversations', { userId });
      }
    }

    res.json({ success: true, message: 'Conversation cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear conversation.' });
  }
};
