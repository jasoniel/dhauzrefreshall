let refreshInterval;
let isRefreshing = false;
let worksheet;
let TIME_PERIOD = 5 //MINUTES
let TIME_PERIOD_DEFINITION =  300000; //CONVERT IN MILLISECONDS

// Inicializar a extensão
tableau.extensions.initializeAsync().then(() => {
    // document.getElementById('status').textContent = "Conectado";
    document.getElementById('toggleRefresh').textContent = "Parar Auto-Refresh";
    const dashboard = tableau.extensions.dashboardContent.dashboard;   

    dashboard.findParameterAsync("P_REFRESH_FREQUENCY").then(function(param){ 
        TIME_PERIOD = parseFloat(param.currentValue.value) || 5;
        TIME_PERIOD_DEFINITION = (TIME_PERIOD == 0 ? 5 : TIME_PERIOD) * 60000;
        document.getElementById('time').textContent = TIME_PERIOD_DEFINITION;
    }).catch((err) => {
        TIME_PERIOD_DEFINITION = TIME_PERIOD * 60000;
        document.getElementById('time').textContent = TIME_PERIOD_DEFINITION;

      });     
    initWorksheet();
});

// Configurar a worksheet
async function initWorksheet() {
    
    document.getElementById('toggleRefresh').addEventListener('click', toggleRefresh)
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
        refreshInterval = setInterval(refreshAllDataSources, TIME_PERIOD_DEFINITION); // 5 minutos
        document.getElementById('toggleRefresh').textContent = "Parar Auto-Refresh";
        isRefreshing = true;
    } else {
        // Parar intervalo
        clearInterval(refreshInterval);
        document.getElementById('toggleRefresh').textContent = "Iniciar Auto-Refresh";

        isRefreshing = false;
    }
}