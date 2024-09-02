$(document).ready(function() {
    // Redefine console.log para capturar logs na área de log
    (function() {
        const originalConsoleLog = console.log;
        const logOutput = document.getElementById('logOutput');

        console.log = function(message) {
            // Chama o método original
            originalConsoleLog.apply(console, arguments);

            // Atualiza a área de log
            if (logOutput) {
                const formattedMessage = Array.from(arguments).map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                ).join(' ');
                logOutput.textContent += formattedMessage + '\n';
                logOutput.scrollTop = logOutput.scrollHeight; // Auto scroll para o final
            }
        };
    })();

    // Função para adicionar mensagens ao log
    function addLog(message) {
        console.log(message); // Usa a redefinição do console.log para atualizar a área de log
    }

    let isActive = false;

    $('#toggleButton').on('click', function() {
        isActive = !isActive;
        if (isActive) {
            $(this).removeClass('inactive').addClass('active').text('Ativo');
            $('#correiosTable').show();
            $('#statusIndicator').removeClass('inactive').addClass('active');
            $('.background-image').addClass('show-image');
            atualizarTodosOsRastreios(); // Atualiza todos os rastreios automaticamente ao ativar
            $('#logContainer').show(); // Mostra o container de log
        } else {
            $(this).removeClass('active').addClass('inactive').text('Desativado');
            $('#correiosTable').hide();
            $('#statusIndicator').removeClass('active').addClass('inactive');
            $('.background-image').removeClass('show-image');
            $('#logContainer').hide(); // Oculta o container de log
        }
    });

    // Função para atualizar os rastreios em todas as linhas
    function atualizarTodosOsRastreios() {
        const rows = $('#correiosTable tbody tr');

        for (let i = 0; i < rows.length; i++) {
            const row = $(rows[i]);
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
                        etapaInput.val(response.etapa);
                        logInput.val(response.log);
                        addLog(`🟢Rastreio ${codigoRastreio} atualizado✅: Etapa📦 - ${response.etapa}, Log💾 - ${response.log}`);
                    },
                    error: function(xhr) {
                        addLog(`Erro ao atualizar rastreio ${codigoRastreio}: ${xhr.responseText}`);
                    }
                });
            }
        }
    }

    // Função para salvar os dados no ActiveCampaign
    async function salvarNoActiveCampaign(row) {
        const email = row.find('.email-input').val();
        const codigoRastreio = row.find('.codigo-input').val();
        const etapa = row.find('.etapa-input').val();
        const log = row.find('.log-input').val();

        if (email && codigoRastreio && etapa && log) {
            addLog(`Iniciando o salvamento no ActiveCampaign para o email ${email} com o código de rastreio ${codigoRastreio}.`);
            try {
                const response = await $.ajax({
                    url: '/update-contact',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ email, codigoRastreio, etapa, log })
                });

                addLog(`🟢Salvamento concluído para ${email} no ActiveCampaign: ${response.message}`);
                alert(`Contato ${email} atualizado automaticamente com sucesso: ${response.message}`);
            } catch (error) {
                addLog(`❌Erro ao salvar contato ${email} no ActiveCampaign: ${error.responseText || error.message}`);
                alert(`Erro ao atualizar contato ${email}: ${error.responseText || error.message}`);
            }
        }
    }

    // Evento para atualizar automaticamente os campos ao inserir ou alterar o código de rastreio
    $(document).on('input', '.codigo-input', async function() {
        const row = $(this).closest('tr');
        const codigoRastreio = $(this).val();
        const etapaInput = row.find('.etapa-input');
        const logInput = row.find('.log-input');

        if (codigoRastreio) {
            try {
                const response = await $.ajax({
                    url: '/get-rastreio',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ codigoRastreio: codigoRastreio })
                });

                if (response.etapa) {
                    etapaInput.val(response.etapa);
                    logInput.val(response.log || 'Log não disponível.');

                    // Salvar no ActiveCampaign automaticamente
                    addLog(`🔘Código de rastreio ${codigoRastreio} atualizado com sucesso. Tentando salvar no ActiveCampaign.`);
                    await salvarNoActiveCampaign(row);
                } else {
                    etapaInput.val('Dados não disponíveis.');
                    logInput.val('Log não disponível.');
                }
            } catch (error) {
                addLog(`❌Erro ao buscar dados para o código de rastreio ${codigoRastreio}: ${error.responseText || error.message}`);
                etapaInput.val('Erro ao buscar dados.');
                logInput.val('Erro ao buscar dados.');
            }
        }
    });

    // Evento para salvar as informações no ActiveCampaign ao clicar no botão
    $('#saveButton').on('click', async function() {
        const rows = $('#correiosTable tbody tr');

        for (let i = 0; i < rows.length; i++) {
            const row = $(rows[i]);
            const email = row.find('.email-input').val();
            const codigoRastreio = row.find('.codigo-input').val();
            const etapa = row.find('.etapa-input').val();
            const log = row.find('.log-input').val();

            if (email && codigoRastreio && etapa && log) {
                addLog(`Iniciando o salvamento manual no ActiveCampaign para o email ${email} com o código de rastreio ${codigoRastreio}.`);
                try {
                    const response = await $.ajax({
                        url: '/update-contact',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ email, codigoRastreio, etapa, log })
                    });

                    addLog(`🟢Salvamento manual concluído para ${email} no ActiveCampaign: ${response.message}`);
                    alert(`Contato ${email} atualizado com sucesso: ${response.message}`);
                } catch (error) {
                    addLog(`❌Erro ao salvar manualmente contato ${email} no ActiveCampaign: ${error.responseText || error.message}`);
                    alert(`Erro ao atualizar contato ${email}: ${error.responseText || error.message}`);
                }
            }
        }
    });
});
