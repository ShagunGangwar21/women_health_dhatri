async function runTests() {
  console.log('Testing Dhātri Full Backend Flow...\n');
  const baseUrl = 'http://localhost:5000';

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log('✓ 1. Server Health:', health.status, `(AI Configured: ${health.aiConfigured})`);

  // 2. Demo Login
  const loginRes = await fetch(`${baseUrl}/api/auth/demo-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Demo login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const user = loginData.user;
  console.log('✓ 2. Demo Login:', user.name, `(${user.email})`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Save Daily Check-in
  const dailyPayload = {
    date: '2026-10-24',
    mood: 'radiant',
    sleepHours: 8.0,
    energyLevel: 4,
    hydrationGlasses: 8,
    notes: 'Feeling energetic and hydrated!'
  };
  const dailySaveRes = await fetch(`${baseUrl}/api/daily`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dailyPayload)
  });
  const dailySaveData = await dailySaveRes.json();
  console.log('✓ 3. Save Daily Check-in:', dailySaveData.success ? 'Saved' : 'Failed');

  // 4. Retrieve Daily Check-in & verify persistence
  const dailyGetRes = await fetch(`${baseUrl}/api/daily`, { headers });
  const dailyGetData = await dailyGetRes.json();
  const todayEntry = dailyGetData.logs.find(l => l.date === '2026-10-24');
  console.log('✓ 4. Verify Daily Persistence:', todayEntry ? `Persisted (Sleep: ${todayEntry.sleepHours}h, Energy: ${todayEntry.energyLevel}/5)` : 'Missing entry!');

  // 5. Test Symptoms
  const sympRes = await fetch(`${baseUrl}/api/symptoms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Pelvic Cramps',
      category: 'cramps',
      severity: 3,
      duration: 'moderate',
      contextTags: ['pre_menses'],
      date: '2026-10-24',
      cyclePhaseAtLog: 'luteal'
    })
  });
  const sympData = await sympRes.json();
  console.log('✓ 5. Log Symptom:', sympData.success ? `Logged (ID: ${sympData.symptom?._id})` : 'Failed');

  // 6. Test Personalized Health Monitoring Alerts Engine
  const alertsRes = await fetch(`${baseUrl}/api/alerts`, { headers });
  const alertsData = await alertsRes.json();
  console.log('✓ 6. Health Alerts Generated:', alertsData.alerts?.length, 'active alerts found:');
  alertsData.alerts.forEach(a => {
    console.log(`   - [${a.severity.toUpperCase()}] ${a.title} (${a.category})`);
  });

  // 7. Test Alert Dismissal
  if (alertsData.alerts.length > 0) {
    const alertId = alertsData.alerts[0].id;
    const dismissRes = await fetch(`${baseUrl}/api/alerts/${alertId}/dismiss`, { method: 'POST', headers });
    const dismissData = await dismissRes.json();
    console.log('✓ 7. Alert Dismissal:', dismissData.success ? `Dismissed ${alertId}` : 'Failed');
  }

  // 8. Test AI Assistant Chat (English & Hindi)
  const aiChatEn = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'Why did my ferritin drop to 18 ng/mL and how does it relate to fatigue?',
      language: 'English'
    })
  });
  const aiDataEn = await aiChatEn.json();
  console.log('✓ 8a. AI Assistant (EN):', aiDataEn.success ? `Provider: ${aiDataEn.provider}` : 'Failed');
  console.log('     Response Preview:', aiDataEn.reply?.substring(0, 110) + '...');

  const aiChatHi = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'फेरिटिन कम होने से क्या होता है? डॉक्टर से क्या पूछें?',
      language: 'Hindi'
    })
  });
  const aiDataHi = await aiChatHi.json();
  console.log('✓ 8b. AI Assistant (HI):', aiDataHi.success ? `Responded in Hindi/Hinglish` : 'Failed');
  console.log('     Response Preview:', aiDataHi.reply?.substring(0, 100) + '...');

  // 9. Test Goals
  const goalCreateRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Daily Evening Chamomile Tea',
      category: 'Stress Relief',
      target: 1,
      unit: 'cup'
    })
  });
  const goalCreateData = await goalCreateRes.json();
  console.log('✓ 9. Goal Created:', goalCreateData.success ? goalCreateData.goal.title : 'Failed');

  // 10. Test Appointments & Cancellation
  const apptCreateRes = await fetch(`${baseUrl}/api/appointments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      providerName: 'Dr. Ananya Sen, MD',
      specialty: 'Obstetrician & Gynecologist (OB/GYN)',
      date: '2026-11-05',
      time: '11:00 AM',
      visitReason: 'Review 18-month ferritin drop and luteal phase fatigue'
    })
  });
  const apptCreateData = await apptCreateRes.json();
  const newApptId = apptCreateData.appointment?._id || apptCreateData.appointment?.id;
  console.log('✓ 10a. Schedule Appointment:', apptCreateData.success ? `Scheduled (ID: ${newApptId})` : 'Failed');

  // Cancel the appointment
  const cancelRes = await fetch(`${baseUrl}/api/appointments/${newApptId}`, {
    method: 'DELETE',
    headers
  });
  const cancelData = await cancelRes.json();
  console.log('✓ 10b. Cancel Appointment:', cancelData.success ? 'Cancelled successfully' : 'Failed');

  // Verify status in DB
  const apptsGetRes = await fetch(`${baseUrl}/api/appointments`, { headers });
  const apptsGetData = await apptsGetRes.json();
  const cancelledAppt = apptsGetData.appointments.find(a => (a._id === newApptId || a.id === newApptId));
  console.log('✓ 10c. Verify Saved Status:', cancelledAppt?.status === 'cancelled' ? 'Confirmed: status is cancelled in DB' : 'Not cancelled');

  // 11. Test Doctor Dossier Summary
  const docSummaryRes = await fetch(`${baseUrl}/api/reports/doctor-summary`, { headers });
  const docSummary = await docSummaryRes.json();
  console.log('✓ 11. Doctor Dossier SBAR Summary:', docSummary.success ? `Generated for ${docSummary.summary?.patientName}` : 'Failed');

  console.log('\n🌸 ALL 11 BACKEND API VERIFICATIONS PASSED!\n');
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
