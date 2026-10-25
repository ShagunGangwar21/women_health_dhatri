import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

const HealthDataContext = createContext();

export const HealthDataProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [cycleData, setCycleData] = useState({ cycleLogs: [], estimates: null, isMenstruating: true });
  const [symptoms, setSymptoms] = useState([]);
  const [symptomStats, setSymptomStats] = useState({ distribution: {}, totalLogs: 0 });
  const [dailyData, setDailyData] = useState({ logs: [], todayLog: null, stats: { avgSleep: 7, avgEnergy: 3, avgWater: 6 } });
  const [reportData, setReportData] = useState({ reports: [], biomarkerHistory: {}, totalReports: 0 });
  const [appointments, setAppointments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Authenticated fetch helper
  const authFetch = useCallback(async (url, options = {}) => {
    if (!token) return null;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        }
      });
      return res;
    } catch (err) {
      console.warn(`authFetch error on ${url}:`, err);
      return null;
    }
  }, [token]);

  // Fetch alerts separately for fast feedback
  const refreshAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authFetch('/api/alerts');
      if (res?.ok) {
        const d = await res.json();
        setAlerts(d.alerts || []);
        setAllAlerts(d.allAlerts || []);
        setDismissedCount(d.dismissedCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching alerts:', err);
    }
  }, [token, authFetch]);

  // Fetch all health modules
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    try {
      const [cycleRes, sympRes, dailyRes, repRes, apptRes, goalsRes, alertRes] = await Promise.all([
        authFetch('/api/cycle'),
        authFetch('/api/symptoms'),
        authFetch('/api/daily'),
        authFetch('/api/reports'),
        authFetch('/api/appointments'),
        authFetch('/api/goals'),
        authFetch('/api/alerts')
      ]);

      if (cycleRes?.ok) {
        const d = await cycleRes.json();
        setCycleData({
          cycleLogs: d.cycleLogs || [],
          estimates: d.estimates || null,
          isMenstruating: d.isMenstruating !== false
        });
      }
      if (sympRes?.ok) {
        const d = await sympRes.json();
        setSymptoms(d.symptoms || []);
        setSymptomStats({ distribution: d.distribution || {}, totalLogs: d.totalLogs || 0 });
      }
      if (dailyRes?.ok) {
        const d = await dailyRes.json();
        setDailyData(d);
      }
      if (repRes?.ok) {
        const d = await repRes.json();
        setReportData(d);
      }
      if (apptRes?.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (goalsRes?.ok) {
        const d = await goalsRes.json();
        setGoals(d.goals || []);
      }
      if (alertRes?.ok) {
        const d = await alertRes.json();
        setAlerts(d.alerts || []);
        setAllAlerts(d.allAlerts || []);
        setDismissedCount(d.dismissedCount || 0);
      }
    } catch (err) {
      console.warn('Error refreshing health data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, authFetch]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setCycleData({ cycleLogs: [], estimates: null, isMenstruating: true });
      setSymptoms([]);
      setDailyData({ logs: [], todayLog: null, stats: { avgSleep: 7, avgEnergy: 3, avgWater: 6 } });
      setReportData({ reports: [], biomarkerHistory: {}, totalReports: 0 });
      setAppointments([]);
      setGoals([]);
      setAlerts([]);
      setAllAlerts([]);
      setDismissedCount(0);
    }
  }, [isAuthenticated, refreshAll]);

  // Actions — Cycle
  const logPeriod = async (entry) => {
    const res = await authFetch('/api/cycle', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  const deletePeriod = async (id) => {
    const res = await authFetch(`/api/cycle/${id}`, { method: 'DELETE' });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  // Actions — Symptoms
  const logSymptom = async (entry) => {
    const res = await authFetch('/api/symptoms', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    let data = null;
    try {
      if (res) data = await res.json();
    } catch (e) {}

    if (res?.ok && data?.success) {
      refreshAll();
      return { success: true, count: data.count || 1, message: data.message };
    }
    return {
      success: false,
      message: data?.message || (res ? `Error (${res.status}): Failed to record symptoms.` : 'Network connection error.')
    };
  };

  const deleteSymptom = async (id) => {
    const res = await authFetch(`/api/symptoms/${id}`, { method: 'DELETE' });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  // Actions — Daily Check-In
  const saveDailyCheckIn = async (entry) => {
    const res = await authFetch('/api/daily', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  // Actions — Reports
  const uploadReport = async (entry) => {
    const res = await authFetch('/api/reports/upload', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  const deleteReport = async (id) => {
    const res = await authFetch(`/api/reports/${id}`, { method: 'DELETE' });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  // Actions — Appointments
  const createAppointment = async (entry) => {
    const payload = {
      ...entry,
      date: entry.date || entry.appointmentDate
    };
    const res = await authFetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    let data = null;
    try {
      if (res) data = await res.json();
    } catch (e) {}

    if (res?.ok && data?.success) {
      if (data.appointment) {
        setAppointments(prev => {
          const filtered = prev.filter(a => (a._id || a.id) !== (data.appointment._id || data.appointment.id));
          return [...filtered, data.appointment];
        });
      }
      refreshAll();
      return { success: true, message: data.message, appointment: data.appointment };
    }
    return {
      success: false,
      message: data?.message || (res ? `Error (${res.status}): Failed to schedule appointment.` : 'Network connection error.')
    };
  };

  const cancelAppointment = async (id) => {
    const res = await authFetch(`/api/appointments/${id}`, { method: 'DELETE' });
    let data = null;
    try {
      if (res) data = await res.json();
    } catch (e) {}

    if (res?.ok && data?.success) {
      setAppointments(prev => prev.map(a => (a._id === id || a.id === id) ? { ...a, status: 'cancelled' } : a));
      refreshAll();
      return { success: true, message: data.message, appointment: data.appointment };
    }
    return {
      success: false,
      message: data?.message || (res ? `Error (${res.status}): Failed to cancel appointment.` : 'Network connection error.')
    };
  };

  // Actions — Goals
  const addGoal = async (entry) => {
    const res = await authFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  const updateGoal = async (id, updates) => {
    const res = await authFetch(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  const updateGoalProgress = async (id, currentVal) => {
    const res = await authFetch(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ current: currentVal, currentValue: currentVal })
    });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  const deleteGoal = async (id) => {
    const res = await authFetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res?.ok) refreshAll();
    return res?.ok;
  };

  // Actions — Alerts
  const dismissAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setDismissedCount(c => c + 1);
    const res = await authFetch(`/api/alerts/${id}/dismiss`, { method: 'POST' });
    if (res?.ok) refreshAlerts();
    return res?.ok;
  };

  const restoreAlerts = async () => {
    const res = await authFetch('/api/alerts/restore', { method: 'POST' });
    if (res?.ok) refreshAlerts();
    return res?.ok;
  };

  // Convenient Aliases for Seamless Component Compatibility
  const cycles = cycleData?.cycleLogs || [];
  const reports = reportData?.reports || [];
  const currentCyclePhase = cycleData?.estimates?.currentPhase || 'follicular';

  // Actions — Trends & Doctor Dossier
  const fetchTrends = useCallback(async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`/api/symptoms/trends?${query}`);
    if (res?.ok) {
      return await res.json();
    }
    return null;
  }, [authFetch]);

  const fetchDoctorSummary = useCallback(async () => {
    const res = await authFetch('/api/symptoms/doctor-summary');
    if (res?.ok) {
      return await res.json();
    }
    return null;
  }, [authFetch]);

  return (
    <HealthDataContext.Provider value={{
      loading,
      cycleData,
      cycles,
      currentCyclePhase,
      symptoms,
      symptomStats,
      dailyData,
      reportData,
      reports,
      appointments,
      goals,
      alerts,
      allAlerts,
      dismissedCount,
      refreshAll,
      refreshAlerts,
      dismissAlert,
      restoreAlerts,
      logPeriod,
      deletePeriod,
      logSymptom,
      deleteSymptom,
      saveDailyCheckIn,
      uploadReport,
      deleteReport,
      createAppointment,
      scheduleAppointment: createAppointment,
      cancelAppointment,
      addGoal,
      updateGoal,
      updateGoalProgress,
      deleteGoal,
      fetchTrends,
      fetchDoctorSummary
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) throw new Error('useHealthData must be used within HealthDataProvider');
  return context;
};
