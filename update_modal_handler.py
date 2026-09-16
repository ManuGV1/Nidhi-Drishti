import sys, re

# 1. Update WorkIntelligenceModal.jsx
with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add handleInitiateCase logic
old_initiate = '''          {/* DOSSIER FOOTER ACTIONS */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
            <button
              onClick={() => onInitiateCase && onInitiateCase(item || work)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>INITIATE INVESTIGATION CASE</span>
            </button>'''

new_initiate_handler = '''  const handleInitiateCase = async () => {
    setCreatingCase(true);
    try {
      const payload = {
        work_type: workType || item.work_type || 'RECOMMENDED',
        source_row_id: item.source_row_id || work.id || item.anomaly_id || 1,
        priority: riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        assigned_to: 'Inspector General - Public Audit'
      };
      await apiService.createInvestigationCase(payload);
      if (onInitiateCase) {
        onInitiateCase(item || work);
      } else {
        onClose();
        navigate('/investigations');
      }
    } catch (err) {
      console.error('Failed to create investigation case:', err);
      if (onInitiateCase) onInitiateCase(item || work);
      else navigate('/investigations');
    } finally {
      setCreatingCase(false);
    }
  };'''

if 'handleInitiateCase' not in text:
    text = text.replace('if (!isOpen) return null;', new_initiate_handler + '\n\n  if (!isOpen) return null;')

new_footer = '''          {/* DOSSIER FOOTER ACTIONS */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
            <button
              onClick={handleInitiateCase}
              disabled={creatingCase}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{creatingCase ? 'Creating Case...' : 'INITIATE INVESTIGATION CASE'}</span>
            </button>'''

text = text.replace(old_initiate, new_footer)

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('WorkIntelligenceModal updated with handleInitiateCase')