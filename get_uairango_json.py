import json

file_path = "C:/Users/Niquele/Desktop/projeto_check/check_test/frontend/src/locales/pt.json"

# Read the file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the JSON content
data = json.loads(content)

# Extract and print the 'uairango' object
if 'translation' in data and 'uairango' in data['translation']:
    print(json.dumps(data['translation']['uairango'], indent=2, ensure_ascii=False))
else:
    print("'uairango' object not found in pt.json")
