from pathlib import Path
import re

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
new = re.sub(r'styles=\{\{ body: \{ padding: ([0-9]+) \} \} \}', r'style={{ padding: \1 }}', text)
if new != text:
    path.write_text(new, encoding='utf-8')
    print('updated')
else:
    print('no changes')
