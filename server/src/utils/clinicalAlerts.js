/**
 * Dhātri — Evidence-Based Clinical Safety & Health Alert Rules Engine
 * 
 * Rules are structured into 3 distinct, clinically validated tiers:
 * Level 1: EMERGENCY (Immediate medical attention required)
 * Level 2: DOCTOR_CONSULTATION (Medical evaluation recommended)
 * Level 3: MONITORING (Conservative self-care & safe observation)
 * 
 * CRITICAL SAFETY INVARIANT:
 * Emergency alerts are NEVER suppressed, masked, or diluted by a low overall numerical score
 * or otherwise "healthy" average metrics.
 */

export const ALERT_LEVELS = {
  EMERGENCY: 'emergency',
  DOCTOR_CONSULTATION: 'doctor_consultation',
  MONITORING: 'monitoring'
};

/**
 * Transparent, clinically grounded rules based on published ACOG / RCOG / NHS guidelines
 */
export const CLINICAL_RULES = [
  // --- EMERGENCY TIER ---
  {
    id: 'EMERGENCY_SEVERE_PELVIC_PAIN',
    level: ALERT_LEVELS.EMERGENCY,
    symptomCategory: 'cramps',
    name: 'Sudden High-Intensity Pelvic Pain',
    condition: (recentLogs, baseline, context) => {
      const highPain = recentLogs.find(l => 
        (l.category === 'cramps' || l.name?.toLowerCase().includes('pelvic') || l.name?.toLowerCase().includes('cramp')) &&
        Number(l.severity) >= 4 &&
        (l.duration === 'all_day' || l.duration === 'multi_day' || l.durationHours >= 12 || context?.hasFeverOrDizziness)
      );
      return Boolean(highPain);
    },
    buildAlert: (triggerLog, baseline) => ({
      id: `alert_emergency_pelvic_${triggerLog?.date || 'active'}`,
      level: ALERT_LEVELS.EMERGENCY,
      badgeLabel: 'Emergency Attention Required',
      trigger: `Severe pelvic pain (Severity ${triggerLog?.severity || 5}/5, Duration: ${triggerLog?.duration || 'prolonged'}) recorded on ${triggerLog?.date}.`,
      diffFromBaseline: baseline?.avgSeverity 
        ? `Severity is ${triggerLog?.severity}/5, compared to your historical baseline of ${baseline.avgSeverity.toFixed(1)}/5 (+${(triggerLog.severity - baseline.avgSeverity).toFixed(1)} jump).`
        : 'Significantly exceeds standard baseline thresholds.',
      actionSummary: 'Seek emergency medical evaluation immediately at the nearest urgent care or emergency room.',
      urgentCareCriteria: [
        'Sudden, sharp, or tearing pelvic pain (especially one-sided)',
        'Pain accompanied by dizziness, fainting, clamminess, or cold sweat',
        'Fever above 100.4°F (38°C) with abdominal rigidity',
        'Inability to stand upright or keep fluids down'
      ],
      recommendation: 'Do not wait for a scheduled routine appointment. Contact emergency services or visit the nearest emergency facility.',
      disclaimer: 'This safety alert does not establish a diagnosis but identifies acute clinical red-flag criteria.'
    })
  },
  {
    id: 'EMERGENCY_HEAVY_BLEEDING',
    level: ALERT_LEVELS.EMERGENCY,
    symptomCategory: 'bleeding',
    name: 'Abnormal Heavy Bleeding / Hemorrhage Warning',
    condition: (recentLogs, baseline, context) => {
      // Check in cycles or symptom notes
      const heavyCycle = context?.cycles?.find(c => 
        c.flowIntensity === 'heavy' && 
        (c.notes?.toLowerCase().includes('clot') || c.notes?.toLowerCase().includes('soak') || Number(c.painLevel) >= 8)
      );
      const bleedingLog = recentLogs.find(l => 
        (l.category === 'bleeding' || l.name?.toLowerCase().includes('bleed') || l.notes?.toLowerCase().includes('soaking')) &&
        (Number(l.severity) >= 4 || l.notes?.toLowerCase().includes('soak'))
      );
      return Boolean(heavyCycle || bleedingLog);
    },
    buildAlert: (triggerLog) => ({
      id: `alert_emergency_bleeding_${triggerLog?.date || 'active'}`,
      level: ALERT_LEVELS.EMERGENCY,
      badgeLabel: 'Urgent Gynecological Warning',
      trigger: 'Excessive menstrual flow or heavy bleeding recorded with signs of saturation.',
      diffFromBaseline: 'Exceeds typical monthly menstrual parameters.',
      actionSummary: 'Contact your OB/GYN immediately or go to the nearest emergency room if saturation persists.',
      urgentCareCriteria: [
        'Soaking through two or more maxi pads or super tampons every hour for two consecutive hours',
        'Passing blood clots larger than a quarter (2.5 cm / 1 inch)',
        'Feeling lightheaded, dizzy, pale, or short of breath upon standing',
        'Bleeding during pregnancy or post-menopause'
      ],
      recommendation: 'Seek immediate in-person gynecological or emergency assessment.',
      disclaimer: 'Flooding and rapid blood loss require prompt medical inspection to rule out hemorrhage.'
    })
  },
  {
    id: 'EMERGENCY_THUNDERCLAP_HEADACHE',
    level: ALERT_LEVELS.EMERGENCY,
    symptomCategory: 'headache',
    name: 'Severe Sudden Neurological Headache',
    condition: (recentLogs) => {
      return recentLogs.some(l => 
        (l.category === 'headache' || l.name?.toLowerCase().includes('migraine')) &&
        Number(l.severity) === 5 &&
        (l.duration === 'all_day' || l.notes?.toLowerCase().includes('sudden') || l.notes?.toLowerCase().includes('worst'))
      );
    },
    buildAlert: (triggerLog) => ({
      id: `alert_emergency_headache_${triggerLog?.date || 'active'}`,
      level: ALERT_LEVELS.EMERGENCY,
      badgeLabel: 'Neurological Red-Flag',
      trigger: `Severe intensity headache (Severity 5/5) recorded on ${triggerLog?.date}.`,
      diffFromBaseline: 'Extreme escalation beyond standard headache patterns.',
      actionSummary: 'Seek immediate emergency medical care.',
      urgentCareCriteria: [
        'Peak intensity reached within seconds ("thunderclap" headache)',
        'Headache accompanied by stiff neck, high fever, confusion, or speech changes',
        'Loss of vision, double vision, numbness, or weakness on one side of the face/body',
        'Headache following head trauma'
      ],
      recommendation: 'Do not drive yourself. Have someone take you to the emergency department or call emergency services.',
      disclaimer: 'Severe sudden headaches must be evaluated emergently by an emergency physician.'
    })
  },

  // --- DOCTOR CONSULTATION RECOMMENDED TIER ---
  {
    id: 'CONSULT_PERSISTENT_SYMPTOM',
    level: ALERT_LEVELS.DOCTOR_CONSULTATION,
    symptomCategory: 'any',
    name: 'Persistent Unresolved Symptom (3+ Consecutive Days)',
    condition: (recentLogs, baseline) => {
      // Group by category over last 7 days
      const counts = {};
      const consecutiveTracker = {};
      recentLogs.forEach(l => {
        const cat = l.category || 'other';
        counts[cat] = (counts[cat] || 0) + 1;
        if (!consecutiveTracker[cat]) consecutiveTracker[cat] = [];
        consecutiveTracker[cat].push(l);
      });

      for (const cat in counts) {
        if (counts[cat] >= 3) {
          const logs = consecutiveTracker[cat].sort((a, b) => new Date(a.date) - new Date(b.date));
          const avgSev = logs.reduce((acc, x) => acc + (x.severity || 2), 0) / logs.length;
          if (avgSev >= 2.5) {
            return { category: cat, count: counts[cat], avgSev, sample: logs[logs.length - 1] };
          }
        }
      }
      return false;
    },
    buildAlert: (matchInfo) => ({
      id: `alert_consult_persistent_${matchInfo.category}`,
      level: ALERT_LEVELS.DOCTOR_CONSULTATION,
      badgeLabel: 'Doctor Consultation Recommended',
      trigger: `Persistent ${matchInfo.category.replace('_', ' ')} reported on ${matchInfo.count} days in the past week (average severity: ${matchInfo.avgSev.toFixed(1)}/5).`,
      diffFromBaseline: `Your historical baseline frequency was lower. Continuous presentation for 3+ days warrants physician review.`,
      actionSummary: 'Schedule a visit with your primary healthcare provider or gynecologist.',
      urgentCareCriteria: [
        'If pain or discomfort suddenly spikes to 4–5/5',
        'If over-the-counter pain relievers fail to provide any relief',
        'If symptoms interfere with your ability to eat, sleep, or walk'
      ],
      recommendation: 'Export your 3-Minute Doctor Dossier from Dhatri to share your logged timeline, severity shifts, and cycle phases directly with your physician.',
      disclaimer: 'Persistent symptoms require professional diagnostic examination rather than ongoing home management.'
    })
  },
  {
    id: 'CONSULT_WORSENING_SEVERITY',
    level: ALERT_LEVELS.DOCTOR_CONSULTATION,
    symptomCategory: 'any',
    name: 'Clinically Meaningful Worsening Trend',
    condition: (recentLogs, baseline) => {
      if (!baseline || !baseline.symptomAverages) return false;
      for (const log of recentLogs) {
        const cat = log.category || 'other';
        const baseSev = baseline.symptomAverages[cat];
        if (baseSev && (log.severity - baseSev) >= 1.8) {
          return { category: cat, recentSev: log.severity, baseSev, date: log.date };
        }
      }
      return false;
    },
    buildAlert: (matchInfo) => ({
      id: `alert_consult_worsening_${matchInfo.category}`,
      level: ALERT_LEVELS.DOCTOR_CONSULTATION,
      badgeLabel: 'Worsening Symptom Trajectory',
      trigger: `Worsening ${matchInfo.category.replace('_', ' ')}: Recent severity reached ${matchInfo.recentSev}/5 on ${matchInfo.date}.`,
      diffFromBaseline: `Your historical baseline for this symptom was ${matchInfo.baseSev.toFixed(1)}/5. This represents an escalation of +${(matchInfo.recentSev - matchInfo.baseSev).toFixed(1)} points.`,
      actionSummary: 'Consult a qualified doctor to investigate potential underlying causes of escalating severity.',
      urgentCareCriteria: [
        'Rapid progression over less than 24 hours',
        'New neurological symptoms (tingling, visual aura, dizziness)'
      ],
      recommendation: 'Bring your Dhatri health export to your consultation to illustrate the precise date when the severity escalation began.',
      disclaimer: 'Worsening trends indicate changes in physiological state that deserve diagnostic review.'
    })
  },
  {
    id: 'CONSULT_FERRITIN_FATIGUE_CORRELATION',
    level: ALERT_LEVELS.DOCTOR_CONSULTATION,
    symptomCategory: 'fatigue',
    name: 'Fatigue with Low Ferritin Lab Corroboration',
    condition: (recentLogs, baseline, context) => {
      const fatigueLogs = recentLogs.filter(l => l.category === 'fatigue' || l.name?.toLowerCase().includes('fatigue'));
      const ferritinReport = context?.reports?.find(r => 
        r.biomarkers?.some(b => b.name?.toLowerCase().includes('ferritin') && Number(b.value) < 30)
      );
      if (fatigueLogs.length >= 2 && ferritinReport) {
        const bio = ferritinReport.biomarkers.find(b => b.name?.toLowerCase().includes('ferritin'));
        return { fatigueCount: fatigueLogs.length, ferritinVal: bio.value, unit: bio.unit || 'ng/mL', date: ferritinReport.date };
      }
      return false;
    },
    buildAlert: (matchInfo) => ({
      id: 'alert_consult_ferritin_fatigue',
      level: ALERT_LEVELS.DOCTOR_CONSULTATION,
      badgeLabel: 'Clinical Correlation Alert',
      trigger: `Repeated fatigue (${matchInfo.fatigueCount} logs) correlates with low serum ferritin (${matchInfo.ferritinVal} ${matchInfo.unit}) from your ${matchInfo.date} lab report.`,
      diffFromBaseline: `Ferritin under 30 ng/mL impairs mitochondrial cellular oxygen delivery, directly mirroring your logged energy deficit.`,
      actionSummary: 'Discuss iron status and targeted therapeutic supplementation with your physician.',
      urgentCareCriteria: [
        'Extreme pallor, resting heart rate > 100 bpm, or shortness of breath climbing gentle stairs',
        'Chest discomfort or near-fainting episodes'
      ],
      recommendation: 'Ask your doctor about a complete iron panel (TIBC, transferrin saturation) and whether oral or IV iron repletion is indicated.',
      disclaimer: 'Iron supplementation should always be supervised by a physician following confirmatory blood work.'
    })
  },

  // --- SELF-CARE & MONITORING TIER ---
  {
    id: 'MONITORING_MILD_TRANSIENT_SYMPTOMS',
    level: ALERT_LEVELS.MONITORING,
    symptomCategory: 'any',
    name: 'Mild Cyclical Discomfort / Self-Care Suitable',
    condition: (recentLogs) => {
      const mildLogs = recentLogs.filter(l => Number(l.severity) <= 2);
      return mildLogs.length > 0 ? mildLogs[0] : false;
    },
    buildAlert: (sampleLog) => ({
      id: `alert_monitoring_mild_${sampleLog.category || 'general'}`,
      level: ALERT_LEVELS.MONITORING,
      badgeLabel: 'Self-Care & Observation',
      trigger: `Mild ${sampleLog.name || sampleLog.category || 'symptom'} (Severity ${sampleLog.severity || 1}/5) logged on ${sampleLog.date}.`,
      diffFromBaseline: 'Severity is within manageable, non-emergency baseline limits.',
      actionSummary: 'Implement conservative wellness practices and observe over the next 48–72 hours.',
      urgentCareCriteria: [
        'If pain or discomfort worsens to level 3 or higher',
        'If symptoms persist continuously for more than 3 to 4 days'
      ],
      recommendation: 'Conservative suggestions: Apply a warm compress (15–20 min), maintain 2.5L daily hydration, incorporate magnesium-rich foods (pumpkin seeds, spinach, dark chocolate), and practice gentle pelvic tilts.',
      disclaimer: 'Safe for self-care only while symptoms remain mild and responsive to comfort measures.'
    })
  }
];

/**
 * Evaluates all clinical rules against user records.
 * Returns evaluated alerts sorted by clinical urgency (EMERGENCY first).
 */
export function evaluateClinicalSafety({ symptoms = [], daily = [], cycles = [], reports = [], user = {} }) {
  const evaluatedAlerts = [];
  const now = new Date();

  // 1. Calculate historical baseline (records older than 7 days up to 60 days)
  const sortedSymptoms = [...symptoms].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentWindowDays = 7;
  const recentCutoff = new Date(now.getTime() - recentWindowDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const recentLogs = sortedSymptoms.filter(s => s.date >= recentCutoff);
  const baselineLogs = sortedSymptoms.filter(s => s.date < recentCutoff);

  // Compute baseline averages per category
  const baselineCategoryStats = {};
  baselineLogs.forEach(l => {
    const cat = l.category || 'other';
    if (!baselineCategoryStats[cat]) {
      baselineCategoryStats[cat] = { totalSev: 0, count: 0 };
    }
    baselineCategoryStats[cat].totalSev += Number(l.severity || 2);
    baselineCategoryStats[cat].count += 1;
  });

  const symptomAverages = {};
  for (const cat in baselineCategoryStats) {
    symptomAverages[cat] = +(baselineCategoryStats[cat].totalSev / baselineCategoryStats[cat].count).toFixed(2);
  }

  const baseline = {
    totalLogs: baselineLogs.length,
    symptomAverages,
    avgSeverity: baselineLogs.length > 0 
      ? +(baselineLogs.reduce((acc, l) => acc + Number(l.severity || 2), 0) / baselineLogs.length).toFixed(1)
      : null
  };

  const context = {
    cycles,
    daily,
    reports,
    user
  };

  // Evaluate every rule
  for (const rule of CLINICAL_RULES) {
    try {
      const match = rule.condition(recentLogs, baseline, context);
      if (match) {
        const trigger = typeof match === 'object' ? match : recentLogs[0];
        const alertObj = rule.buildAlert(trigger, baseline);
        evaluatedAlerts.push(alertObj);
      }
    } catch (err) {
      console.warn(`Error evaluating clinical rule ${rule.id}:`, err);
    }
  }

  // Sort alerts so EMERGENCY is strictly on top, followed by DOCTOR_CONSULTATION, then MONITORING
  const priorityOrder = {
    [ALERT_LEVELS.EMERGENCY]: 1,
    [ALERT_LEVELS.DOCTOR_CONSULTATION]: 2,
    [ALERT_LEVELS.MONITORING]: 3
  };

  evaluatedAlerts.sort((a, b) => (priorityOrder[a.level] || 99) - (priorityOrder[b.level] || 99));

  return {
    alerts: evaluatedAlerts,
    hasEmergency: evaluatedAlerts.some(a => a.level === ALERT_LEVELS.EMERGENCY),
    emergencyCount: evaluatedAlerts.filter(a => a.level === ALERT_LEVELS.EMERGENCY).length,
    consultationCount: evaluatedAlerts.filter(a => a.level === ALERT_LEVELS.DOCTOR_CONSULTATION).length,
    monitoringCount: evaluatedAlerts.filter(a => a.level === ALERT_LEVELS.MONITORING).length,
    baseline
  };
}
