var global_chosenWeek = {
  name: 'Week1',
  startDate: new Date(2022, 2, 1),
  endDate: new Date(2022, 2, 14)
}

var global_heatmap_chosenDataType = 'joviality'
// localStorage.setItem('global_heatmap_chosenDataType',"joviality");

function callHeatMap(chosenWeek) {
  var svg = d3.select('#heatmap-svg')
  svg.selectAll('*').remove()
  var WeeknameFilename = {
    Week1: 'data/heatmapData/Log_2022-02-28.csv',
    Week2: 'data/heatmapData/Log_2022-03-15.csv',
    Week3: 'data/heatmapData/Log_2022-03-31.csv',
    Week4: 'data/heatmapData/Log_2022-04-15.csv',
    Week5: 'data/heatmapData/Log_2022-04-30.csv',
    Week6: 'data/heatmapData/Log_2022-05-15.csv',
    Week7: 'data/heatmapData/Log_2022-05-31.csv',
    Week8: 'data/heatmapData/Log_2022-06-15.csv',
    Week9: 'data/heatmapData/Log_2022-06-30.csv',
    Week10: 'data/heatmapData/Log_2022-07-15.csv',
    Week11: 'data/heatmapData/Log_2022-07-31.csv',
    Week12: 'data/heatmapData/Log_2022-08-15.csv',
    Week13: 'data/heatmapData/Log_2022-08-31.csv',
    Week14: 'data/heatmapData/Log_2022-09-15.csv',
    Week15: 'data/heatmapData/Log_2022-09-30.csv',
    Week16: 'data/heatmapData/Log_2022-10-15.csv',
    Week17: 'data/heatmapData/Log_2022-10-31.csv',
    Week18: 'data/heatmapData/Log_2022-11-15.csv',
    Week19: 'data/heatmapData/Log_2022-11-30.csv',
    Week20: 'data/heatmapData/Log_2022-12-15.csv',
    Week21: 'data/heatmapData/Log_2022-12-31.csv',
    Week22: 'data/heatmapData/Log_2023-01-15.csv',
    Week23: 'data/heatmapData/Log_2023-01-31.csv',
    Week24: 'data/heatmapData/Log_2023-02-15.csv',
    Week25: 'data/heatmapData/Log_2023-02-28.csv',
    Week26: 'data/heatmapData/Log_2023-03-15.csv',
    Week27: 'data/heatmapData/Log_2023-03-31.csv',
    Week28: 'data/heatmapData/Log_2023-04-15.csv',
    Week29: 'data/heatmapData/Log_2023-04-30.csv',
    Week30: 'data/heatmapData/Log_2023-05-15.csv'
  }
  createHeatMap(chosenWeek, WeeknameFilename[chosenWeek.name])
}

function callInnovativeChart(chosenWeek) {
  updateInnovativeChart(chosenWeek.startDate, chosenWeek.endDate)
}

function callPieChart(chosenWeek) {
  updatePieChart(chosenWeek.startDate, chosenWeek.endDate)
}

function callViolinPlot(chosenWeek, area) {
  createViolinPlot(chosenWeek.startDate, chosenWeek.endDate, area)
}

function callTrafficMap(chosenWeek) {
  createTrafficMap(chosenWeek['name'])
}

document.addEventListener('DOMContentLoaded', function () {
  drawAreaLegend()
  callViolinPlot(global_chosenWeek, '0')

  updateCharts({
    name: 'Week1',
    startDate: new Date(2022, 2, 1),
    endDate: new Date(2022, 2, 14)
  })
})

function updateCharts(chosenWeek) {
  global_chosenWeek = chosenWeek
  callHeatMap(chosenWeek)
  callInnovativeChart(chosenWeek)
  callPieChart(chosenWeek)
  callTrafficMap(chosenWeek)
  // callInnovativeChart(chosenWeek)
  // callViolinPlot(chosenWeek)
}
