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
            $('#manualRefreshButton').show(); // Mostra o botão de refresh manual
            addLog('❕Sistema ativado. Atualização automática iniciada.');
            addLog(`❕Em caso de erro, verifique se o token da API não expirou!`)
        } else {
            $(this).removeClass('active').addClass('inactive').text('Desativado');
            $('#correiosTable').hide();
            $('#statusIndicator').removeClass('active').addClass('inactive');
            $('.background-image').removeClass('show-image');
            $('#logContainer').hide(); // Oculta o container de log
            $('#manualRefreshButton').hide(); // Esconde o botão de refresh manual
        }
    });

    // Função para atualizar os rastreios em todas as linhas
    function atualizarTodosOsRastreios() {
        addLog('♻️Iniciando atualização automática dos rastreamentos...');
        const rows = $('#correiosTable tbody tr');

        for (let i = 0; i < rows.length; i++) {
            const row = $(rows[i]);
            const codigoRastreio = row.find('.codigo-input').val();
            const etapaInput = row.find('.etapa-input');
            const logInput = row.find('.log-input');
            const dtHrCriadoInput = row.find('.dtHrCriado-input'); // Novo campo
            const dataPrevistaInput = row.find('.dataPrevista-input'); // Novo campo


            if (codigoRastreio) {
                $.ajax({
                    url: '/get-rastreio',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ codigoRastreio: codigoRastreio }),
                    success: function(response) {
                        etapaInput.val(response.etapa);
                        logInput.val(response.log);
                        dtHrCriadoInput.val(response.dataHoraAtualizacao || 'Não disponível'); // Atualiza o novo campo
                        dataPrevistaInput.val(response.dataPrevistaEntrega || 'Não disponível'); // Atualiza o novo campo
                        addLog(`🟢Rastreio ${codigoRastreio} atualizado✅: Etapa📦 - ${response.etapa}, Log💾 - ${response.log}, Data Hora Atualização - ${response.dataHoraAtualizacao}, Data Prevista Entrega - ${response.dataPrevistaEntrega}`);
                    },
                    error: function(xhr) {
                        addLog(`Erro ao atualizar rastreio ${codigoRastreio}: ${xhr.responseText}`);
                    }
                });
            }
        }
        // Botão de refresh manual
        $('#manualRefreshButton').on('click', function() {
            addLog('Botão de atualização manual acionado.');
            atualizarTodosOsRastreios();
        });
    }

    // Função para salvar os dados no ActiveCampaign
    async function salvarNoActiveCampaign(row) {
        const email = row.find('.email-input').val();
        const codigoRastreio = row.find('.codigo-input').val();
        const etapa = row.find('.etapa-input').val();
        const log = row.find('.log-input').val();
        const dtHrCriado = row.find('.dtHrCriado-input').val();
        const dataPrevista = row.find('.dataPrevista-input').val();
    
        if (email && codigoRastreio && etapa && log) {
            addLog(`Iniciando o salvamento no ActiveCampaign para o email ${email} com o código de rastreio ${codigoRastreio}.`);
            try {
                const response = await $.ajax({
                    url: '/update-contact',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ email, codigoRastreio, etapa, log, dataHoraAtualizacao: dtHrCriado, dataPrevistaEntrega: dataPrevista })
                });
    
                addLog(`🟢Salvamento concluído para ${email} no ActiveCampaign: ${response.message}`);
                alert(`🔍Contato ${email} atualizado automaticamente com sucesso:✔️ ${response.message}`);
            } catch (error) {
                addLog(`❌Erro ao salvar contato ${email} no ActiveCampaign: ${error.responseText || error.message}`);
                alert(`Erro ao atualizar contato ${email}: ${error.responseText || error.message}`);
            }
        }
    }

    // Função para coletar os dados da tabela
    function coletarDadosDaTabela() {
        const rows = $('#correiosTable tbody tr');
        const dados = [];
    
        rows.each(function() {
            const email = $(this).find('.email-input').val();
            const codigoRastreio = $(this).find('.codigo-input').val();
            const etapa = $(this).find('.etapa-input').val();
            const dtHrCriado = $(this).find('.dtHrCriado-input').val();
            const dataPrevista = $(this).find('.dataPrevista-input').val();
    
            if (email && codigoRastreio && etapa && dtHrCriado && dataPrevista) {
                dados.push({
                    email,
                    codigoRastreio,
                    etapa,
                    log: $(this).find('.log-input').val(),
                    dtHrCriado,
                    dataPrevista
                });
            }
        });
    
        addLog('🔍Dados coletados da tabela:', dados);
        return dados;
    }

    // Evento para atualizar automaticamente os campos ao inserir ou alterar o código de rastreio
    $(document).on('input', '.codigo-input', async function() {
        const row = $(this).closest('tr');
        const codigoRastreio = $(this).val();
        const etapaInput = row.find('.etapa-input');
        const logInput = row.find('.log-input');
        const dtHrCriadoInput = row.find('.dtHrCriado-input'); // Novo campo
        const dataPrevistaInput = row.find('.dataPrevista-input'); // Novo campo

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
                    dtHrCriadoInput.val(response.dataHoraAtualizacao || 'Não disponível'); // Atualiza o novo campo
                    dataPrevistaInput.val(response.dataPrevistaEntrega || 'Não disponível'); // Atualiza o novo campo

                    // Salvar no ActiveCampaign automaticamente
                    addLog(`⚠️Código de rastreio ${codigoRastreio} ✅atualizado com sucesso.💾Tentando salvar no ActiveCampaign.`);
                    await salvarNoActiveCampaign(row);
                } else {
                    etapaInput.val('Dados não disponíveis.');
                    logInput.val('Log não disponível.');
                    dtHrCriadoInput.val('Não disponível'); 
                    dataPrevistaInput.val('Não disponível'); 
                }
            } catch (error) {
                addLog(`❌Erro ao buscar dados para o código de rastreio ${codigoRastreio}: ${error.responseText || error.message}`);
                etapaInput.val('Erro ao buscar dados.');
                logInput.val('Erro ao buscar dados.');
                dtHrCriadoInput.val('Erro ao buscar dados'); 
                dataPrevistaInput.val('Erro ao buscar dados'); 
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