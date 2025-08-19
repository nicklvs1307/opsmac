import json

file_path = "C:/Users/Niquele/Desktop/projeto_check/check_test/frontend/src/locales/pt.json"

# Read the file content as binary
with open(file_path, 'rb') as f:
    binary_content = f.read()

# Try to decode with latin-1, then encode to utf-8
try:
    decoded_content = binary_content.decode('latin-1')
    re_encoded_content = decoded_content.encode('utf-8')
except UnicodeDecodeError:
    print("Could not decode with latin-1. Trying utf-8 directly.")
    decoded_content = binary_content.decode('utf-8')
    re_encoded_content = decoded_content.encode('utf-8')

# Parse the JSON content from the correctly encoded string
data = json.loads(re_encoded_content.decode('utf-8'))

# Stringify the JSON content with indentation and ensure_ascii=False for proper character encoding
final_content = json.dumps(data, indent=2, ensure_ascii=False)

# Write the updated content back to the file with explicit UTF-8 encoding
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("pt.json encoding forcefully fixed to UTF-8.")
