from pathlib import Path
path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8').splitlines()
for n in range(1125, 1136):
    print(n+1, repr(text[n]))
