import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add AR and LA entries if not already present
ar_entry = '''  {
    "code": "AR",
    "name": "Arunachal Pradesh",
    "path": "M 495.0,215.0 L 510.0,200.0 L 530.0,185.0 L 555.0,170.0 L 580.0,165.0 L 605.0,175.0 L 620.0,190.0 L 610.0,210.0 L 590.0,225.0 L 570.0,235.0 L 555.0,225.0 L 535.0,220.0 L 515.0,225.0 L 495.0,215.0 Z"
  },
  {
    "code": "LA",
    "name": "Ladakh",
    "path": "M 175.0,75.0 L 190.0,50.0 L 215.0,30.0 L 245.0,25.0 L 265.0,45.0 L 260.0,75.0 L 240.0,100.0 L 210.0,110.0 L 190.0,105.0 L 175.0,75.0 Z"
  },'''

if '"code": "AR"' not in text:
    text = text.replace('const DETAILED_INDIA_STATES = [', 'const DETAILED_INDIA_STATES = [\n' + ar_entry)
    print('Added AR and LA to DETAILED_INDIA_STATES')

# Update getStateInfo logic to handle all name variations robustly
old_get_state_info = '''  const getStateInfo = (code, name) => {
    return statesData.find(
      (s) =>
        s.state_code === code ||
        s.state_name?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.state_name?.toLowerCase())
    );
  };'''

new_get_state_info = '''  const getStateInfo = (code, name) => {
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

if 'const normName = (name || \'\')' not in text:
    text = text.replace(old_get_state_info, new_get_state_info)
    print('Updated getStateInfo matching logic')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('IndiaMap.jsx updated successfully')