import re

path = 'd:/NidhiDristi/frontend/src/pages/CommandCenterPage.jsx'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    t = f.read()

# Replace any lingering mojibake sequences with clean text/HTML entities/unicode
t = re.sub(r'[\ufffd\u00c2\u00e2\u201a\u00b9\u00a6\u0094\u2020\u2019]+1?', '₹', t)
t = t.replace('[A]', '').replace('[W]', '').replace('[C]', '').replace('[R]', '')

# Replace formatINR function to use clean unicode string
format_old = """  const formatINR = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return ₹ Cr;
    } else if (val >= 100000) {
      return ₹ Lakh;
    }
    return ₹;
  };"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(t)

print("CommandCenterPage.jsx cleaned successfully")