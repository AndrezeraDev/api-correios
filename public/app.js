$(document).ready(function() {
    let isActive = false;

    $('#toggleButton').on('click', function() {
        isActive = !isActive;
        if (isActive) {
            $(this).removeClass('inactive').addClass('active').text('Ativo');
            $('#correiosTable').show();
            $('#statusIndicator').removeClass('inactive').addClass('active');
            $('.background-image').addClass('show-image'); // Exibe a imagem
            atualizarTodosOsRastreios(); // Atualizar todos os rastreios automaticamente ao ativar
        } else {
            $(this).removeClass('active').addClass('inactive').text('Desativado');
            $('#correiosTable').hide();
            $('#statusIndicator').removeClass('active').addClass('inactive');
            $('.background-image').removeClass('show-image'); // Oculta a imagem
        }
    });

    function atualizarTodosOsRastreios() {
        const rows = $('#correiosTable tbody tr');
    
        rows.each(function() {
            const row = $(this);
            const codigoRastreio = row.find('.codigo-input').val();
            const etapaInput = row.find('.etapa-input');
            const logInput = row.find('.log-input');
    
            if (codigoRastreio) {
                $.ajax({
                    url: '/get-rastreio',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ codigoRastreio: codigoRastreio }),
                    success: function(response) {
                        if (response.etapa) {
                            etapaInput.val(response.etapa);
                            logInput.val(response.log || 'Log não disponível.');
                        } else {
                            etapaInput.val('Dados não disponíveis.');
                            logInput.val('Log não disponível.');
                        }
                    },
                    error: function() {
                        etapaInput.val('Erro ao buscar dados.');
                        logInput.val('Erro ao buscar dados.');
                    }
                });
            }
        });
    }

    $('#saveButton').on('click', function() {
        const rows = $('#correiosTable tbody tr');
        let promises = [];
    
        rows.each(function() {
            const row = $(this);
            const email = row.find('.email-input').val();
            const etapa = row.find('.etapa-input').val();
            const log = row.find('.log-input').val();  // Obtenha o valor do log
    
            if (email && etapa && log) {
                promises.push(atualizarActiveCampaign(email, etapa, log));
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
    
    function atualizarActiveCampaign(email, etapa, log) {
        console.log('Enviando dados para atualização:', { email, etapa, log });
    
        return $.ajax({
            url: '/update-contact',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                etapa: etapa,
                log: log
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