from pathlib import Path
import re
text = Path('src/App.jsx').read_text(encoding='utf-8')
opens = len(re.findall(r'<Text(?:\s|>)', text))
closes = len(re.findall(r'</Text>', text))
print('opens', opens, 'closes', closes)
for i, m in enumerate(re.finditer(r'<Text(?:\s[^>]*)?>', text), 1):
    print('open', i, 'line', text.count('\n', 0, m.start()) + 1, repr(m.group(0)))
for i, m in enumerate(re.finditer(r'</Text>', text), 1):
    print('close', i, 'line', text.count('\n', 0, m.start()) + 1)
