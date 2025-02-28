let refreshInterval;
let isRefreshing = false;
let worksheet;
let TIME_PERIOD = 5 
let TIME_PERIOD_DEFINITION = 43200000 //300000; 
const PARAMETER_NAME = "P_REFRESH_FREQUENCY"

// Inicializar a extensão
tableau.extensions.initializeAsync().then(() => {
    // Alterar o texto para indicar que a conexão foi bem-sucedida
    document.getElementById('toggleRefresh').textContent = "Parar Auto-Refresh";
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Recupera o parâmetro de "P_REFRESH_FREQUENCY" para pegar o valor inicial
    dashboard.findParameterAsync(PARAMETER_NAME).then(function(param) {
        TIME_PERIOD = parseFloat(param.currentValue.value) || 5;
        TIME_PERIOD_DEFINITION = (TIME_PERIOD == 0 ? 5 : TIME_PERIOD) * 60000;

        // Escutando qualquer alteração no parâmetro
        param.addEventListener(tableau.TableauEventType.ParameterChanged,onParameterChange);

    }).catch((err) => {
        TIME_PERIOD_DEFINITION = TIME_PERIOD * 60000;
    });

    initWorksheet();
});


function onParameterChange(event){       

        event.getParameterAsync().then(function (param) {
            if (param.name == PARAMETER_NAME) {
                const newTimePeriod = parseFloat(param.currentValue.value) || 5;
                TIME_PERIOD = newTimePeriod;
                TIME_PERIOD_DEFINITION = (TIME_PERIOD == 0 ? 5 : TIME_PERIOD) * 60000;
                console.log("Novo valor do parâmetro P_REFRESH_FREQUENCY: ", TIME_PERIOD);
            }

        })
}

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