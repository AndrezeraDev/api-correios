$(document).ready(function() {
    let isActive = false;

    $('#toggleButton').on('click', function() {
        isActive = !isActive;
        if (isActive) {
            $(this).removeClass('inactive').addClass('active').text('Ativo');
            $('#correiosTable').show();
            $('#statusIndicator').removeClass('inactive').addClass('active');
        } else {
            $(this).removeClass('active').addClass('inactive').text('Desativado');
            $('#correiosTable').hide();
            $('#statusIndicator').removeClass('active').addClass('inactive');
        }
    });

    // Evento para atualizar a etapa do percurso automaticamente
    $('#correiosTable').on('input', '.codigo-input', function() {
        const codigoRastreio = $(this).val();
        const etapaInput = $(this).closest('tr').find('.etapa-input');

        if (codigoRastreio) {
            $.ajax({
                url: '/get-rastreio',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ codigoRastreio: codigoRastreio }),
                success: function(response) {
                    console.log('Resposta do servidor:', response); // Log para depuração
                    if (response.etapa) {
                        etapaInput.val(response.etapa);
                    } else {
                        etapaInput.val('Dados não disponíveis.');
                    }
                },
                error: function() {
                    etapaInput.val('Erro ao buscar dados.');
                }
            });
        } else {
            etapaInput.val('');
        }
    });

    $('#saveButton').on('click', function() {
        const rows = $('#correiosTable tbody tr');
        let promises = [];

        rows.each(function() {
            const row = $(this);
            const email = row.find('.email-input').val();
            const etapa = row.find('.etapa-input').val();

            if (email && etapa) {
                promises.push(atualizarActiveCampaign(email, etapa));
            }
        });

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
