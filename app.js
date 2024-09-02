const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para obter dados do rastreio
app.post('/get-rastreio', async (req, res) => {
    const { codigoRastreio } = req.body;

    if (!codigoRastreio) {
        return res.status(400).send({ message: 'Código de rastreio não fornecido.' });
    }

    try {
        const response = await axios.get(`https://api.correios.com.br/srorastro/v1/objetos/${codigoRastreio}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CORREIOS_API_TOKEN}`
            }
        });

        console.log('Resposta da API dos Correios:', JSON.stringify(response.data, null, 2));

        const dados = response.data;

        if (dados && dados.objetos && Array.isArray(dados.objetos) && dados.objetos.length > 0) {
            const eventos = dados.objetos[0].eventos;
            
            if (eventos && eventos.length > 0) {
                const log = eventos.map(evento => {
                    const descricao = evento.descricao;
                    const unidadeEndereco = evento.unidade && evento.unidade.endereco ? 
                        ` - Cidade: ${evento.unidade.endereco.cidade}, UF: ${evento.unidade.endereco.uf}` : '';
                    return `${descricao}${unidadeEndereco}`;
                }).join(' | ');

                const etapa = eventos[0].descricao;
                res.status(200).send({ etapa, log });
            } else {
                res.status(404).send({ message: 'Log não disponível.' });
            }
        } else {
            console.log('Dados não encontrados ou estrutura inesperada:', dados);
            res.status(404).send({ message: 'Dados não encontrados para o código de rastreio fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao consultar os dados dos Correios:', error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Erro ao buscar dados do rastreio.' });
    }
});


// Rota para atualizar o campo personalizado no ActiveCampaign
app.post('/update-contact', async (req, res) => {
    const { email, codigoRastreio, etapa, log } = req.body;

    console.log('Dados recebidos:', { email, codigoRastreio, etapa, log });

    try {
        if (!email || !codigoRastreio || !etapa || log === undefined) {
            return res.status(400).send({ message: 'Email, código de rastreio, etapa ou log ausente.' });
        }

        const contactResponse = await axios.get('https://vendaseguro.api-us1.com/api/3/contacts', {
            params: { email },
            headers: {
                'Api-Token': process.env.ACTIVECAMPAIGN_API_TOKEN
            }
        });

        console.log('Resposta da API de contatos:', contactResponse.data);

        if (!contactResponse.data.contacts.length) {
            return res.status(404).send({ message: 'Contato não encontrado.' });
        }

        const contactId = contactResponse.data.contacts[0].id;

        const fieldData = [
            {
                contact: contactId,
                field: '93', // ID do campo personalizado para etapa
                value: etapa
            },
            {
                contact: contactId,
                field: '97', // ID do campo personalizado para log
                value: log
            },
            {
                contact: contactId,
                field: '98', // ID do campo personalizado para código de rastreio
                value: codigoRastreio
            }
        ];

        for (const field of fieldData) {
            try {
                await axios.post('https://vendaseguro.api-us1.com/api/3/fieldValues', {
                    fieldValue: field
                }, {
                    headers: {
                        'Api-Token': process.env.ACTIVECAMPAIGN_API_TOKEN,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (fieldError) {
                console.error(`Erro ao atualizar o campo ${field.field} para o contato ${contactId}:`, fieldError.response ? fieldError.response.data : fieldError.message);
            }
        }

        res.status(200).send({ message: 'Campos personalizados atualizados com sucesso!✅' });
    } catch (error) {
        console.error('Update Contact Error:', error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Ocorreu um erro ao atualizar os campos personalizados.❌' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
