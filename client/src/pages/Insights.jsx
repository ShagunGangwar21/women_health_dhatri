import React from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';
import UrgentCareBanner from '../components/UrgentCareBanner';
import HealthAlertsBanner from '../components/HealthAlertsBanner';

export default function Insights() {
  const { cycles = [], symptoms = [], reports = [] } = useHealthData();
  const { t, isHindi } = useLanguage();

  return (
    <div className="insights-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <UrgentCareBanner />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-rose" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {t('insights.badge', null, 'Cross-System Intelligence (Observe → Connect → Understand)')}
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>
            {t('insights.title', null, 'Pattern Evolution Canvas')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px' }}>
            {t('insights.subtitle', null, 'Isolated symptoms become meaningful patterns when viewed across your menstrual cycle, blood biochemistry, and lifestyle context.')}
          </p>
        </div>
        <div style={{ padding: '0.75rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{isHindi ? 'कुल विश्लेषित संकेत' : 'Signals Analyzed'}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
            {cycles.length} {isHindi ? 'साइकिल' : 'Cycles'} • {symptoms.length} {isHindi ? 'लक्षण' : 'Symptoms'} • {reports.length} {isHindi ? 'रिपोर्ट्स' : 'Reports'}
          </div>
        </div>
      </div>

      {/* Real-time Health Monitoring & Alerts */}
      <HealthAlertsBanner />

      {/* Primary Pattern Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Pattern 1: Ferritin + Bleeding */}
        <div className="card" style={{ padding: '2rem', borderLeft: '5px solid var(--color-rose)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span className="badge badge-burgundy">{isHindi ? 'बायोकेमिकल व मासिक धर्म संबंध' : 'Biochemical & Menstrual Link'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isHindi ? 'उच्च सांख्यिकीय सहसंबंध' : 'High Statistical Correlation'}</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--color-burgundy)' }}>
            {isHindi ? '18-महीने फेरिटिन गिरावट ↔ अत्यधिक रक्तस्राव' : '18-Month Ferritin Depletion ↔ Menorrhagia'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {isHindi
              ? 'लगातार 3 मासिक धर्म चक्रों में 5 दिनों से अधिक भारी रक्तस्राव के कारण फेरिटिन 38 ng/mL से गिरकर 11 ng/mL हो गया। यह दोपहर में सुस्ती और थकान के दर्ज किए गए लक्षणों से सीधे मेल खाता है।'
              : 'Across 3 logged cycles with heavy bleeding durations (>5 days), your serum ferritin drifted downward from 38 ng/mL to 11 ng/mL. This subclinical iron deficiency mirrors your repeated logs of brain fog, breathlessness on exertion, and afternoon crashes.'}
          </p>
          <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--color-deep-green)' }}>
              {isHindi ? 'चिकित्सीय परामर्श सुझाव:' : 'Clinical Action Hypothesis:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isHindi
                ? 'अपने डॉक्टर के साथ पूरे आयरन प्रोफाइल (Transferrin Saturation, TIBC) और सप्लीमेंट्स पर चर्चा करें।'
                : 'Discuss complete iron study (Transferrin Saturation, TIBC) and elemental iron supplementation with your physician rather than isolated caffeine consumption.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(217, 111, 137, 0.1)', color: 'var(--color-rose)' }}>Ferritin 11 ng/mL</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)' }}>Cycle Days 1–3</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--color-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Fatigue 4/5</span>
          </div>
        </div>

        {/* Pattern 2: Luteal Phase Neuro-Vascular */}
        <div className="card" style={{ padding: '2rem', borderLeft: '5px solid var(--color-sage)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span className="badge badge-sage">{isHindi ? 'न्यूरो-एंडोक्राइन लय' : 'Neuro-Endocrine Rhythms'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isHindi ? 'पुनरावर्ती चक्र पैटर्न' : 'Recurring Cycle Rhythm'}</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--color-burgundy)' }}>
            {isHindi ? 'ल्यूटियल फ़ेज़ हार्मोन ड्रॉप ↔ माइग्रेन' : 'Late Luteal Progesterone Drop ↔ Migraine Cluster'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {isHindi
              ? 'सिरदर्द और संवेदनशीलता मुख्य रूप से चक्र के 25–28वें दिन होती है। जब एस्ट्रोजन और प्रोजेस्टेरोन तेजी से गिरते हैं, तो न्यूरोवैस्कुलर संवेदनशीलता बढ़ जाती है।'
              : 'Headaches and sensory sensitivity occur exclusively on Days 25–28 of your cycle. As circulating estrogen and progesterone rapidly decrease prior to menses, neurovascular reactivity increases, exacerbated on days with >2 caffeinated beverages.'}
          </p>
          <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--color-deep-green)' }}>
              {isHindi ? 'सक्रिय जीवनशैली सुझाव:' : 'Proactive Lifestyle Modification:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isHindi
                ? 'चक्र के 23वें दिन से मैग्नीशियम और पर्याप्त पानी का सेवन बढ़ाएं तथा कैफीन की मात्रा सीमित रखें।'
                : 'Begin magnesium glycinate hydration protocol on Cycle Day 23, and cap caffeine intake to 1 cup before 11:00 AM.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)' }}>Luteal Phase</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(217, 111, 137, 0.1)', color: 'var(--color-rose)' }}>Sleep &lt;6 hrs</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--color-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Headache 3.5/5</span>
          </div>
        </div>

        {/* Pattern 3: Hydration vs Cramping */}
        <div className="card" style={{ padding: '2rem', borderLeft: '5px solid var(--color-deep-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span className="badge badge-sage">{isHindi ? 'हाइड्रेशन एवं गर्भाशय संकुचन' : 'Hydration & Uterine Tone'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isHindi ? 'सकारात्मक लक्ष्य' : 'Actionable Target'}</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--color-burgundy)' }}>
            {isHindi ? 'कम पानी (<1.8L) ↔ तीव्र पेल्विक दर्द' : 'Hydration Deficit (<1.8L) ↔ Severe Pelvic Cramps'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {isHindi
              ? 'जिन दिनों पानी का सेवन 1.8 लीटर से कम रहा, उन दिनों दर्द की गंभीरता 4.2/5 दर्ज हुई, जबकि 2.5 लीटर पानी पीने पर यह मात्र 2.1/5 रही। डिहाइड्रेशन से गर्भाशय की मांसपेशियों में खिंचाव बढ़ता है।'
              : 'On days where daily water intake was logged under 1.8 liters, pelvic pain severity averaged 4.2/5 compared to 2.1/5 on days with >2.5 liters of hydration with adequate electrolytes. Dehydration elevates vasopressin, accentuating uterine myometrial contractions.'}
          </p>
          <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--color-deep-green)' }}>
              {isHindi ? 'लक्ष्य अनुशंसा:' : 'Active Goal Recommendation:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isHindi
                ? 'अपने लक्ष्यों में 2.4L दैनिक पानी का लक्ष्य बनाए रखें, विशेष रूप से पीरियड्स से 48 घंटे पहले।'
                : 'Maintain 2.4L daily water target in your My Goals dashboard, especially starting 48 hours prior to expected menstruation.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)' }}>Electrolyte Balance</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(217, 111, 137, 0.1)', color: 'var(--color-rose)' }}>2.4L Daily</span>
          </div>
        </div>
      </div>

      {/* Collaborative Clinical Discussion Section */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="help-circle" size={20} color="var(--color-rose)" /> {t('insights.recommendations', null, 'Questions To Bring to Your Next Clinical Visit')}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {isHindi ? 'धात्री आपके डॉक्टर के साथ सार्थक और केंद्रित बातचीत के लिए प्रश्न तैयार करती है:' : 'Dhatri prepares you to lead confident conversations with your OB/GYN or primary doctor:'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
              {isHindi ? 'प्रश्न 1: आयरन व पीरियड्स का प्रवाह' : 'Q1: Iron Stores & Menstrual Flow'}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isHindi
                ? '"सामान्य खान-पान के बावजूद पिछले एक साल में मेरा फेरिटिन 38 से गिरकर 11 हो गया है। क्या हमें भारी रक्तस्राव को इसका प्राथमिक कारण मानना चाहिए?"'
                : '"My ferritin has dropped from 38 to 11 over the past year despite regular diet. Should we investigate heavy menstrual blood loss as the primary cause?"'}
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
              {isHindi ? 'प्रश्न 2: माहवारी सिरदर्द की रोकथाम' : 'Q2: Menstrual Migraine Prevention'}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isHindi
                ? '"मेरा सिरदर्द विशेष रूप से ल्यूटियल फ़ेज़ के अंत (दिन 25–28) में होता है। क्या इसके लिए पेरीमेन्स्ट्रुअल प्रिवेंशन या मैग्नीशियम उपयुक्त रहेगा?"'
                : '"My headaches cluster specifically in the late luteal phase (Days 25–28). Would perimenstrual triptan prophylaxis or magnesium be appropriate?"'}
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
              {isHindi ? 'प्रश्न 3: अल्ट्रासाउंड का सही समय' : 'Q3: Ultrasound Timing'}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isHindi
                ? '"बाईं ओर बार-बार होने वाले दर्द को देखते हुए, क्या शुरुआती फॉलिक्युलर फ़ेज़ (दिन 5–8) में पेल्विक अल्ट्रासाउंड कराना उचित होगा?"'
                : '"Given recurring localized cramps on the left side, should a transvaginal ultrasound be scheduled in the early follicular phase (Days 5–8)?"'}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Safety Disclaimer */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong>{isHindi ? 'चिकित्सीय सुरक्षा सूचना:' : 'Clinical Evidence Disclosure:'}</strong> {t('insights.clinicalDisclaimer', null, 'Patterns detected by Dhatri represent statistical correlations from self-reported logs and laboratory values. They do not constitute diagnostic determinations, disease evaluations, or treatment prescriptions. Always review these insights directly with your licensed medical practitioner.')}
      </div>
    </div>
  );
}
