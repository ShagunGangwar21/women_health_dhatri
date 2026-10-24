// Curated Evidence-Based Women's Health Education Library
export const ARTICLES = [
  {
    id: 'art_1',
    slug: 'understanding-ferritin-fatigue',
    title: 'Why Normal Iron Isn’t Always Enough: The Hidden Role of Ferritin',
    category: 'Hormonal & Metabolic Health',
    readingTime: '5 min read',
    publishedDate: 'Oct 2026',
    image: '/benefits-image.png',
    summary: 'Explore why standard laboratory reference ranges for iron stores often overlook sub-clinical deficiency in active women.',
    content: `
### What is Ferritin?
Ferritin is a cellular protein that stores iron and releases it in a controlled fashion. While Hemoglobin measures active oxygen carriers in your bloodstream, Ferritin measures your **metabolic reserves**—your physiological iron savings account.

### The Problem with "Normal" Ranges
In many standard clinical laboratories, the reference interval for serum ferritin spans from **12 to 150 ng/mL**. If your value returns at 16 ng/mL, your doctor's EHR portal may flag it in green as "normal."
However, multiple clinical studies in endocrinology and sports medicine indicate that:
- Below **30 ng/mL**, cellular enzymes experience reduced ATP generation.
- Below **45–50 ng/mL**, hair follicle telogen effluvium (shedding) and late-luteal fatigue can become prominent.

### The Menstrual Connection
Women with heavy menstrual flow lose between 30 to 80 mL of blood per cycle, steadily depleting ferritin if dietary intake or absorption is suboptimal.

### Preparing to Discuss this with Your Doctor
1. Ask for a complete iron panel: Serum Ferritin + Total Iron-Binding Capacity (TIBC) + Transferrin Saturation.
2. Inquire whether gentle iron bisglycinate alongside Vitamin C would be appropriate for your baseline.
    `,
    sources: [
      'American College of Obstetricians and Gynecologists (ACOG) Clinical Consensus',
      'The Lancet Haematology: Iron deficiency in women of reproductive age'
    ]
  },
  {
    id: 'art_2',
    slug: 'demystifying-endometriosis-diagnosis',
    title: 'Beyond Severe Cramps: Recognizing the Multi-System Footprint of Endometriosis',
    category: 'Menstrual Health',
    readingTime: '7 min read',
    image: '/endometriosis.webp',
    summary: 'Why diagnosis takes 7 to 10 years on average and how longitudinal pattern logging bridges the communication gap with specialists.',
    content: `
### The 8-Year Diagnostic Delay
Globally, women with endometriosis wait an average of 7.5 to 10 years and consult up to 5 physicians before receiving an accurate laparoscopic or imaging diagnosis.

### Why Does It Take So Long?
Endometriosis is not merely painful periods. It is an **inflammatory, systemic condition** where tissue resembling the endometrium grows outside the uterine cavity. Symptoms frequently manifest across specialties:
- **Gynecological:** Dysmenorrhea (deep pelvic pain), pain with intercourse.
- **Gastrointestinal:** "Endo belly" bloating, cyclical IBS-like pain during ovulation or menses.
- **Neurological & Musculoskeletal:** Sciatic referral, deep lower back aching, chronic fatigue.

Because symptoms are split between gastroenterologists, urologists, and primary care doctors, the underlying cohesive pattern remains invisible unless the patient maintains a longitudinal health record.
    `,
    sources: [
      'World Health Organization (WHO) Endometriosis Fact Sheet',
      'Endometriosis Foundation of America'
    ]
  },
  {
    id: 'art_3',
    slug: 'premenstrual-syndrome-vs-pmdd',
    title: 'PMS vs. PMDD: Deciphering the Late Luteal Neuro-Hormonal Shift',
    category: 'Mental Wellbeing',
    readingTime: '6 min read',
    image: '/premenstrual-syndrome.webp',
    summary: 'Understanding the neurochemical sensitivity to progesterone drops in the late luteal phase and effective evidence-based management.',
    content: `
### The Luteal Phase Architecture
Around cycle day 14, ovulation occurs and the corpus luteum begins pumping progesterone. Progesterone metabolizes into **allopregnanolone (ALLO)**, a neurosteroid that interacts with GABA-A receptors in the brain.

### When GABA Sensitivity Shifts
In women with Premenstrual Dysphoric Disorder (PMDD), the brain has an altered sensitivity to normal physiological shifts in allopregnanolone. It is not an excess or deficiency of hormones—it is a **neurological hyper-reactivity to normal cyclical fluctuations**.

### Self-Tracking for Clinical Clarity
To meet DSM-5 diagnostic criteria for PMDD, symptoms must:
1. Appear in the final 7 to 10 days of the luteal phase.
2. Clear within 2 to 3 days after period onset.
3. Be confirmed across at least two consecutive monitored cycles.
    `,
    sources: [
      'International Association for Premenstrual Disorders (IAPMD)',
      'Harvard Health Publishing'
    ]
  },
  {
    id: 'art_4',
    slug: 'menstrual-hygiene-and-care-options',
    title: 'Modern Period Care: Exploring Menstrual Cups, Discs, and Sustainable Hygiene',
    category: 'General Women’s Wellness',
    readingTime: '4 min read',
    image: '/menstrual-cup.webp',
    summary: 'A practical, anatomically sound comparison of period management tools for comfort, pelvic floor health, and sustainability.',
    content: `
### Finding the Tool that Fits Your Anatomy
Every woman's vaginal canal, pelvic floor tone, and cervix height vary across life phases:
- **Menstrual Cups:** Sit in the lower vaginal vault, creating a gentle seal. Excellent for medium-to-heavy flow days.
- **Menstrual Discs:** Sit higher up in the vaginal fornix just below the cervix. Unlike cups, discs do not rely on suction, making them popular among women with sensitive bladders or IUDs.
- **Period Underwear:** Multi-layer moisture-wicking technology ideal for spotting or sleep.
    `,
    sources: [
      'The Lancet Public Health Review on Menstrual Cup Safety and Efficacy'
    ]
  },
  {
    id: 'art_5',
    slug: 'sleep-circadian-rhythm-menstrual-cycle',
    title: 'Circadian Architecture: How Sleep Stages Evolve Across Your Cycle',
    category: 'Sleep',
    readingTime: '5 min read',
    image: '/myths-about-menstruation.webp',
    summary: 'Why your basal body temperature and REM sleep change between follicular and luteal phases, and how to optimize bedtime rest.',
    content: `
### Progesterone and Core Body Temperature
After ovulation, progesterone elevates your core resting body temperature by 0.3°C to 0.5°C.
Because human sleep initiation relies on the core body temperature dropping, many women experience:
- Increased sleep latency (taking longer to fall asleep) in the luteal phase.
- Reductions in deep restorative slow-wave sleep.

### Practical Circadian Alignment
1. Lower room temperature by 1°C during the week before your period.
2. Consider magnesium glycinate 30–60 minutes before bed to support muscle relaxation.
    `,
    sources: [
      'Sleep Medicine Reviews: Sleep and circadian rhythmicity in women',
      'National Sleep Foundation'
    ]
  }
];

export const getArticles = (req, res) => {
  const { category, search } = req.query;
  let results = [...ARTICLES];

  if (category && category !== 'All') {
    results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    articles: results,
    totalCount: results.length,
    categories: ['All', 'Menstrual Health', 'Hormonal & Metabolic Health', 'Mental Wellbeing', 'Sleep', 'General Women’s Wellness']
  });
};

export const getArticleBySlug = (req, res) => {
  const { slug } = req.params;
  const article = ARTICLES.find(a => a.slug === slug || a.id === slug);
  if (!article) {
    return res.status(404).json({ success: false, message: 'Article not found.' });
  }

  const related = ARTICLES.filter(a => a.id !== article.id && a.category === article.category).slice(0, 2);

  res.json({ success: true, article, related });
};
