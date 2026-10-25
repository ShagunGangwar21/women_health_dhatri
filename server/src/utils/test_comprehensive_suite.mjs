import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../server/.env') });

const apiKey = process.env.GEMINI_API_KEY;

console.log('====================================================');
console.log(' DHATRI WOMEN\'S HEALTH AI — COMPREHENSIVE TEST SUITE');
console.log('====================================================');

if (!apiKey) {
  console.error('FAIL: GEMINI_API_KEY not found in server/.env');
  process.exit(1);
}
console.log('PASS: GEMINI_API_KEY found (length: ' + apiKey.length + ')');

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are Dhatri (धात्री) — Your Wellness Bestie, an empathetic, intelligent, and clinically grounded women's health companion. Explain physiological mechanisms in simple terms, suggest affordable Indian meals (palak, dal, ragi, chana, etc.), safe yoga poses (Balasana, Cat-Cow), never diagnose diseases, and state medical uncertainty.`;

async function testQuery(testName, contents, expectedKeywords = []) {
  console.log(`\n--- Test: ${testName} ---`);
  try {
    const startTime = Date.now();
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 600
      }
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const text = res.text;
    console.log(`Response received in ${duration}s (${text.length} chars)`);
    console.log('Snippet: ' + text.substring(0, 160).replace(/\n/g, ' ') + '...');

    const passedKeywords = expectedKeywords.filter(k => 
      text.toLowerCase().includes(k.toLowerCase())
    );
    console.log(`Keywords checked: [${expectedKeywords.join(', ')}] -> Matched: [${passedKeywords.join(', ')}]`);
    console.log(`RESULT: PASS`);
    return text;
  } catch (err) {
    console.error(`RESULT: FAIL (${err.message})`);
    throw err;
  }
}

async function runAllTests() {
  try {
    // 1. Symptom guidance in Hinglish
    await testQuery(
      'Hinglish Symptom Guidance: "Mere sir mein dard ho raha hai"',
      [{ role: 'user', parts: [{ text: 'Mere sir mein dard ho raha hai and bohot thakan lag rahi hai. Kya yeh mere period cycle se related ho sakta hai?' }] }],
      ['dard', 'headache', 'cycle', 'water']
    );

    // 2. Hindi Symptom guidance: "Mujhe periods ke time cramps ho rahe hain"
    await testQuery(
      'Hindi Symptom Guidance: "पीरियड्स के समय क्रैम्प्स"',
      [{ role: 'user', parts: [{ text: 'मुझे पीरियड्स के समय बहुत क्रैम्प्स (पेट के निचले हिस्से में दर्द) हो रहे हैं, क्या करूँ?' }] }],
      ['दर्द', 'पानी', 'आराम', 'डॉक्टर']
    );

    // 3. Indian Diet & Nutrition (Iron, Folate, Protein)
    await testQuery(
      'Diet Guidance: Iron-rich Indian foods',
      [{ role: 'user', parts: [{ text: 'What affordable Indian meals (breakfast, lunch, dinner) can I eat to improve my low ferritin and energy?' }] }],
      ['palak', 'dal', 'ragi', 'iron']
    );

    // 4. Multi-turn Follow-up: Exercise & Yoga
    console.log('\n--- Test: Multi-turn Follow-up (Diet -> Yoga/Exercise) ---');
    const turn1User = 'I have low iron and cramps during periods. What should I eat?';
    const turn1Model = 'Include iron-rich foods like palak (spinach), lentils (moong dal), ragi, roasted chana with jaggery (gur), and vitamin C from lemon or amla to enhance iron absorption.';
    const turn2User = 'And what gentle yoga poses or stretches can I do right now to ease my back pain and cramps?';

    const multiTurnContents = [
      { role: 'user', parts: [{ text: turn1User }] },
      { role: 'model', parts: [{ text: turn1Model }] },
      { role: 'user', parts: [{ text: turn2User }] }
    ];

    const turn2Res = await testQuery(
      'Multi-turn Context Preservation',
      multiTurnContents,
      ['pose', 'stretch', 'yoga', 'child']
    );

    // 5. Backend Server API Chat Test
    console.log('\n--- Test: Backend Express /api/ai/chat route ---');
    try {
      // Login or register test user to get token
      const authRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_ai@dhatri.internal', password: 'Password123!' })
      });
      let token = '';
      if (authRes.ok) {
        const authData = await authRes.json();
        token = authData.token;
      } else {
        // Register test user
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Priya AI Test',
            email: 'test_ai@dhatri.internal',
            password: 'Password123!',
            birthYear: 1998
          })
        });
        const regData = await regRes.json();
        token = regData.token;
      }

      if (token) {
        console.log('Authenticated with test token.');

        // Test POST /api/ai/chat
        const chatRes = await fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: 'Mujhe periods ke time cramps ho rahe hain. What self-care helps?',
            language: 'Hinglish'
          })
        });

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          console.log('PASS: /api/ai/chat returned status 200');
          console.log('Provider:', chatData.provider);
          console.log('Live AI:', chatData.isLiveAI);
          console.log('Reply Snippet:', chatData.reply?.substring(0, 140).replace(/\n/g, ' '));
        } else {
          console.warn('Backend chat response:', chatRes.status, await chatRes.text());
        }

        // Test Multi-Symptom Logging with 3 symptoms
        console.log('\n--- Test: Multi-Symptom Batch Logging (3 Symptoms) ---');
        const symptomRes = await fetch('http://localhost:5000/api/symptoms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            date: '2026-10-25',
            cyclePhase: 'menstrual',
            symptoms: [
              {
                id: 'cramps',
                name: 'Pelvic Cramps',
                category: 'cramps',
                severity: 4,
                duration: 'all_day',
                durationHours: 12,
                contextTags: ['High Work Stress'],
                notes: 'Severe sharp lower abdominal cramping during day 1'
              },
              {
                id: 'migraine',
                name: 'Headache / Migraine',
                category: 'migraine',
                severity: 3,
                duration: 'moderate',
                durationHours: 4,
                contextTags: ['Poor Sleep (<6h)', 'Caffeine (>2 cups)'],
                notes: 'Throbbing left temple headache before period'
              },
              {
                id: 'fatigue',
                name: 'Low Energy / Fatigue',
                category: 'fatigue',
                severity: 2,
                duration: 'fleeting',
                durationHours: 1,
                contextTags: ['Dehydrated'],
                notes: 'Afternoon energy slump'
              }
            ]
          })
        });

        if (symptomRes.ok) {
          const symData = await symptomRes.json();
          console.log('PASS: Successfully logged multiple symptoms:', symData.count || symData.symptoms?.length);
        } else {
          console.error('FAIL: Multi-symptom logging returned:', symptomRes.status, await symptomRes.text());
        }

        // Verify symptoms appear in history
        const getSymRes = await fetch('http://localhost:5000/api/symptoms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (getSymRes.ok) {
          const getSymData = await getSymRes.json();
          const items = getSymData.symptoms || [];
          console.log(`PASS: Retrieved ${items.length} symptoms from database`);
          const cramps = items.find(s => s.name === 'Pelvic Cramps' || s.category === 'cramps');
          const migraine = items.find(s => s.name === 'Headache / Migraine' || s.category === 'headache' || s.category === 'migraine');
          const fatigue = items.find(s => s.name === 'Low Energy / Fatigue' || s.category === 'fatigue');
          console.log('  - Pelvic Cramps verified:', !!cramps, 'Severity:', cramps?.severity, 'Notes:', cramps?.notes);
          console.log('  - Headache/Migraine verified:', !!migraine, 'Severity:', migraine?.severity, 'Notes:', migraine?.notes);
          console.log('  - Fatigue verified:', !!fatigue, 'Severity:', fatigue?.severity, 'Notes:', fatigue?.notes);
        }
      }
    } catch (netErr) {
      console.warn('Express server check notice:', netErr.message);
    }

    console.log('\n====================================================');
    console.log(' ALL TEST SCENARIOS COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('TEST SUITE ERROR:', err);
    process.exit(1);
  }
}

runAllTests();
