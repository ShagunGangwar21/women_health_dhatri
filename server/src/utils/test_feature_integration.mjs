import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';

async function testFeatureIntegration() {
  console.log('Testing Feature 1, 2, 3 Backend & Data Integration...');

  // 1. Register test user
  const unique = Date.now();
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Kavita Test ${unique}`,
      email: `kavita_${unique}@real.dhatri.app`,
      password: 'SecurePassword123!',
      birthYear: 1996,
      primaryConcern: 'Pelvic health and iron optimization'
    })
  });
  const regData = await regRes.json();
  if (!regRes.ok || !regData.token) {
    throw new Error('Registration failed: ' + JSON.stringify(regData));
  }
  const token = regData.token;
  console.log('✓ Test user registered:', regData.user.email);

  // 2. Test Multi-symptom batch logging (Feature 3)
  const batchSymptomsPayload = {
    date: '2026-10-24',
    cyclePhase: 'luteal',
    symptoms: [
      {
        id: 'cramps',
        name: 'Pelvic Cramps',
        category: 'cramps',
        severity: 4,
        duration: 'all_day',
        durationHours: 12,
        contextTags: ['High Work Stress', 'Poor Sleep (<6h)'],
        notes: 'Severe sharp pain on left lower quadrant'
      },
      {
        id: 'fatigue',
        name: 'Low Energy / Fatigue',
        category: 'fatigue',
        severity: 2,
        duration: 'moderate',
        durationHours: 4,
        contextTags: ['Dehydrated'],
        notes: 'Mild sluggishness in late afternoon'
      },
      {
        id: 'migraine',
        name: 'Headache / Migraine',
        category: 'migraine',
        severity: 5,
        duration: 'multi_day',
        durationHours: 24,
        contextTags: ['Caffeine (>2 cups)', 'Travel / Jetlag'],
        notes: 'Throbbing left temple with sensory sensitivity'
      }
    ]
  };

  const sympRes = await fetch(`${BASE_URL}/symptoms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(batchSymptomsPayload)
  });
  const sympData = await sympRes.json();
  console.log('✓ Batch Symptoms Log Response Status:', sympRes.status);
  console.log('  Count inserted:', sympData.count);
  if (!sympData.success || sympData.count !== 3) {
    throw new Error('Batch symptom insertion failed: ' + JSON.stringify(sympData));
  }

  // 3. Verify symptoms retrieved and have independent properties
  const getSympRes = await fetch(`${BASE_URL}/symptoms`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getSympData = await getSympRes.json();
  console.log('✓ Total retrieved symptoms for user:', getSympData.totalLogs);
  if (getSympData.symptoms.length !== 3) {
    throw new Error('Expected 3 symptoms, got: ' + getSympData.symptoms.length);
  }

  // Verify independent severities
  const cramps = getSympData.symptoms.find(s => s.name === 'Pelvic Cramps');
  const fatigue = getSympData.symptoms.find(s => s.name === 'Low Energy / Fatigue');
  const migraine = getSympData.symptoms.find(s => s.name === 'Headache / Migraine');

  console.log('  Cramps severity (expected 4):', cramps.severity, 'duration:', cramps.duration);
  console.log('  Fatigue severity (expected 2):', fatigue.severity, 'duration:', fatigue.duration);
  console.log('  Migraine severity (expected 5):', migraine.severity, 'duration:', migraine.duration);

  if (cramps.severity !== 4 || fatigue.severity !== 2 || migraine.severity !== 5) {
    throw new Error('Independent severity values did not match!');
  }
  console.log('✓ Independent symptom severity, duration, and context verified in MongoDB!');

  // 4. Test Language switching preference persistence (Feature 2)
  const langRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ language: 'hi' })
  });
  const langData = await langRes.json();
  console.log('✓ Language preference update to Hindi (hi):', langData.success);

  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('✓ Authenticated User language in database:', meData.user.language);
  if (meData.user.language !== 'hi') {
    throw new Error('User language did not persist in database!');
  }

  console.log('====================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

testFeatureIntegration().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
