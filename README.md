CorreiosActiveCampaign-SistemV1

Descrição
O CorreiosActiveCampaign-SistemV1 é uma ferramenta que integra o rastreamento de encomendas dos Correios com o ActiveCampaign. Ela permite a atualização de campos personalizados para contatos com base nas informações de rastreio. A ferramenta exibe informações de rastreio em uma tabela e atualiza automaticamente os campos personalizados no ActiveCampaign quando o código de rastreio é inserido.

Funcionalidades
Rastreamento de Encomendas: Obtém informações de rastreio dos Correios para códigos fornecidos e exibe detalhes como a etapa atual, data prevista para a entrega, última atualização, e o log de rastreamento.
Integração com ActiveCampaign: Atualiza campos personalizados em contatos do ActiveCampaign com base nas informações de rastreio.
Interface de Usuário: Permite a visualização e edição das informações de rastreio e log em uma tabela.
Campos Adicionais: Inclui campos para a data e hora da última atualização e a data prevista para a entrega.

Requisitos
Node.js: Certifique-se de ter o Node.js instalado para executar o servidor.
Token da API dos Correios: Você precisará de um token de acesso à API dos Correios.
Token da API do ActiveCampaign: Você precisará de um token de acesso à API do ActiveCampaign.
Configuração

1.Clone o Repositório
git clone <URL do repositório>
cd <diretório do repositório>

2.Instale as Dependências
Certifique-se de estar no diretório onde o arquivo package.json está localizado e execute:
npm install

3.Configure as Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis com seus valores:

CORREIOS_API_TOKEN=<seu_token_dos_correios>
ACTIVECAMPAIGN_API_TOKEN=<seu_token_do_activecampaign>

4.Inicie o Servidor
Execute o servidor com o seguinte comando:
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
Data e Hora da Última Atualização: A data e hora da última atualização será exibida aqui. (Campo de entrada ajustado para datetime-local no HTML).
Data Prevista para a Entrega: Informa a previsão de entrega para o usuário. (Campo de entrada ajustado para date no HTML).
Log da Mercadoria: O log detalhado do rastreio será exibido aqui.
Log do Sistema: O log do sistema informa a todo momento os acontecimentos e atualizações da tabela e deixa os mesmos registrados.
Endpoints da API
/get-rastreio: Obtém informações de rastreio para um código fornecido.

Método: POST
Dados: { "codigoRastreio": "código do rastreio" }
Resposta: { "etapa": "descrição da etapa", "log": "log detalhado", "dataHoraAtualizacao": "data e hora da última atualização", "dataPrevistaEntrega": "data prevista de entrega" }
/update-contact: Atualiza campos personalizados para um contato no ActiveCampaign.

Método: POST
Dados: { "email": "email do contato", "codigoRastreio": "código do rastreio", "etapa": "etapa do rastreio", "log": "log detalhado", "dataHoraAtualizacao": "data e hora da última atualização", "dataPrevistaEntrega": "data prevista de entrega" }
Resposta: { "message": "Campos atualizados com sucesso." }
Contribuições
Sinta-se à vontade para contribuir com melhorias ou correções. Faça um fork do repositório, crie uma branch para suas alterações e envie um pull request.

Licença
Este projeto é licenciado sob a Licença MIT.
