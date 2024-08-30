import requests

# Defina as variáveis
api_url = "https://vendaseguro.api-us1.com/api/3/fields"
api_token = "386735bf1ce5078c027bd22c1267e13afa1b17620fd6ed9574591f6c50072e759f96a51d"

# Faça a requisição
response = requests.get(api_url, headers={"Api-Token": api_token})

# Verifique o status da resposta
if response.status_code == 200:
    data = response.json()
    fields = data.get('fields', [])
    for field in fields:
        print(f"ID: {field['id']}, Nome: {field['title']}")
else:
    print(f"Erro ao buscar campos: {response.status_code}")
