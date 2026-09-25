// Citizen Evidence & Investigation Report Service
// Stores and manages citizen-submitted evidence, verification status, and case linking.

const STORAGE_KEY = 'nidhi_drishti_citizen_evidence_v1';

const SEED_EVIDENCE = [
  {
    evidence_id: 'CEV-2026-849201',
    title: 'Substandard Bitumen Depth at SH-42 Bypass',
    issue_category: 'Material Quality Defect',
    description: 'Measured bitumen carpet thickness is 35mm against sanctioned 75mm specification in official PWD BOQ.',
    state_name: 'Karnataka',
    district_name: 'Shivamogga',
    constituency_name: 'Shivamogga Rural',
    location_address: 'SH-42 Kilometre 14, Near Bus Depot',
    coordinates: '13.9299° N, 75.5681° E',
    incident_datetime: '2026-09-24 14:30:00',
    status: 'VERIFIED',
    photos: ['bitumen_core_sample.jpg', 'measurement_tape_photo.jpg'],
    videos: ['asphalt_inspection_video.mp4'],
    documents: ['sanction_boq_extract.pdf'],
    submitted_at: '2026-09-24T14:30:00+05:30',
    linked_case_id: 'CASE-2026-001',
    linked_work_id: 'WORK-10492',
    verification_notes: 'Verified by Field Inspection Team. Core thickness mismatch confirmed against baseline.',
    verified_by: 'Inspector General - Public Audit',
    verified_at: '2026-09-24T16:15:00+05:30'
  },
  {
    evidence_id: 'CEV-2026-302194',
    title: 'Unexecuted Community Hall Foundation in Ward 8',
    issue_category: 'Unexecuted Work',
    description: 'Work is marked 60% complete in portal ledger but site remains vacant farmland with no physical excavation.',
    state_name: 'Karnataka',
    district_name: 'Bengaluru Urban',
    constituency_name: 'Bengaluru South',
    location_address: 'Ward 8 Sub-station Road',
    coordinates: '12.9716° N, 77.5946° E',
    incident_datetime: '2026-09-23 11:00:00',
    status: 'PENDING_VERIFICATION',
    photos: ['vacant_plot_overview.jpg'],
    videos: [],
    documents: ['locality_survey_map.pdf'],
    submitted_at: '2026-09-23T11:15:00+05:30',
    linked_case_id: null,
    linked_work_id: 'WORK-20419',
    verification_notes: null,
    verified_by: null,
    verified_at: null
  }
];

export const citizenEvidenceService = {
  getEvidences: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_EVIDENCE));
        return SEED_EVIDENCE;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading citizen evidence storage:', e);
      return SEED_EVIDENCE;
    }
  },

  submitEvidence: (data) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newEvidence = {
      evidence_id: `CEV-2026-${randomDigits}`,
      title: data.title || 'Citizen Ground Observation Report',
      issue_category: data.issue_category || 'Physical Progress Discrepancy',
      description: data.description || '',
      state_name: data.state_name || 'Karnataka',
      district_name: data.district_name || 'Shivamogga',
      constituency_name: data.constituency_name || 'Shivamogga',
      location_address: data.location_address || 'Site Location Unspecified',
      coordinates: data.coordinates || 'N/A',
      incident_datetime: data.incident_datetime || new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'PENDING_VERIFICATION',
      photos: data.photos || (data.photoName ? [data.photoName] : []),
      videos: data.videos || (data.videoName ? [data.videoName] : []),
      documents: data.documents || (data.docName ? [data.docName] : []),
      submitted_at: new Date().toISOString(),
      linked_case_id: data.linked_case_id || null,
      linked_work_id: data.linked_work_id || null,
      verification_notes: null,
      verified_by: null,
      verified_at: null
    };

    const current = citizenEvidenceService.getEvidences();
    const updated = [newEvidence, ...current];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error updating citizen evidence storage:', e);
    }
    return newEvidence;
  },

  verifyEvidence: (evidenceId, notes, verifiedBy = 'Oversight Investigator') => {
    const current = citizenEvidenceService.getEvidences();
    const updated = current.map(item => {
      if (item.evidence_id === evidenceId) {
        return {
          ...item,
          status: 'VERIFIED',
          verification_notes: notes || 'Verified by authorized oversight officer.',
          verified_by: verifiedBy,
          verified_at: new Date().toISOString()
        };
      }
      return item;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error updating citizen evidence:', e);
    }
    return updated.find(item => item.evidence_id === evidenceId);
  },

  rejectEvidence: (evidenceId, notes) => {
    const current = citizenEvidenceService.getEvidences();
    const updated = current.map(item => {
      if (item.evidence_id === evidenceId) {
        return {
          ...item,
          status: 'REJECTED',
          verification_notes: notes || 'Evidence submission rejected after audit review.',
          verified_at: new Date().toISOString()
        };
      }
      return item;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error updating citizen evidence:', e);
    }
    return updated.find(item => item.evidence_id === evidenceId);
  },

  linkToCase: (evidenceId, caseId) => {
    const current = citizenEvidenceService.getEvidences();
    const updated = current.map(item => {
      if (item.evidence_id === evidenceId) {
        return {
          ...item,
          linked_case_id: caseId
        };
      }
      return item;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error linking evidence to case:', e);
    }
    return updated.find(item => item.evidence_id === evidenceId);
  }
};
