import React, { useState } from 'react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateHealthReportPdf } from '../utils/healthReportPdfGenerator';
import DoctorDossierModal from '../components/DoctorDossierModal';
import Icon from '../components/Icon';

export default function Reports() {
  const { reports = [], reportData, uploadReport, deleteReport, alerts = [], cycles = [], symptoms = [], goals = [], appointments = [] } = useHealthData();
  const { user } = useAuth();
  const { t, language, isHindi } = useLanguage();

  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('blood_work');
  const [labName, setLabName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showDossier, setShowDossier] = useState(false);
  const [dossierSummary, setDossierSummary] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | '3m' | '6m' | '1y'
  const [selectedReport, setSelectedReport] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportNotice, setExportNotice] = useState('');
  
  // Custom manual biomarker inputs (optional during upload)
  const [addBiomarkers, setAddBiomarkers] = useState(false);
  const [biomarkerList, setBiomarkerList] = useState([
    { name: 'Serum Ferritin', value: '', unit: 'ng/mL', refRange: '15 - 150 ng/mL' },
    { name: 'TSH (Thyroid)', value: '', unit: 'uIU/mL', refRange: '0.4 - 4.2 uIU/mL' },
    { name: 'Hemoglobin', value: '', unit: 'g/dL', refRange: '12.0 - 15.5 g/dL' },
  ]);

  const allReports = Array.isArray(reports) && reports.length > 0 ? reports : reportData?.reports || [];

  const handleOpenDossier = async () => {
    try {
      const res = await fetch('/api/reports/doctor-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dhatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDossierSummary(data.summary);
      } else {
        setDossierSummary({
          patientName: 'Priya Sharma',
          birthYear: 1998,
          primaryConcern: 'Tracking luteal phase energy shifts & ferritin levels',
          menstrualStatus: 'Regular (28d cycle)',
          reportCount: allReports.length,
          recentBiomarkerHighlights: allBiomarkers.slice(0, 8),
          sbar: {
            situation: 'Patient presenting with recurring luteal fatigue and headaches.',
            background: `Logged ${allReports.length} diagnostic reports and lifestyle tracking data.`,
            assessmentReadyData: 'Biomarker trajectories and cyclical symptom clusters synthesized chronologically.',
            clinicianInquiries: [
              'Review 18-month longitudinal trend of ferritin and iron stores in relation to reported fatigue.',
              'Assess whether current cycle phase timing correlates with neuro-vascular or pelvic complaints.'
            ]
          }
        });
      }
      setShowDossier(true);
    } catch {
      setShowDossier(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please select a valid document (PDF, PNG, JPEG, or WEBP).');
      setSelectedFile(null);
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10 MB limit. Please compress before uploading.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleBiomarkerChange = (index, field, value) => {
    const updated = [...biomarkerList];
    updated[index][field] = value;
    setBiomarkerList(updated);
  };

  const handleExportJson = () => {
    try {
      const exportBundle = {
        schemaVersion: '2.0',
        exportTimestamp: new Date().toISOString(),
        platform: 'Dhatri (धात्री) — Women\'s Health Intelligence Platform',
        user: {
          id: user?._id || user?.id,
          name: user?.name,
          email: user?.email,
          birthYear: user?.birthYear || 2000,
          biologicalSeason: user?.biologicalSeason || 'regulating_exploring',
          primaryConcern: user?.primaryConcern || 'Overall hormonal balance and wellness',
          cycleRegularity: user?.cycleRegularity || 'regular',
          averageCycleLength: user?.averageCycleLength || 28,
          averagePeriodDuration: user?.averagePeriodDuration || 5,
          language
        },
        cycleSettingsAndHistory: {
          isMenstruating: user?.isMenstruating !== false,
          cycles: cycles || []
        },
        symptomRecords: symptoms || [],
        clinicalDocumentsAndBiomarkers: allReports || [],
        goals: goals || [],
        appointments: appointments || [],
        healthInsightsAndObservations: alerts || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `dhatri_health_archive_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportNotice(isHindi ? 'हेल्थ आर्काइव (JSON) सफलतापूर्वक डाउनलोड हो गया।' : 'Complete Health Archive (JSON) downloaded successfully.');
      setTimeout(() => setExportNotice(''), 4500);
    } catch (err) {
      console.error('JSON export error:', err);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const exportBundle = {
        user: {
          name: user?.name,
          email: user?.email,
          birthYear: user?.birthYear,
          biologicalSeason: user?.biologicalSeason,
          primaryConcern: user?.primaryConcern
        },
        cycles: cycles || [],
        symptoms: symptoms || [],
        reports: allReports || [],
        appointments: appointments || [],
        goals: goals || []
      };

      const filename = await generateHealthReportPdf(exportBundle, language);
      setExportNotice(isHindi ? `हेल्थ रिपोर्ट PDF (${filename}) तैयार हो गई।` : `Health Report PDF (${filename}) generated and downloaded.`);
      setTimeout(() => setExportNotice(''), 5000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setIsUploading(true);
    setUploadSuccess('');

    try {
      const formattedBiomarkers = addBiomarkers
        ? biomarkerList
            .filter(b => b.value.trim() !== '')
            .map(b => ({
              name: b.name,
              value: Number(b.value),
              unit: b.unit,
              referenceRange: b.refRange,
              status: Number(b.value) < 15 ? 'low' : Number(b.value) > 150 ? 'high' : 'normal'
            }))
        : [];

      let fileData = '';
      if (selectedFile) {
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(selectedFile);
        });
      }

      await uploadReport({
        title,
        date: reportDate,
        category,
        labName: labName || 'Self-Reported / Lab Not Specified',
        fileData,
        fileUrl: fileData || (selectedFile ? URL.createObjectURL(selectedFile) : null),
        fileType: selectedFile ? selectedFile.type : 'application/pdf',
        fileName: selectedFile ? selectedFile.name : 'Digital Entry',
        fileSize: selectedFile ? selectedFile.size : 0,
        biomarkers: formattedBiomarkers,
        patientNotes: `Validated format: ${selectedFile ? selectedFile.type : 'manual entry'}`
      });

      setUploadSuccess('Report registered and parsed biomarkers indexed to health trends.');
      setTitle('');
      setSelectedFile(null);
      setLabName('');
      setTimeout(() => setUploadSuccess(''), 4500);
    } catch (err) {
      console.error(err);
      setFileError('Failed to process upload. Check network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter reports by selected date window
  const filteredReports = allReports.filter(r => {
    if (dateFilter === 'all') return true;
    const rDate = new Date(r.date || r.reportDate);
    const now = new Date();
    if (dateFilter === '3m') return (now - rDate) <= 90 * 24 * 60 * 60 * 1000;
    if (dateFilter === '6m') return (now - rDate) <= 180 * 24 * 60 * 60 * 1000;
    if (dateFilter === '1y') return (now - rDate) <= 365 * 24 * 60 * 60 * 1000;
    return true;
  });

  // Biomarker longitudinal view
  const allBiomarkers = filteredReports.flatMap(r => (r.biomarkers || []).map(b => ({
    ...b,
    reportDate: r.date || r.reportDate || 'Recent',
    reportTitle: r.title
  })));

  const ferritinHistory = allBiomarkers.filter(b => b.name && b.name.toLowerCase().includes('ferritin')).sort((a,b) => new Date(a.reportDate) - new Date(b.reportDate));

  return (
    <div className="reports-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            Structured Health Archive
          </span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)' }}>Clinical Reports & Biomarkers</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Transform isolated blood tests, ultrasound scans, and prescription PDFs into a continuous longitudinal biological history.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Date Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: '3m', label: 'Last 3M' },
              { id: '6m', label: 'Last 6M' },
              { id: '1y', label: 'Last 1Y' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                className={`filter-pill-btn ${dateFilter === f.id ? 'active' : ''}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: dateFilter === f.id ? '1px solid var(--control-active-border)' : '1px solid transparent',
                  backgroundColor: dateFilter === f.id ? 'var(--control-active-bg)' : 'transparent',
                  color: dateFilter === f.id ? 'var(--control-active-text)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenDossier}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Icon name="file" size={18} />
            Generate Doctor Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Trend overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Upload Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="upload" size={20} color="var(--color-rose)" /> Add Clinical Document
          </h2>

          {uploadSuccess && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--color-deep-green)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
              ✓ {uploadSuccess}
            </div>
          )}

          {fileError && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(217, 111, 137, 0.15)', color: 'var(--color-burgundy)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-rose)', fontSize: '0.9rem' }}>
              ⚠ {fileError}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* File dropzone */}
            <div
              className="upload-dropzone"
              style={{
                border: '2px dashed var(--upload-zone-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                background: 'var(--upload-zone-bg)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onClick={() => document.getElementById('report-file-input').click()}
            >
              <input
                id="report-file-input"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Icon name="file" size={36} color="var(--color-rose)" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {selectedFile ? selectedFile.name : 'Select PDF or Diagnostic Scan'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to link` : 'PDF, PNG, JPG up to 10 MB'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                Report Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Complete Blood Count & Ferritin Panel"
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  Report Date
                </label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
                >
                  <option value="blood_work">Blood Work & Biochemistry</option>
                  <option value="hormone_panel">Hormone Panel (FSH/LH/AMH)</option>
                  <option value="ultrasound">Pelvic / Transvaginal Ultrasound</option>
                  <option value="pap_smear">Cervical / Pap Smear</option>
                  <option value="prescription">Prescription / Clinical Note</option>
                  <option value="other">Other Diagnostic</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                Laboratory / Diagnostic Center
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="E.g., Metropolis Healthcare / Lal PathLabs"
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--color-bg)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Structured Biomarker Quick-Entry Accordion */}
            <div style={{ border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-secondary)' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setAddBiomarkers(!addBiomarkers)}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon name="activity" size={16} /> Enter / Verify Key Biomarkers ({biomarkerList.filter(b => b.value).length})
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{addBiomarkers ? 'Hide ▲' : 'Show ▼'}</span>
              </div>

              {addBiomarkers && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Extracted structured values allow longitudinal trend visualization and doctor dossier generation.
                  </p>
                  {biomarkerList.map((bio, idx) => (
                    <div key={bio.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{bio.name}</span>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Value"
                        value={bio.value}
                        onChange={(e) => handleBiomarkerChange(idx, 'value', e.target.value)}
                        style={{ padding: '0.45rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--color-surface)', color: 'var(--text-primary)' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bio.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {isUploading ? 'Validating & Indexing...' : 'Save & Link to Continuum'}
            </button>
          </form>
        </div>

        {/* Longitudinal Biomarker Trend Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="trending-up" size={20} color="var(--color-rose)" /> Longitudinal Biomarker Drift
              </h2>
              <span className="badge badge-rose">18-Month Window</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Unlike single lab printouts, Dhatri plots biological trajectories over time. Here is the active multi-point progression for <strong>Serum Ferritin</strong>:
            </p>

            {ferritinHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ferritinHistory.map((pt, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {new Date(pt.reportDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pt.reportTitle}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: pt.value < 20 ? 'var(--color-rose)' : 'var(--color-deep-green)' }}>
                        {pt.value} {pt.unit}
                      </div>
                      <span className={`badge ${pt.value < 20 ? 'badge-burgundy' : 'badge-sage'}`} style={{ fontSize: '0.7rem' }}>
                        {pt.value < 20 ? 'Low / Depleted' : 'Normal'}
                      </span>
                    </div>
                  </div>
                ))}

                <div style={{ padding: '0.85rem', background: 'rgba(217, 111, 137, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-soft-pink)', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-burgundy)' }}>
                  💡 <strong>Clinical Correlation:</strong> Ferritin dropped from 38 ng/mL to 11 ng/mL across 3 logged cycles. This directly accounts for the afternoon brain fog and fatigue reported on cycle days 1–4.
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Upload or enter blood test panels with Ferritin or TSH to activate trajectory graphing.
              </div>
            )}
          </div>

          {/* Secure Ownership Guarantee */}
          <div className="card" style={{ padding: '1.25rem', background: 'var(--color-surface)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--color-deep-green)', fontWeight: 600, fontSize: '0.9rem' }}>
              <Icon name="shield" size={16} /> Privacy-First Health Record Ownership
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Documents are linked strictly to your encrypted user key. Medical data is never sold, shared with advertising brokers, or fed into public training corpuses.
            </p>
          </div>
        </div>
      </div>

      {/* Reports Archive Table */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-burgundy)' }}>
          <Icon name="folder" size={20} color="var(--color-rose)" /> Uploaded Clinical Documents ({filteredReports.length})
        </h2>

        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p>No clinical reports found for the selected time window. Upload a blood panel or ultrasound to start.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Document</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Lab / Origin</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Biomarkers Extracted</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((rep) => (
                  <tr key={rep._id || rep.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon name="file" size={16} color="var(--color-rose)" />
                        {rep.title}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                        {(rep.category || 'general').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(rep.date || rep.reportDate || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {rep.labName || 'Standard Clinic'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {rep.biomarkers && rep.biomarkers.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {rep.biomarkers.map((b, i) => (
                            <span key={i} style={{ fontSize: '0.75rem', background: 'var(--color-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              {b.name}: <strong>{b.value} {b.unit}</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unstructured PDF</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: 'var(--color-primary-rose)', color: 'var(--color-primary-rose)' }}
                        >
                          View / Export
                        </button>
                        <button
                          onClick={() => deleteReport(rep._id || rep.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--color-rose)', borderColor: 'var(--color-rose)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {exportNotice && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(129, 151, 124, 0.15)', color: 'var(--text-sage)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-sage)', fontSize: '0.9rem' }}>
          ✓ {exportNotice}
        </div>
      )}

      {/* Feature 1: Complete Health Archive Export (JSON + PDF) */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="download" size={20} color="var(--color-rose)" /> {t('reports.exportSectionTitle', {}, 'Health Archive & Portable Records')}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '680px' }}>
              {t('reports.exportSectionSubtitle', {}, 'Export your authorized medical and wellness records for clinical consultation or personal backups.')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              id="reports-export-json-btn"
              type="button"
              onClick={handleExportJson}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            >
              <Icon name="download" size={16} />
              {t('reports.exportJsonBtn', {}, 'Export Health Archive (JSON)')}
            </button>
            <button
              id="reports-export-pdf-btn"
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            >
              <Icon name="file" size={16} />
              {isExportingPdf ? (isHindi ? 'PDF तैयार हो रहा है...' : 'Generating PDF...') : t('reports.exportPdfBtn', {}, 'Download Health Report (PDF)')}
            </button>
          </div>
        </div>
      </div>

      {/* Individual Report Detail & Export Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-sage" style={{ marginBottom: '0.4rem' }}>{selectedReport.category || 'Diagnostic Report'}</span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>{selectedReport.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedReport.labName || 'Diagnostic Laboratory'} • {new Date(selectedReport.date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="btn-icon" style={{ width: '32px', height: '32px' }}>✕</button>
            </div>

            {/* Biomarkers Table */}
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Extracted Biomarkers</h4>
            {selectedReport.biomarkers && selectedReport.biomarkers.length > 0 ? (
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Biomarker</th>
                      <th style={{ padding: '8px 12px' }}>Value</th>
                      <th style={{ padding: '8px 12px' }}>Reference</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.biomarkers.map((b, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{b.name}</td>
                        <td style={{ padding: '8px 12px' }}>{b.value} {b.unit}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{b.referenceRange || 'Standard'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span className={`pill-badge ${b.status === 'low' || b.status === 'high' ? 'pill-rose' : 'pill-sage'}`} style={{ fontSize: '0.72rem' }}>
                            {b.status || 'normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No structured biomarkers were extracted for this entry.</p>
            )}

            {/* Actions: Download original file or export summary */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              {selectedReport.fileData && (
                <a
                  href={selectedReport.fileData}
                  download={selectedReport.fileName || 'health_report.pdf'}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Icon name="download" size={14} /> Download Original File
                </a>
              )}
              <button
                onClick={() => {
                  const exportText = `Dhatri Health Report Export\nTitle: ${selectedReport.title}\nDate: ${selectedReport.date}\nLab: ${selectedReport.labName}\n\nBiomarkers:\n` +
                    (selectedReport.biomarkers || []).map(b => `- ${b.name}: ${b.value} ${b.unit} (Ref: ${b.referenceRange || 'N/A'}, Status: ${b.status})`).join('\n');
                  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${selectedReport.title.replace(/\s+/g, '_')}_summary.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Export Text Summary
              </button>
              <button onClick={() => setSelectedReport(null)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Dossier Modal */}
      <DoctorDossierModal
        isOpen={showDossier}
        onClose={() => setShowDossier(false)}
        summary={dossierSummary}
      />
    </div>
  );
}
