from pathlib import Path
import re

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
pattern = r'styles=\{\{ body: \{ padding: ([0-9]+) \} \}\}>'
new_text = re.sub(pattern, r'styles={{ body: { padding: \1 } }}}>', text)
if new_text != text:
    path.write_text(new_text, encoding='utf-8')
    print('updated')
else:
    print('no changes')
