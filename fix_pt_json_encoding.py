import json

file_path = "C:/Users/Niquele/Desktop/projeto_check/check_test/frontend/src/locales/pt.json"

# Read the file content with explicit UTF-8 encoding
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the JSON content
data = json.loads(content)

# Stringify the JSON content with indentation and ensure_ascii=False for proper character encoding
updated_content = json.dumps(data, indent=2, ensure_ascii=False)

# Write the updated content back to the file with explicit UTF-8 encoding
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("pt.json encoding fixed successfully.")
