import json

file_path = "C:/Users/Niquele/Desktop/projeto_check/check_test/frontend/src/locales/pt.json"

# Read the file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the JSON content
data = json.loads(content)

# Add the new 'pdv' key to 'sidebar'
data['translation']['sidebar']['pdv'] = "PDV"

# Sort the keys in the 'sidebar' object alphabetically for better organization
data['translation']['sidebar'] = dict(sorted(data['translation']['sidebar'].items()))

# Stringify the updated JSON content with indentation for readability
updated_content = json.dumps(data, indent=2, ensure_ascii=False)

# Write the updated content back to the file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("pt.json sidebar pdv key updated successfully.")
