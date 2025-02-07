let refreshInterval;
let isRefreshing = false;
let worksheet;

// Inicializar a extensão
tableau.extensions.initializeAsync().then(() => {
    // document.getElementById('status').textContent = "Conectado";
    document.getElementById('toggleRefresh').textContent = "Parar Auto-Refresh";
    initWorksheet();
});

// Configurar a worksheet
async function initWorksheet() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    worksheet = dashboard.worksheets.find(w => w.name === 'Main page'); // Altere para o nome da sua worksheet
    
    document.getElementById('toggleRefresh').addEventListener('click', toggleRefresh);
    toggleRefresh();
}
function refreshAllDataSources() {
    let dataSourceFetchPromises = [];
    let dashboardDataSources = {};
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    dashboard.worksheets.forEach(function (worksheet) {
        dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
    });

    Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
        fetchResults.forEach(function (dataSourcesForWorksheet) {
            dataSourcesForWorksheet.forEach(function (dataSource) {
                if (!dashboardDataSources[dataSource.id]) {
                    dashboardDataSources[dataSource.id] = dataSource;
                    dataSource.refreshAsync();
                }
            });
        });
    });
}
// Lógica para ligar/desligar o refresh
function toggleRefresh() {
    if (!isRefreshing) {
        // Iniciar intervalo
        refreshInterval = setInterval(refreshAllDataSources() , 30000); // 30 segundos

        document.getElementById('toggleRefresh').textContent = "Parar Auto-Refresh";
        isRefreshing = true;
    } else {
        // Parar intervalo
        clearInterval(refreshInterval);
        document.getElementById('toggleRefresh').textContent = "Iniciar Auto-Refresh";
        isRefreshing = false;
    }
}