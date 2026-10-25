/**
 * Targeted verification script for Health Intelligence features:
 * 1. Symptom aggregation & timeline grid (/api/symptoms/trends)
 * 2. Duplicate symptom prevention
 * 3. Clinical safety alert engine (Emergency, Consult, Monitoring tiers)
 * 4. Doctor summary SBAR dossier generation (/api/symptoms/doctor-summary)
 * 5. Historical baseline vs current window comparisons
 */
import mongoose from 'mongoose';
import { evaluateClinicalSafety, ALERT_LEVELS } from './clinicalAlerts.js';
import dotenv from 'dotenv';
dotenv.config();

async function runHealthIntelligenceTests() {
  console.log('================================================================');
  console.log('🩺 RUNNING HEALTH INTELLIGENCE & CLINICAL ALERTS VERIFICATION');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test Clinical Rules Engine in isolation
  console.log('\n--- 1. Testing Clinical Safety Engine (Tier Logic) ---');

  // Test Emergency Tier: Severe Pelvic Pain
  const emergencyLogs = [
    { date: '2026-10-25', category: 'cramps', name: 'Severe pelvic cramping', severity: 5, duration: 'all_day' },
    { date: '2026-10-24', category: 'cramps', name: 'Pelvic cramping', severity: 3, duration: 'few_hours' }
  ];
  const evalEmergency = evaluateClinicalSafety({ symptoms: emergencyLogs });
  assert(evalEmergency.hasEmergency === true, 'Emergency detected for severity 5 pelvic pain all day');
  assert(evalEmergency.emergencyCount >= 1, 'Emergency alert count >= 1');
  assert(evalEmergency.alerts[0].level === ALERT_LEVELS.EMERGENCY, 'Top priority alert is EMERGENCY tier');
  assert(evalEmergency.alerts[0].actionSummary.includes('emergency'), 'Alert instructs emergency evaluation');

  // Test Non-Suppression: Emergency alert persists even with mild other logs
  const mixedLogs = [
    { date: '2026-10-25', category: 'cramps', severity: 5, duration: 'all_day' },
    { date: '2026-10-24', category: 'mood_swings', severity: 1 },
    { date: '2026-10-23', category: 'fatigue', severity: 1 }
  ];
  const evalMixed = evaluateClinicalSafety({ symptoms: mixedLogs });
  assert(evalMixed.hasEmergency === true, 'Emergency alert is NEVER suppressed by mild average scores');

  // Test Doctor Consultation Tier: Persistent Symptoms (3+ consecutive days)
  const persistentLogs = [
    { date: '2026-10-25', category: 'headache', severity: 3 },
    { date: '2026-10-24', category: 'headache', severity: 3 },
    { date: '2026-10-23', category: 'headache', severity: 3 }
  ];
  const evalPersistent = evaluateClinicalSafety({ symptoms: persistentLogs });
  const consultAlert = evalPersistent.alerts.find(a => a.level === ALERT_LEVELS.DOCTOR_CONSULTATION);
  assert(Boolean(consultAlert), 'Doctor consultation alert triggered for 3+ consecutive days of headache');
  assert(consultAlert?.trigger.includes('headache'), 'Consultation alert trigger identifies headache');

  // Test Monitoring Tier: Mild symptoms
  const mildLogs = [
    { date: '2026-10-25', category: 'bloating', severity: 1 }
  ];
  const evalMild = evaluateClinicalSafety({ symptoms: mildLogs });
  const monitoringAlert = evalMild.alerts.find(a => a.level === ALERT_LEVELS.MONITORING);
  assert(Boolean(monitoringAlert), 'Self-care monitoring tier triggered for mild single-day bloating');

  // 2. Test End-to-End API via HTTP
  console.log('\n--- 2. Testing End-to-End API Endpoints via HTTP ---');
  const baseUrl = 'http://localhost:5000/api';

  // Register a test user
  const testEmail = `health_intel_${Date.now()}@test.dhatri.app`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sunita Rao',
      email: testEmail,
      password: 'Password123!',
      birthYear: 1996,
      biologicalSeason: 'regulating_exploring',
      isMenstruating: true
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  assert(Boolean(token), 'Registered test user successfully and obtained JWT token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test Daily Check-In
  const checkInRes = await fetch(`${baseUrl}/daily`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      date: '2026-10-25',
      sleepHours: 7.5,
      sleepQuality: 'restful',
      energyLevel: 4,
      hydrationGlasses: 8,
      nutritionScore: 4,
      mood: 'calm',
      notes: 'Feeling balanced today'
    })
  });
  const checkInData = await checkInRes.json();
  assert(checkInRes.status === 200, 'Daily check-in saved with nutrition and hydration metrics');

  // Test Symptom Logging & Duplicate Prevention
  const symRes1 = await fetch(`${baseUrl}/symptoms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      date: '2026-10-25',
      category: 'cramps',
      name: 'Pelvic cramping',
      severity: 3,
      duration: 'few_hours',
      cyclePhase: 'menstrual'
    })
  });
  assert(symRes1.status === 201, 'Symptom logged successfully');

  // Submit duplicate symptom for same user, same date, same category
  const symRes2 = await fetch(`${baseUrl}/symptoms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      date: '2026-10-25',
      category: 'cramps',
      name: 'Pelvic cramping',
      severity: 4, // updated severity
      duration: 'all_day',
      cyclePhase: 'menstrual'
    })
  });
  assert(symRes2.status === 201, 'Duplicate submission handled gracefully as upsert');

  // Query symptom list to confirm count is 1, not 2
  const symListRes = await fetch(`${baseUrl}/symptoms`, { headers });
  const symListData = await symListRes.json();
  const sameDateCramps = (symListData.symptoms || []).filter(s => s.date === '2026-10-25' && s.category === 'cramps');
  assert(sameDateCramps.length === 1, 'Duplicate entries successfully prevented: exactly 1 record exists for (date, category)');
  assert(sameDateCramps[0].severity === 4, 'Record was updated in-place with latest severity');

  // Test Trends Aggregation endpoint (/api/symptoms/trends)
  const trendsRes = await fetch(`${baseUrl}/symptoms/trends?timeRange=30d`, { headers });
  const trendsData = await trendsRes.json();
  assert(trendsRes.status === 200, 'Trends endpoint returned 200 OK');
  assert(trendsData.success === true, 'Trends response indicates success');
  assert(Array.isArray(trendsData.timeline), 'Trends includes timeline grid array');
  assert(trendsData.timeline.length === 30, 'Timeline covers 30 days for 30d range');
  assert(trendsData.daysWithData >= 1, 'Reports at least 1 day with data');
  assert(Boolean(trendsData.insights), 'Response includes metric insights (sleep, energy, nutrition, hydration)');
  assert(Array.isArray(trendsData.clinicalAlerts), 'Response includes clinical alerts array');

  // Test 7d, 90d, and custom range filters
  const trends7d = await (await fetch(`${baseUrl}/symptoms/trends?timeRange=7d`, { headers })).json();
  assert(trends7d.timeline.length === 7, '7d filter returns exactly 7-day timeline');

  const customTrends = await (await fetch(`${baseUrl}/symptoms/trends?startDate=2026-10-20&endDate=2026-10-25`, { headers })).json();
  assert(customTrends.timeline.length === 6, 'Custom date range (2026-10-20 to 2026-10-25) returns 6 days');

  // Test Doctor Summary endpoint (/api/symptoms/doctor-summary)
  const docRes = await fetch(`${baseUrl}/symptoms/doctor-summary`, { headers });
  const docData = await docRes.json();
  assert(docRes.status === 200, 'Doctor Summary endpoint returned 200 OK');
  assert(docData.success === true, 'Doctor Summary response indicates success');
  assert(Boolean(docData.dossier), 'Dossier object is present');
  assert(docData.dossier.patientInfo.name === 'Sunita Rao', 'Dossier correctly reflects authenticated patient info');
  assert(Array.isArray(docData.dossier.suggestedQuestionsForDoctor), 'Dossier includes suggested questions for consultation');
  assert(docData.dossier.legalDisclaimer.includes('does not constitute a formal diagnosis'), 'Dossier maintains proper non-diagnostic legal disclaimer');

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runHealthIntelligenceTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
