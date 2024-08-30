$(document).ready(function() {
    let isActive = false;

    $('#toggleButton').on('click', function() {
        isActive = !isActive;
        if (isActive) {
            $(this).removeClass('inactive').addClass('active').text('Ativo');
            $('#correiosTable').show();
            $('#statusIndicator').removeClass('inactive').addClass('active'); // Atualiza a bolinha para verde
        } else {
            $(this).removeClass('active').addClass('inactive').text('Desativado');
            $('#correiosTable').hide();
            $('#statusIndicator').removeClass('active').addClass('inactive'); // Atualiza a bolinha para vermelha
        }
    });

    $('#saveButton').on('click', function() {
        const rows = $('#correiosTable tbody tr');
        let promises = [];

        // Iterar sobre todas as linhas da tabela
        rows.each(function() {
            const row = $(this);
            const email = row.find('.email-input').val();
            const etapa = row.find('.etapa-input').val();

            if (email && etapa) {
                // Adicionar uma promise para cada atualização de contato
                promises.push(atualizarActiveCampaign(email, etapa));
            }
        });

        // Esperar que todas as promessas sejam resolvidas
        Promise.all(promises)
            .then(() => {
                alert('Todos os campos personalizados foram atualizados com sucesso!');
            })
            .catch(error => {
                console.error('Erro ao atualizar os campos personalizados:', error);
                alert('Erro ao atualizar alguns campos personalizados.');
            });
    });

    function atualizarActiveCampaign(email, customFieldValue) {
        console.log('Enviando para atualização:', { email, customFieldValue });
        return $.ajax({
            url: '/update-contact',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                customFieldValue: customFieldValue
            }),
            success: function(response) {
                console.log(`Atualizado com sucesso para o email: ${email}`, response);
            },
            error: function(response) {
                console.error(`Erro ao atualizar para o email ${email}:`, response.responseJSON.message || 'Erro desconhecido');
            }
        });
    }
});
