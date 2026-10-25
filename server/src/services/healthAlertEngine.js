/**
 * Dhātri — Personalized Health Monitoring & Alert Engine
 * 
 * Analyzes longitudinal multi-entry data across:
 * - Diagnostic laboratory reports & reference ranges
 * - Persistent or worsening symptoms
 * - Menstrual cycle rhythm and variation
 * - Daily wellness (sleep, energy, hydration)
 * 
 * Strict Medical Safety:
 * - Never diagnoses diseases or prescribes medication.
 * - Compares lab values strictly to supplied reference ranges.
 * - Clearly links observations to underlying records with dates.
 */
import { evaluateClinicalSafety, ALERT_LEVELS } from '../utils/clinicalAlerts.js';

export function generateHealthAlerts({ symptoms = [], reports = [], cycles = [], daily = [], user = {}, dismissedAlertIds = [] }) {
  const alerts = [];

  const cleanSymptoms = symptoms.map(s => (s.toObject ? s.toObject() : { ...s }));
  const cleanReports = reports.map(r => (r.toObject ? r.toObject() : { ...r }));
  const cleanCycles = cycles.map(c => (c.toObject ? c.toObject() : { ...c }));
  const cleanDaily = daily.map(d => (d.toObject ? d.toObject() : { ...d }));

  // Evaluate Clinical Safety Rules Engine (Emergency, Doctor Consultation, Self-Care Monitoring)
  const clinicalSafetyResult = evaluateClinicalSafety({
    symptoms: cleanSymptoms,
    daily: cleanDaily,
    cycles: cleanCycles,
    reports: cleanReports,
    user
  });

  // Inject clinical safety alerts with priority
  clinicalSafetyResult.alerts.forEach(clinAlert => {
    alerts.push({
      id: clinAlert.id,
      category: clinAlert.level === ALERT_LEVELS.EMERGENCY ? 'emergency_alert' : 'clinical_alert',
      guidanceLevel: clinAlert.level,
      severity: clinAlert.level === ALERT_LEVELS.EMERGENCY ? 'emergency' : clinAlert.level === ALERT_LEVELS.DOCTOR_CONSULTATION ? 'elevated' : 'moderate',
      title: clinAlert.badgeLabel,
      summary: clinAlert.trigger,
      diffFromBaseline: clinAlert.diffFromBaseline,
      actionSummary: clinAlert.actionSummary,
      urgentCareCriteria: clinAlert.urgentCareCriteria,
      recommendation: clinAlert.recommendation,
      disclaimer: clinAlert.disclaimer,
      isDismissed: clinAlert.level === ALERT_LEVELS.EMERGENCY ? false : dismissedAlertIds.includes(clinAlert.id),
      createdAt: new Date().toISOString().split('T')[0]
    });
  });

  // =========================================================================
  // 1. BIOMARKER & LABORATORY ANALYSIS
  // =========================================================================
  const allBiomarkers = [];
  cleanReports.forEach(report => {
    if (report.biomarkers && Array.isArray(report.biomarkers)) {
      report.biomarkers.forEach(b => {
        const bio = b.toObject ? b.toObject() : { ...b };
        allBiomarkers.push({
          ...bio,
          reportTitle: report.title,
          reportDate: report.date,
          labName: report.labName || 'Diagnostic Laboratory'
        });
      });
    }
  });

  // Check Serum Ferritin trajectory
  const ferritinEntries = allBiomarkers
    .filter(b => b.name && b.name.toLowerCase().includes('ferritin'))
    .sort((a, b) => new Date(a.reportDate) - new Date(b.reportDate));

  if (ferritinEntries.length > 0) {
    const latest = ferritinEntries[ferritinEntries.length - 1];
    const previous = ferritinEntries.length > 1 ? ferritinEntries[0] : null;

    if (latest.value !== undefined && latest.value < 30) {
      const isDownwardDrift = previous && previous.value > latest.value;
      
      const evidence = [
        {
          label: `${latest.reportTitle} (${latest.reportDate})`,
          value: `${latest.value} ${latest.unit || 'ng/mL'}`,
          refRange: latest.referenceRange || '12 - 150 ng/mL',
          status: latest.value < 15 ? 'Low' : 'Low-Normal Margin'
        }
      ];

      if (previous && isDownwardDrift) {
        evidence.unshift({
          label: `${previous.reportTitle} (${previous.reportDate})`,
          value: `${previous.value} ${previous.unit || 'ng/mL'}`,
          refRange: previous.referenceRange || '12 - 150 ng/mL',
          status: 'Baseline'
        });
      }

      alerts.push({
        id: 'alert_ferritin_depletion',
        category: 'biomarker_alert',
        severity: latest.value < 15 ? 'elevated' : 'moderate',
        title: isDownwardDrift
          ? `Serum Ferritin Depletion Trend (${previous.value} → ${latest.value} ${latest.unit || 'ng/mL'})`
          : `Serum Ferritin Below Optimal Vitality Baseline (${latest.value} ${latest.unit || 'ng/mL'})`,
        summary: isDownwardDrift
          ? `Your Serum Ferritin recorded at ${latest.value} ${latest.unit || 'ng/mL'} on ${latest.reportDate}, showing a downward trajectory from ${previous.value} ${previous.unit || 'ng/mL'} in your previous test. While ${latest.value} ${latest.unit || 'ng/mL'} may fall within broad statistical lab reference ranges (${latest.referenceRange || '12–150 ng/mL'}), clinical women's health literature notes that values under 30–50 ng/mL frequently correlate with persistent luteal fatigue, brain fog, and heavy menses.`
          : `Your recent lab recorded Serum Ferritin at ${latest.value} ${latest.unit || 'ng/mL'} (reference range: ${latest.referenceRange || '12–150 ng/mL'}). Cellular vitality and hair density are often optimized when ferritin is above 40–50 ng/mL.`,
        evidence,
        recommendation: 'Consider discussing a Complete Iron Panel (Total Iron, TIBC, and Transferrin Saturation) with your physician. Prepare targeted questions via your 3-Minute Doctor Dossier.',
        disclaimer: 'This observation highlights a physiological trend and does not constitute a clinical diagnosis of anemia. Consult a qualified physician.',
        isDismissed: dismissedAlertIds.includes('alert_ferritin_depletion'),
        createdAt: latest.reportDate
      });
    }
  }

  // Check Vitamin D3 Insufficiency
  const vitDEntries = allBiomarkers
    .filter(b => b.name && (b.name.toLowerCase().includes('vitamin d') || b.name.toLowerCase().includes('25-oh')))
    .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

  if (vitDEntries.length > 0) {
    const latestVitD = vitDEntries[0];
    if (latestVitD.value !== undefined && latestVitD.value < 30) {
      alerts.push({
        id: 'alert_vitd_insufficiency',
        category: 'biomarker_alert',
        severity: latestVitD.value < 20 ? 'moderate' : 'info',
        title: `Vitamin D3 Insufficiency (${latestVitD.value} ${latestVitD.unit || 'ng/mL'})`,
        summary: `Your test on ${latestVitD.reportDate} recorded 25-OH Vitamin D3 at ${latestVitD.value} ${latestVitD.unit || 'ng/mL'} (reference range: ${latestVitD.referenceRange || '30–100 ng/mL'}). Mild insufficiency is common in indoor routines and can influence immune balance and cyclical muscle recovery.`,
        evidence: [
          {
            label: `${latestVitD.reportTitle} (${latestVitD.reportDate})`,
            value: `${latestVitD.value} ${latestVitD.unit || 'ng/mL'}`,
            refRange: latestVitD.referenceRange || '30 - 100 ng/mL',
            status: latestVitD.value < 20 ? 'Deficient' : 'Insufficiency'
          }
        ],
        recommendation: 'Discuss safe sun exposure and whether medical Vitamin D3 supplementation is suitable with your doctor.',
        disclaimer: 'Laboratory reference ranges vary slightly across diagnostic providers. Review with your healthcare practitioner.',
        isDismissed: dismissedAlertIds.includes('alert_vitd_insufficiency'),
        createdAt: latestVitD.reportDate
      });
    }
  }

  // Check TSH (Thyroid) Out of Optimal Range
  const tshEntries = allBiomarkers
    .filter(b => b.name && b.name.toLowerCase().includes('tsh'))
    .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

  if (tshEntries.length > 0) {
    const latestTSH = tshEntries[0];
    if (latestTSH.value !== undefined && (latestTSH.value > 4.2 || latestTSH.value < 0.4)) {
      alerts.push({
        id: 'alert_tsh_anomaly',
        category: 'biomarker_alert',
        severity: 'moderate',
        title: `TSH Result Outside Standard Reference Range (${latestTSH.value} ${latestTSH.unit || 'mIU/L'})`,
        summary: `Your Thyroid Stimulating Hormone (TSH) was measured at ${latestTSH.value} ${latestTSH.unit || 'mIU/L'} (reference range: ${latestTSH.referenceRange || '0.4–4.2 mIU/L'}). TSH helps regulate metabolic rate, energy, and cycle regularity.`,
        evidence: [
          {
            label: `${latestTSH.reportTitle} (${latestTSH.reportDate})`,
            value: `${latestTSH.value} ${latestTSH.unit || 'mIU/L'}`,
            refRange: latestTSH.referenceRange || '0.4 - 4.2 mIU/L',
            status: latestTSH.value > 4.2 ? 'Elevated' : 'Suppressed'
          }
        ],
        recommendation: 'Consider consulting an endocrinologist or primary physician for complete Free T3, Free T4, and antibody evaluation.',
        disclaimer: 'Isolated TSH fluctuations can be transient. A repeat sample is routinely recommended before drawing conclusions.',
        isDismissed: dismissedAlertIds.includes('alert_tsh_anomaly'),
        createdAt: latestTSH.reportDate
      });
    }
  }

  // =========================================================================
  // 2. PERSISTENT & WORSENING SYMPTOMS ANALYSIS
  // =========================================================================
  // Group symptoms by category/name
  const symptomGroups = {};
  cleanSymptoms.forEach(sym => {
    const key = (sym.category || sym.name || 'general').toLowerCase();
    if (!symptomGroups[key]) symptomGroups[key] = [];
    symptomGroups[key].push(sym);
  });

  // Fatigue Analysis
  const fatigueLogs = (symptomGroups['fatigue'] || []).concat(
    cleanSymptoms.filter(s => (s.name && s.name.toLowerCase().includes('fatigue')) || (s.notes && s.notes.toLowerCase().includes('fatigue')))
  );
  // Deduplicate by date
  const uniqueFatigueDates = [...new Map(fatigueLogs.map(item => [item.date, item])).values()];

  if (uniqueFatigueDates.length >= 2) {
    const recentFatigues = uniqueFatigueDates.slice(-4);
    const avgSeverity = +(recentFatigues.reduce((acc, s) => acc + (s.severity || 3), 0) / recentFatigues.length).toFixed(1);

    alerts.push({
      id: 'alert_persistent_fatigue',
      category: 'symptom_trend',
      severity: avgSeverity >= 4 ? 'elevated' : 'moderate',
      title: `Persistent Fatigue Pattern (${uniqueFatigueDates.length} entries recorded)`,
      summary: `We noticed that fatigue has been reported repeatedly across your recent entries (average severity: ${avgSeverity}/5). Persistent fatigue can stem from multiple interacting factors—including subclinical ferritin depletion, late-luteal progesterone drop, or chronic sleep debt.`,
      evidence: recentFatigues.map(s => ({
        label: `Symptom Log (${s.date})`,
        value: `Severity ${s.severity}/5`,
        refRange: s.cyclePhaseAtLog ? `Phase: ${s.cyclePhaseAtLog}` : 'Recorded Signal',
        status: s.notes ? `"${s.notes}"` : 'Fatigue reported'
      })),
      recommendation: 'Track if fatigue worsens specifically in your late luteal phase or after heavy menses. Bring these observations to your next doctor visit.',
      disclaimer: 'This pattern observation does not establish a diagnosis. Persistent fatigue should be evaluated by a healthcare professional.',
      isDismissed: dismissedAlertIds.includes('alert_persistent_fatigue'),
      createdAt: recentFatigues[recentFatigues.length - 1]?.date || new Date().toISOString().split('T')[0]
    });
  }

  // Severe Pelvic Cramps
  const crampLogs = cleanSymptoms.filter(s => {
    const cat = (s.category || s.name || '').toLowerCase();
    return cat.includes('cramp') || cat.includes('pelvic');
  });

  const severeCramps = crampLogs.filter(s => (s.severity || 0) >= 4);
  if (severeCramps.length > 0) {
    alerts.push({
      id: 'alert_severe_pelvic_cramps',
      category: 'symptom_trend',
      severity: 'elevated',
      title: `High-Severity Pelvic Pain Signal (${severeCramps.length} high-severity entries)`,
      summary: `You have logged pelvic cramps with high severity (score 4–5/5). While menstrual discomfort is common, pain that limits routine tasks or requires escalating analgesics warrants clinical evaluation to differentiate primary dysmenorrhea from underlying conditions like endometriosis.`,
      evidence: severeCramps.map(s => ({
        label: `Recorded on ${s.date}`,
        value: `Severity ${s.severity}/5`,
        refRange: s.duration ? `Duration: ${s.duration}` : 'Noticeable',
        status: s.notes ? `"${s.notes}"` : 'Disruptive pain'
      })),
      recommendation: 'Schedule a consultation with a gynecologist. Note whether pain occurs outside of menstrual bleed days.',
      disclaimer: 'Sudden, excruciating, or acute unilateral pelvic pain requires emergency medical evaluation.',
      isDismissed: dismissedAlertIds.includes('alert_severe_pelvic_cramps'),
      createdAt: severeCramps[0]?.date || new Date().toISOString().split('T')[0]
    });
  }

  // =========================================================================
  // 3. MENSTRUAL CYCLE RHYTHM & VARIATION
  // =========================================================================
  if (cleanCycles.length >= 2) {
    const sortedCycles = [...cleanCycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const cycleLengths = [];
    for (let i = 1; i < sortedCycles.length; i++) {
      const diffDays = Math.round((new Date(sortedCycles[i].startDate) - new Date(sortedCycles[i - 1].startDate)) / (1000 * 60 * 60 * 24));
      if (diffDays >= 18 && diffDays <= 70) {
        cycleLengths.push(diffDays);
      }
    }

    if (cycleLengths.length >= 2) {
      const minLen = Math.min(...cycleLengths);
      const maxLen = Math.max(...cycleLengths);
      const variation = maxLen - minLen;

      if (variation > 7) {
        alerts.push({
          id: 'alert_cycle_variation',
          category: 'cycle_anomaly',
          severity: 'info',
          title: `Cycle Rhythm Variation Observed (${variation}-day variance)`,
          summary: `Your logged cycle lengths vary between ${minLen} and ${maxLen} days across recent cycles. A cycle length variation exceeding 7 days across cycles can reflect ovulatory fluctuations, lifestyle shifts, travel, or hormonal regulation.`,
          evidence: sortedCycles.map((c, idx) => ({
            label: `Cycle #${idx + 1} (${c.startDate})`,
            value: `Flow: ${c.flowIntensity || 'medium'}`,
            refRange: `Pain: ${c.painLevel || 0}/10`,
            status: c.notes || 'Recorded'
          })),
          recommendation: 'Continue tracking start and end dates. If cycle irregularity persists for 3+ consecutive cycles, discuss with an OB/GYN.',
          disclaimer: 'Natural biological variation is normal and occurs during times of stress, illness, or hormonal maturation.',
          isDismissed: dismissedAlertIds.includes('alert_cycle_variation'),
          createdAt: sortedCycles[sortedCycles.length - 1]?.startDate
        });
      }
    }
  }

  // =========================================================================
  // 4. DAILY WELLNESS & RECOVERY DEFICIT
  // =========================================================================
  if (cleanDaily.length >= 3) {
    const recentDaily = [...cleanDaily].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
    const avgSleep = +(recentDaily.reduce((acc, d) => acc + (d.sleepHours || 7), 0) / recentDaily.length).toFixed(1);
    const avgHydration = +(recentDaily.reduce((acc, d) => acc + (d.hydrationGlasses || 6), 0) / recentDaily.length).toFixed(1);

    if (avgSleep < 6.5) {
      alerts.push({
        id: 'alert_sleep_deficit',
        category: 'lifestyle_trend',
        severity: 'info',
        title: `Cumulative Sleep Debt Signal (Avg: ${avgSleep} hrs/night)`,
        summary: `Your sleep across the last ${recentDaily.length} logged check-ins has averaged ${avgSleep} hours. Clinical research indicates that sleep under 6.5 hours elevates systemic inflammation markers and intensifies late-luteal cramp and headache sensitivity.`,
        evidence: recentDaily.map(d => ({
          label: d.date,
          value: `${d.sleepHours} hrs`,
          refRange: 'Optimal: 7.5 - 9 hrs',
          status: `Energy: ${d.energyLevel}/5`
        })),
        recommendation: 'Prioritize a 30-minute screen-free wind down before bed. Consider adding the 7.5h restorative sleep goal in My Goals.',
        disclaimer: 'Sleep tracking reflects self-reported duration and is intended for wellness awareness.',
        isDismissed: dismissedAlertIds.includes('alert_sleep_deficit'),
        createdAt: recentDaily[0]?.date
      });
    }
  }

  return alerts;
}
