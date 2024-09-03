CorreiosActiveCampaign-SistemV1

Descrição
O CorreiosActiveCampaign-SistemV1 é uma ferramenta que integra o rastreamento de encomendas dos Correios com o ActiveCampaign, permitindo a atualização de campos personalizados para contatos com base nas informações de rastreio. A ferramenta exibe informações de rastreio em uma tabela e atualiza os campos personalizados no ActiveCampaign quando você clica em "Salvar".

Funcionalidades
Rastreamento de Encomendas: Obtém informações de rastreio dos Correios para códigos fornecidos e exibe detalhes como a etapa atual e o log de rastreamento.
Integração com ActiveCampaign: Atualiza campos personalizados em contatos do ActiveCampaign com base nas informações de rastreio.
Interface de Usuário: Permite a visualização e edição das informações de rastreio e log em uma tabela.
Requisitos
Node.js: Certifique-se de ter o Node.js instalado para executar o servidor.
Token da API dos Correios: Você precisará de um token de acesso à API dos Correios.
Token da API do ActiveCampaign: Você precisará de um token de acesso à API do ActiveCampaign.
Configuração
Clone o Repositório

bash
Copiar código
git clone <URL do repositório>
cd <diretório do repositório>
Instale as Dependências

Certifique-se de estar no diretório onde o arquivo package.json está localizado e execute:

bash
Copiar código
npm install
Configure as Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis com seus valores:

plaintext
Copiar código
CORREIOS_API_TOKEN=<seu_token_dos_correios>
ACTIVECAMPAIGN_API_TOKEN=<seu_token_do_activecampaign>
Inicie o Servidor

Execute o servidor com o seguinte comando:

bash
Copiar código
npm start
O servidor estará disponível em http://localhost:3000.

Uso
Interface Web

Ativar/Desativar: Use o botão "Desativado" para ativar a tabela de rastreio. Ao ativar, a tabela será exibida e os rastreios serão atualizados automaticamente.
Salvar: Clique no botão "Salvar" para atualizar os campos personalizados no ActiveCampaign com base nas informações de rastreio.
Tabela de Rastreio

Email do Cliente: Insira o e-mail do contato do ActiveCampaign.
Código de Rastreio: Insira o código de rastreio da encomenda.
Última Atualização: A etapa atual do rastreio será exibida aqui.
Log da Mercadoria: O log detalhado do rastreio será exibido aqui.
Endpoints da API
/get-rastreio: Obtém informações de rastreio para um código fornecido.

Método: POST
Dados: { "codigoRastreio": "código do rastreio" }
Resposta: { "etapa": "descrição da etapa", "log": "log detalhado" }
/update-contact: Atualiza um campo personalizado para um contato no ActiveCampaign.

Método: POST
Dados: { "email": "email do contato", "customFieldValue": "valor do campo personalizado" }
Resposta: { "message": "Campo personalizado atualizado com sucesso!" }
Contribuições
Sinta-se à vontade para contribuir com melhorias ou correções. Faça um fork do repositório, crie uma branch para suas alterações e envie um pull request.

Licença
Este projeto é licenciado sob a Licença MIT.
