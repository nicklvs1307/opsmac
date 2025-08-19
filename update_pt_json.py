import json

file_path = "C:/Users/Niquele/Desktop/projeto_check/check_test/frontend/src/locales/pt.json"

# Read the file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the JSON content
data = json.loads(content)

# Add the new 'uairango' object to 'translation'
data['translation']['uairango'] = {
    "error_loading_settings": "Erro ao carregar configurações do Uai Rango.",
    "settings_saved_successfully": "Configurações do Uai Rango salvas com sucesso!",
    "error_saving_settings": "Erro ao salvar configurações do Uai Rango.",
    "title": "Configurações da Integração com o Uai Rango",
    "description": "A Uai Rango possui uma API para desenvolvedores que permite a automação de tarefas para estabelecimentos. Isso inclui gerenciamento de cardápios, pedidos e controle de horários de funcionamento. Eles também oferecem webhooks para receber informações de pedidos em tempo real.",
    "key_points_title": "Pontos Chave para Integração:",
    "step1_primary": "1. Gerenciamento de Cardápios:",
    "step1_secondary": "Possibilidade de automatizar a atualização de itens e preços do seu cardápio.",
    "step2_primary": "2. Gestão de Pedidos:",
    "step2_secondary": "Receber e gerenciar pedidos diretamente em seu sistema, com webhooks para notificações em tempo real.",
    "step3_primary": "3. Controle de Horários:",
    "step3_secondary": "Automatizar a abertura e fechamento do seu estabelecimento na plataforma.",
    "step4_primary": "4. Autenticação e Documentação:",
    "step4_secondary": "Para detalhes específicos sobre autenticação (chaves de API, OAuth, etc.) e acesso à documentação completa, é provável que seja necessário entrar em contato direto com a equipe de desenvolvimento da Uai Rango ou acessar um portal de desenvolvedores específico, caso exista.",
    "documentation_guidance": "Para iniciar a integração, é recomendável buscar a documentação oficial da API da Uai Rango ou entrar em contato com o suporte para desenvolvedores para obter as credenciais e o guia de integração.",
    "api_key_label": "Uai Rango API Key",
    "api_key_required": "Uai Rango API Key é obrigatória.",
    "restaurant_id_label": "ID do Restaurante Uai Rango",
    "restaurant_id_required": "ID do Restaurante Uai Rango é obrigatório.",
    "save_button": "Salvar Configurações"
}

# Sort the keys in the 'translation' object alphabetically for better organization
data['translation'] = dict(sorted(data['translation'].items()))

# Stringify the updated JSON content with indentation for readability
updated_content = json.dumps(data, indent=2, ensure_ascii=False)

# Write the updated content back to the file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("pt.json updated successfully with uairango translations.")