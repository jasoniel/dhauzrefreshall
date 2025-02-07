(function () {
    // Inicializa a extensão
    tableau.extensions.initializeAsync().then(() => {
        const dashboard = tableau.extensions.dashboardContent.dashboard;
        const refreshButton = document.getElementById('refreshButton');
        const timerElement = document.getElementById('timer');

        let timeLeft = 30; // Tempo inicial em segundos

        // Função para atualizar o timer
        function updateTimer() {
            timerElement.textContent = timeLeft;
            if (timeLeft === 0) {
                refreshDashboard(); // Atualiza o dashboard quando o timer chega a 0
                timeLeft = 30; // Reinicia o timer
            } else {
                timeLeft--; // Decrementa o tempo
            }
        }

        // Função para atualizar o dashboard
        function refreshDashboard() {
            dashboard.worksheets.forEach(worksheet => {
                worksheet.refreshAsync();
            });
        }

        // Atualiza o timer a cada segundo
        setInterval(updateTimer, 1000);

        // Adiciona um listener para o botão de atualização manual
        refreshButton.addEventListener('click', () => {
            refreshDashboard();
            timeLeft = 30; // Reinicia o timer ao clicar no botão
        });
    });
})();