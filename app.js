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

        // Adiciona um log para ver a resposta completa
        console.log('Resposta da API dos Correios:', response.data);

        const dados = response.data;

        if (dados && dados.objetos && dados.objetos.length > 0) {
            const eventos = dados.objetos[0].eventos;
            const etapa = eventos.length > 0 ? eventos[0].descricao : 'Dados não disponíveis';
            res.status(200).send({ etapa });
        } else {
            res.status(404).send({ message: 'Dados não encontrados para o código de rastreio fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao consultar os dados dos Correios:', error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Erro ao buscar dados do rastreio.' });
    }
});

// Rota para atualizar o campo personalizado no ActiveCampaign
app.post('/update-contact', async (req, res) => {
    const { email, customFieldValue } = req.body;

    console.log('Dados recebidos:', { email, customFieldValue });

    try {
        if (!email || !customFieldValue) {
            return res.status(400).send({ message: 'Email ou valor do campo personalizado ausente.' });
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

        const customFieldData = {
            fieldValue: {
                contact: contactId,
                field: '93',
                value: customFieldValue
            }
        };

        const fieldResponse = await axios.post('https://vendaseguro.api-us1.com/api/3/fieldValues', customFieldData, {
            headers: {
                'Api-Token': process.env.ACTIVECAMPAIGN_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log('Resposta da API de atualização de campo:', fieldResponse.data);

        res.status(200).send({ message: 'Campo personalizado atualizado com sucesso!' });
    } catch (error) {
        console.error('Update Contact Error:', error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Ocorreu um erro ao atualizar o campo personalizado.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
