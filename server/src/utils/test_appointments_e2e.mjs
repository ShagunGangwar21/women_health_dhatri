import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dhatri_local_development_jwt_secret_token_2026_recHERsion';
const API_BASE = 'http://localhost:5000/api';

async function run() {
  console.log('--- STARTING DHATRI APPOINTMENT E2E VERIFICATION ---');

  // 1. Connect to MongoDB to verify real database state
  await mongoose.connect('mongodb://127.0.0.1:27017/dhatri');
  console.log('✓ Connected to MongoDB at 127.0.0.1:27017/dhatri');
  const appointmentCollection = mongoose.connection.db.collection('appointments');
  const userCollection = mongoose.connection.db.collection('users');

  // Create two real test users in MongoDB
  const userA_id = 'test_user_a_' + Date.now();
  const userB_id = 'test_user_b_' + Date.now();

  await userCollection.insertOne({
    _id: userA_id,
    name: 'Test User A',
    email: `${userA_id}@test.dhatri.app`,
    password: 'hashed_test_password',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await userCollection.insertOne({
    _id: userB_id,
    name: 'Test User B',
    email: `${userB_id}@test.dhatri.app`,
    password: 'hashed_test_password',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const tokenA = jwt.sign({ id: userA_id, email: `${userA_id}@test.dhatri.app` }, JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ id: userB_id, email: `${userB_id}@test.dhatri.app` }, JWT_SECRET, { expiresIn: '1h' });

  // Test 1: Missing / Invalid fields validation
  console.log('\n[Test 1] Testing Validation & Rejection of Invalid Submissions...');
  
  // 1a: Missing provider name
  let res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ specialty: 'Endocrinology', date: '2026-11-20', time: '10:00 AM', reason: 'Test' })
  });
  let data = await res.json();
  console.log('1a. Missing provider name:', res.status === 400, data.message);
  if (res.status !== 400) throw new Error('Expected 400 for missing providerName');

  // 1b: Past date
  res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ providerName: 'Dr. Test', specialty: 'Endocrinology', date: '2020-01-01', time: '10:00 AM', reason: 'Test' })
  });
  data = await res.json();
  console.log('1b. Past date rejection:', res.status === 400, data.message);
  if (res.status !== 400) throw new Error('Expected 400 for past date');

  // 1c: Missing reason
  res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ providerName: 'Dr. Test', specialty: 'Endocrinology', date: '2026-11-20', time: '10:00 AM' })
  });
  data = await res.json();
  console.log('1c. Missing reason rejection:', res.status === 400, data.message);
  if (res.status !== 400) throw new Error('Expected 400 for missing reason');

  // Test 2: Successful Booking
  console.log('\n[Test 2] Booking valid appointment for User A...');
  const futureDate = '2026-11-15';
  res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      providerName: 'Dr. Ananya Roy, MD',
      specialty: 'Reproductive Endocrinology & Endometriosis',
      date: futureDate,
      time: '10:00 AM',
      visitReason: 'Investigate low ferritin and cycle fatigue correlation'
    })
  });
  data = await res.json();
  console.log('2a. Booking response status:', res.status, data.success, data.message);
  if (res.status !== 201 || !data.appointment) throw new Error('Failed to create appointment');
  const appointmentId = data.appointment._id;
  console.log('2b. Created Appointment ID:', appointmentId);

  // Test 3: Verify directly in MongoDB
  console.log('\n[Test 3] Verifying document directly in MongoDB...');
  const docInDb = await appointmentCollection.findOne({ _id: appointmentId });
  console.log('3a. Found in MongoDB:', !!docInDb);
  console.log('3b. MongoDB status:', docInDb.status);
  console.log('3c. MongoDB providerName:', docInDb.providerName);
  console.log('3d. MongoDB userId matches User A:', docInDb.userId === userA_id);
  if (!docInDb || docInDb.status !== 'upcoming' || docInDb.userId !== userA_id) {
    throw new Error('MongoDB document verification failed');
  }

  // Test 4: Retrieve appointments for User A
  console.log('\n[Test 4] Querying User A appointments via GET /api/appointments...');
  res = await fetch(`${API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  const foundInUserA = data.appointments.some(a => a._id === appointmentId);
  console.log('4a. User A sees created appointment:', foundInUserA);
  if (!foundInUserA) throw new Error('User A could not retrieve created appointment');

  // Test 5: Multi-user isolation — User B cannot see User A's appointment
  console.log('\n[Test 5] Multi-user Isolation: Querying User B appointments...');
  res = await fetch(`${API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  const foundInUserB = data.appointments.some(a => a._id === appointmentId);
  console.log('5a. User B sees User A appointment (should be false):', foundInUserB);
  if (foundInUserB) throw new Error('Multi-user isolation breached: User B saw User A appointment!');

  // Test 6: Multi-user isolation — User B cannot cancel User A's appointment
  console.log('\n[Test 6] Multi-user Isolation: User B attempts to cancel User A appointment...');
  res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log('6a. User B cancellation response status:', res.status, data.message);
  if (res.status !== 404) throw new Error('Expected 404 when User B tries to cancel User A appointment');

  // Verify document is still upcoming in MongoDB
  const docAfterUnauthorized = await appointmentCollection.findOne({ _id: appointmentId });
  if (docAfterUnauthorized.status !== 'upcoming') throw new Error('Unauthorized cancel modified document!');
  console.log('6b. Document status in MongoDB remains:', docAfterUnauthorized.status);

  // Test 7: Authorized cancellation by User A
  console.log('\n[Test 7] User A cancels their own appointment...');
  res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log('7a. User A cancellation response status:', res.status, data.success, data.message);
  if (res.status !== 200 || !data.success) throw new Error('User A cancellation failed');

  // Test 8: Verify cancellation in MongoDB
  console.log('\n[Test 8] Verifying updated document in MongoDB...');
  const docCancelled = await appointmentCollection.findOne({ _id: appointmentId });
  console.log('8a. Document still exists in MongoDB (not deleted):', !!docCancelled);
  console.log('8b. Document status in MongoDB:', docCancelled.status);
  if (!docCancelled || docCancelled.status !== 'cancelled') {
    throw new Error('Appointment was not updated to status: cancelled in MongoDB');
  }

  // Test 9: Prevent repeated cancellation
  console.log('\n[Test 9] User A attempts repeated cancellation of already-cancelled appointment...');
  res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log('9a. Repeated cancellation status:', res.status, data.message);
  if (res.status !== 400) throw new Error('Expected 400 for repeated cancellation');

  // Test 10: Unauthenticated access rejection
  console.log('\n[Test 10] Testing unauthenticated access rejection...');
  res = await fetch(`${API_BASE}/appointments`);
  console.log('10a. Unauthenticated GET status:', res.status);
  if (res.status !== 401) throw new Error('Expected 401 for unauthenticated request');

  // Cleanup test users and appointments created during test
  await appointmentCollection.deleteMany({ userId: { $in: [userA_id, userB_id] } });
  await userCollection.deleteMany({ _id: { $in: [userA_id, userB_id] } });
  console.log('✓ Cleaned up test data.');

  console.log('\n======================================================');
  console.log('✓ ALL 10 APPOINTMENT BACKEND & MONGODB TESTS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('TEST SUITE FAILED:', err);
  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});
