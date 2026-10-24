import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateHealthReportPdf = async (data, language = 'en') => {
  const isHindi = language === 'hi';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Colors
  const burgundy = [112, 43, 76]; // #702B4C
  const deepGreen = [74, 93, 70]; // #4A5D46
  const charcoal = [40, 30, 35];
  const mutedText = [110, 100, 105];
  const blushBg = [253, 246, 247];

  // Helper: check page break
  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 10;
      return true;
    }
    return false;
  };

  // Helper: section header
  const renderSectionHeader = (titleEn, titleHi, icon = '•') => {
    checkPageBreak(16);
    y += 4;
    doc.setFillColor(...blushBg);
    doc.roundedRect(margin, y - 4, pageWidth - (margin * 2), 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...burgundy);
    const displayTitle = isHindi ? `${titleHi} (${titleEn})` : titleEn;
    doc.text(`${icon}  ${displayTitle}`, margin + 3, y + 2);
    y += 9;
  };

  // 1. Document Header Banner
  doc.setFillColor(...burgundy);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 248, 243);
  doc.text('DHATRI (धात्री) — Women\'s Health Intelligence', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(246, 214, 217);
  doc.text(
    isHindi
      ? 'व्यक्तिगत एवं क्लिनिकल स्वास्थ्य रिपोर्ट | गोपनीय मेडिकल सारांश'
      : 'Comprehensive Personal Health Archive & Clinical Consultation Dossier',
    margin,
    18
  );

  const exportDate = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.setFontSize(8);
  doc.setTextColor(255, 248, 243);
  doc.text(`Generated: ${exportDate} • Schema: v2.0`, pageWidth - margin, 18, { align: 'right' });

  y = 34;

  // 2. Patient / User Summary Card
  const userName = data.user?.name || 'Verified Patient';
  const userEmail = data.user?.email || 'N/A';
  const birthYear = data.user?.birthYear || 'N/A';
  const biologicalSeason = data.user?.biologicalSeason || 'regulating_exploring';
  const primaryConcern = data.user?.primaryConcern || 'Overall hormonal balance and wellness';

  doc.setFillColor(248, 244, 242);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'F');
  doc.setDrawColor(220, 205, 210);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...charcoal);
  doc.text(`Patient: ${userName}`, margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text(`Email: ${userEmail}  |  Birth Year: ${birthYear}`, margin + 4, y + 11);
  doc.text(`Biological Season: ${biologicalSeason.replace(/_/g, ' ')}  |  Primary Focus: ${primaryConcern}`, margin + 4, y + 16);

  y += 26;

  // 3. Menstrual Cycle History Table
  renderSectionHeader('Menstrual Cycle History & Flow Baseline', 'मासिक चक्र इतिहास');
  const cycleRows = (data.cycles || []).map((c, i) => [
    `#${i + 1}`,
    c.startDate || 'N/A',
    c.endDate || 'Ongoing',
    c.flowIntensity ? c.flowIntensity.toUpperCase() : 'MEDIUM',
    `${c.painLevel || 2} / 5`,
    (c.symptoms && c.symptoms.length > 0) ? c.symptoms.join(', ') : (c.notes || 'Normal cycle rhythm')
  ]);

  if (cycleRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedText);
    doc.text(isHindi ? 'कोई मासिक चक्र रिकॉर्ड दर्ज नहीं है।' : 'No menstrual cycle logs recorded in current period.', margin + 2, y + 4);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Cycle', 'Start Date', 'End Date', 'Flow', 'Pain', 'Symptoms & Observations']],
      body: cycleRows,
      theme: 'grid',
      headStyles: { fillColor: burgundy, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: charcoal },
      alternateRowStyles: { fillColor: [253, 248, 250] }
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 4. Comprehensive Symptoms Journal Table (Feature 3 data)
  renderSectionHeader('Longitudinal Symptom Journal & Severity Trends', 'लक्षण एवं गंभीरता का रिकॉर्ड');
  const symptomRows = (data.symptoms || []).map((s) => [
    s.date || 'N/A',
    s.name || s.category || 'Symptom',
    `${s.severity || 2} / 5`,
    s.duration || 'moderate',
    (s.contextTags && s.contextTags.length > 0) ? s.contextTags.join(', ') : 'None noted',
    s.notes || '-'
  ]);

  if (symptomRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedText);
    doc.text(isHindi ? 'कोई लक्षण रिकॉर्ड दर्ज नहीं है।' : 'No symptoms logged yet.', margin + 2, y + 4);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Symptom', 'Severity', 'Duration', 'Context Factors', 'Clinical Notes']],
      body: symptomRows,
      theme: 'grid',
      headStyles: { fillColor: deepGreen, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: charcoal },
      alternateRowStyles: { fillColor: [250, 252, 250] }
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 5. Diagnostic Laboratory Reports & Biomarkers
  renderSectionHeader('Clinical Diagnostic Reports & Biomarker Trajectories', 'लैब रिपोर्ट्स एवं बायोमार्कर्स');
  const reportRows = (data.reports || []).map((r) => [
    r.date || r.reportDate || 'N/A',
    r.title || 'Diagnostic Panel',
    r.category || 'Blood Work',
    r.labName || r.laboratory || 'Clinical Lab',
    (r.biomarkers && r.biomarkers.length > 0)
      ? r.biomarkers.map(b => `${b.name}: ${b.value} ${b.unit || ''}`).join(', ')
      : 'Structured document uploaded'
  ]);

  if (reportRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedText);
    doc.text(isHindi ? 'कोई क्लिनिकल रिपोर्ट दर्ज नहीं है।' : 'No diagnostic reports or lab panels uploaded.', margin + 2, y + 4);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Report Title', 'Category', 'Diagnostic Center', 'Key Biomarkers']],
      body: reportRows,
      theme: 'grid',
      headStyles: { fillColor: burgundy, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: charcoal },
      alternateRowStyles: { fillColor: [253, 248, 250] }
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 6. Clinical Appointments & Scheduled Visits
  renderSectionHeader('Clinical Consultations & Preparation Checklists', 'डॉक्टर परामर्श एवं अपॉइंटमेंट');
  const apptRows = (data.appointments || []).map((a) => [
    a.date || a.appointmentDate || 'N/A',
    a.providerName || 'Specialist Provider',
    a.specialty || 'Women\'s Health',
    a.time || '10:00 AM',
    a.status ? a.status.toUpperCase() : 'UPCOMING',
    a.visitReason || a.reason || 'Routine consultation'
  ]);

  if (apptRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedText);
    doc.text(isHindi ? 'कोई अपॉइंटमेंट निर्धारित नहीं है।' : 'No scheduled consultations recorded.', margin + 2, y + 4);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Healthcare Provider', 'Specialty', 'Time', 'Status', 'Consultation Purpose']],
      body: apptRows,
      theme: 'grid',
      headStyles: { fillColor: deepGreen, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: charcoal },
      alternateRowStyles: { fillColor: [250, 252, 250] }
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 7. Goals & Lifestyle Habits Summary
  renderSectionHeader('Health Goals & Daily Ambient Baseline', 'स्वास्थ्य लक्ष्य एवं दैनिक आदतें');
  const goalRows = (data.goals || []).map((g) => [
    g.title || 'Wellness Goal',
    g.category || 'Lifestyle',
    `${g.current || 0} / ${g.target || 100} ${g.unit || ''}`,
    g.status || 'in_progress'
  ]);

  if (goalRows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Goal Objective', 'Domain', 'Current Progress', 'Status']],
      body: goalRows,
      theme: 'grid',
      headStyles: { fillColor: burgundy, textColor: [255, 255, 255], fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: charcoal }
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // 8. Medical Information Disclaimer & Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 130, 135);

    // Divider line
    doc.setDrawColor(220, 210, 215);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    const disclaimerText = isHindi
      ? 'चिकित्सा अस्वीकरण: यह रिपोर्ट केवल व्यक्तिगत स्वास्थ्य ट्रैकिंग एवं डॉक्टर से परामर्श की तैयारी हेतु है। यह कोई नैदानिक निदान नहीं है।'
      : 'Medical Information Disclaimer: This Health Archive report is compiled for personal tracking and clinical consultation preparation. It does not constitute medical diagnosis or prescriptive advice.';

    doc.text(disclaimerText, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save the PDF
  const filename = `dhatri_health_report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
};
