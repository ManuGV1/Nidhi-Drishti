import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_logic = '''  const getStateInfo = (code, name) => {
    if (!statesData || !statesData.length) return null;
    const normName = (name || '').toLowerCase().replace(/[^a-z]/g, '');
    return statesData.find((s) => {
      if (s.state_code === code) return true;
      const sNorm = (s.state_name || '').toLowerCase().replace(/[^a-z]/g, '');
      if (sNorm === normName) return true;
      if (normName === 'jammuandkashmir' && (sNorm.includes('jammu') || sNorm.includes('ladakh'))) return true;
      if (normName === 'ladakh' && (sNorm.includes('ladakh') || sNorm.includes('jammu'))) return true;
      if (normName === 'pondicherry' && sNorm.includes('puducherry')) return true;
      if (normName === 'puducherry' && sNorm.includes('pondicherry')) return true;
      if (normName === 'arunachalpradesh' && sNorm.includes('arunachal')) return true;
      if (normName.includes('daman') && sNorm.includes('dadra')) return true;
      if (normName.includes('dadra') && sNorm.includes('daman')) return true;
      return sNorm.includes(normName) || normName.includes(sNorm);
    });
  };'''

new_logic = '''  const getStateInfo = (code, name) => {
    if (!statesData || !statesData.length) return null;
    const normName = (name || '').toLowerCase().replace(/[^a-z]/g, '');
    return statesData.find((s) => {
      if (s.state_code === code) return true;
      const sNorm = (s.state_name || '').toLowerCase().replace(/[^a-z]/g, '');
      if (sNorm === normName) return true;
      if ((normName.includes('pondi') || normName.includes('puduch')) && (sNorm.includes('pondi') || sNorm.includes('puduch'))) return true;
      if (normName === 'jammuandkashmir' && (sNorm.includes('jammu') || sNorm.includes('ladakh'))) return true;
      if (normName === 'ladakh' && (sNorm.includes('ladakh') || sNorm.includes('jammu'))) return true;
      if (normName === 'arunachalpradesh' && sNorm.includes('arunachal')) return true;
      if ((normName.includes('daman') || normName.includes('dadra')) && (sNorm.includes('daman') || sNorm.includes('dadra'))) return true;
      return sNorm.includes(normName) || normName.includes(sNorm);
    });
  };'''

text = text.replace(old_logic, new_logic)
with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated getStateInfo matching for Puducherry')