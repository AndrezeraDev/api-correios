const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para obter todos os dados dos Correios
app.get('/get-all-correios-data', async (req, res) => {
    try {
        // Supondo que você tenha uma lista de e-mails para consultar todos os dados
        const emails = ['email1@example.com', 'email2@example.com']; // Substitua com a lista real de e-mails

        const dados = await Promise.all(emails.map(async (email) => {
            const correiosResponse = await axios.get('https://api.correios.com.br/srorastro/v1/objetos', {
                params: { email },
            });

            const customFieldValue = correiosResponse.data.etapa; // Etapa do percurso
            const codigoRastreio = correiosResponse.data.codigo; // Código de rastreio

            return { email, customFieldValue, codigoRastreio };
        }));

        res.status(200).send({ success: true, dados });
    } catch (error) {
        console.error('Erro ao consultar os dados dos Correios:', error);
        res.status(500).send({ success: false, message: 'Erro ao consultar os dados dos Correios.' });
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
