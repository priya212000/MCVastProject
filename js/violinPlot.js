//global vars
//select svg element
let svgViolin, violinSvg;

const WEEKS_IN_MONTH = 4

// global chart vars
var x, y, yAxis, xAxis, yMin, yMax
var stat, area, startTime, endTime

const violinColor = d3
  .scaleOrdinal()
  .domain(['0', '1', '2', '3'])
  .range(d3.schemeSet2)

//global data set vars
var apartments, jobs, participants, reference, clusters, data, relevant_area

//function called once html page is loaded
// document.addEventListener('DOMContentLoaded', function () {
document.addEventListener('DOMContentLoaded', function () {
  violinSvg = d3.select('#violin')
  svgViolin = violinSvg.append('g')
    .attr('transform', 'translate(' + 50 + ',' + 50 + ')')
})

function createViolinPlot(start, end, newArea) {
  //store global vars
  startTime = start
  endTime = end
  area = newArea

  // load multiple csv files
  Promise.all([
    d3.csv('data/violinPlot/Apartments.csv'),
    d3.csv('data/violinPlot/Jobs.csv'),
    d3.csv('data/violinPlot/Participants.csv'),
    d3.csv('data/violinPlot/JobAptChangeJournal.csv'),
    d3.csv('data/violinPlot/clustered_data.csv')
  ]).then(function (values) {
    //data wrangling
    apartments = values[0].map(function (d) {
      return {
        apartmentId: d.apartmentId,
        rentalCost: +d.rentalCost
      }
    })

    var parseTime = d3.timeParse('%I:%M:%S %p')
    jobs = values[1].map(function (d) {
      var start = parseTime(d.startTime)
      var end = parseTime(d.endTime)
      var hours = end.getHours() - start.getHours()
      return {
        jobId: d.jobId,
        daysWorked: d.daysToWork.split(',').length,
        hourlyRate: +d.hourlyRate,
        hoursWorked: hours
      }
    })

    participants = values[2].map(function (d) {
      return {
        participantId: d.participantId,
        age: +d.age
      }
    })

    var parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S%Z')
    reference = values[3].map(function (d) {
      return {
        participantId: d.participantId,
        apartmentId: d.apartmentId,
        jobId: d.jobId,
        timestamp: parseDate(d.timestamp)
      }
    })

    clusters = values[4].map(function (d) {
      return {
        clusterId: d.clusterId,
        id: d.id,
        csv: d.csvName
      }
    })

    // create graph for the first time
    createGraph()
  })
}

function drawChart() {
  clearChart()
  switch (stat) {
    case 'age':
      drawAgeChart()
      break
    case 'avg_rent':
      drawRentChart()
      break
    case 'monthly_income':
      drawIncomeChart()
      break
  }
}

function drawAgeChart() {
  const currentArea = relevant_area[0].clusterId
  // edit y axis scaling
  yMin =
    d3.min(
      data.map(function (d) {
        return d.age
      })
    ) - 5
  yMax =
    d3.max(
      data.map(function (d) {
        return d.age
      })
    ) + 5
  y.domain([yMin, yMax])
  yAxis.transition().duration(1000).call(d3.axisLeft(y))

  // edit bin name
  x.domain(['Age'])
  xAxis.transition().duration(1000).call(d3.axisBottom(x))

  // Features of the histogram
  var histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(30)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value(d => d)

  var values = data.map(d => d.age)
  var bins = histogram(values)

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  var lengths = bins.map(function (d) {
    return d.length
  })
  var maxNum = d3.max(lengths)

  // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  var xNum = d3
    .scaleLinear()
    .range([100, x.bandwidth() - 100])
    .domain([-maxNum, maxNum])

  // Add the shape to this svg!
  svgViolin
    .selectAll('.violin')
    .data([{ key: 'Age', value: bins }])
    .enter()
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + x(d.key) + ' ,0)'
    }) // Translation on the right to be at the group position
    .append('path')
    .datum(function (d) {
      return d.value
    }) // So now we are working bin per bin
    .attr('class', 'violin')
    .style('stroke', 'black')
    .style('fill', violinColor(area))
    .attr(
      'd',
      d3
        .area()
        .x0(function (d) {
          return xNum(-d.length)
        })
        .x1(function (d) {
          return xNum(d.length)
        })
        .y(function (d) {
          return y(d.x0)
        })
        .curve(d3.curveCatmullRom)
    )
}

function drawRentChart() {
  // edit y axis scaling
  yMin =
    d3.min(
      data.map(function (d) {
        return d.rentalCost
      })
    ) - 5
  yMax =
    d3.max(
      data.map(function (d) {
        return d.rentalCost
      })
    ) + 5
  y.domain([yMin, yMax])
  yAxis.transition().duration(1000).call(d3.axisLeft(y))

  // edit bin name
  x.domain(['Average Rent'])
  xAxis.transition().duration(1000).call(d3.axisBottom(x))

  // Features of the histogram
  var histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(35)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value(d => d)

  var values = data.map(d => d.rentalCost)
  var bins = histogram(values)

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  var lengths = bins.map(function (d) {
    return d.length
  })
  var maxNum = d3.max(lengths)

  // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  var xNum = d3
    .scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum, maxNum])

  // Add the shape to this svg!
  svgViolin
    .selectAll('.violin')
    .data([{ key: 'Average Rent', value: bins }])
    .enter()
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + x(d.key) + ' ,0)'
    }) // Translation on the right to be at the group position
    .append('path')
    .datum(function (d) {
      return d.value
    }) // So now we are working bin per bin
    .attr('class', 'violin')
    .style('stroke', 'black')
    .style('fill', violinColor(area))
    .attr(
      'd',
      d3
        .area()
        .x0(function (d) {
          return xNum(-d.length)
        })
        .x1(function (d) {
          return xNum(d.length)
        })
        .y(function (d) {
          return y(d.x0)
        })
        .curve(d3.curveCatmullRom)
    )
}

function drawIncomeChart() {
  // edit y axis scaling
  yMin =
    d3.min(
      data.map(function (d) {
        return d.monthlyIncome
      })
    ) - 5
  yMax =
    d3.max(
      data.map(function (d) {
        return d.monthlyIncome
      })
    ) + 5
  y.domain([yMin, yMax])
  yAxis.transition().duration(1000).call(d3.axisLeft(y))

  // edit bin name
  x.domain(['Monthly Income'])
  xAxis.transition().duration(1000).call(d3.axisBottom(x))

  // Features of the histogram
  var histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(45)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
    .value(d => d)

  var values = data.map(d => d.monthlyIncome)
  var bins = histogram(values)

  // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
  var lengths = bins.map(function (d) {
    return d.length
  })
  var maxNum = d3.max(lengths)

  // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
  var xNum = d3
    .scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum, maxNum])

  // Add the shape to this svg!
  svgViolin
    .selectAll('.violin')
    .data([{ key: 'Monthly Income', value: bins }])
    .enter()
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + x(d.key) + ' ,0)'
    }) // Translation on the right to be at the group position
    .append('path')
    .datum(function (d) {
      return d.value
    }) // So now we are working bin per bin
    .attr('class', 'violin')
    .style('stroke', 'black')
    .style('fill', violinColor(area))
    .attr(
      'd',
      d3
        .area()
        .x0(function (d) {
          return xNum(-d.length)
        })
        .x1(function (d) {
          return xNum(d.length)
        })
        .y(function (d) {
          return y(d.x0)
        })
        .curve(d3.curveCatmullRom)
    )
}

//select menu value has been changed
function valueSelected() {
  //get selected value in the GI dropdown
  stat = d3.select('#selectMenu').property('value')

  relevant_area = clusters.filter(function (d) {
    return d.clusterId == area && d.csv == 'Apartments.csv'
  })

  //switch case determines which dataset to use.
  const result = reference
    .map(
      i =>
        !!relevant_area.find(e => e.id === i.apartmentId) && {
          ...i,
          ...relevant_area.find(e => e.id === i.apartmentId)
        }
    )
    .filter(Boolean)

  // && i.timestamp >= startTime && i.timestamp <= endTime
  switch (stat) {
    case 'age':
      data = participants
        .map(
          i =>
            !!result.find(e => e.participantId === i.participantId) && {
              ...i,
              ...result.find(e => e.participantId === i.participantId)
            }
        )
        .filter(Boolean)
      break
    case 'avg_rent':
      data = apartments
        .map(
          i =>
            !!result.find(e => e.apartmentId === i.apartmentId) && {
              ...i,
              ...result.find(e => e.apartmentId === i.apartmentId)
            }
        )
        .filter(Boolean)
      break
    case 'monthly_income':
      var temp = jobs
        .map(
          i =>
            !!result.find(e => e.jobId === i.jobId) && {
              ...i,
              ...result.find(e => e.jobId === i.jobId)
            }
        )
        .filter(Boolean)
      data = temp.map(function (d) {
        var m_income =
          d.hoursWorked *
          d.hourlyRate *
          d.daysWorked *
          WEEKS_IN_MONTH
        return {
          participantId: d.participantId,
          clusterId: d.clusterId,
          jobId: d.jobId,
          monthlyIncome: m_income
        }
      })
      break
    default:
      break
  }

  drawChart()
}

//create axis for first time
function createGraph() {
  svgViolin.selectAll('*').remove()
  //get selected value in the GI dropdown
  //   const width = 800
  //   const height = 600
  const width = violinSvg.node().getBoundingClientRect().width
  const height = violinSvg.node().getBoundingClientRect().height - 50

  const violinMargin = { top: 50, bottom: 50, right: 50, left: 50 }
  const innerWidth = width - violinMargin.left - violinMargin.right - 50;
  const innerHeight = height - violinMargin.top - violinMargin.bottom - 50;
  stat = d3.select('#selectMenu').property('value')

  relevant_area = clusters.filter(function (d) {
    return d.clusterId == area && d.csv == 'Apartments.csv'
  })

  data = participants

  // Build and Show the Y scale
  y = d3
    .scaleLinear() // Note that here the Y scale is set manually
    .range([innerHeight, 0])
  yAxis = svgViolin.append('g')
    // .attr('transform', 'translate('+ 50 + ', ' + -10 + ')')
    .call(d3.axisLeft(y))

  // Build and Show the X scale. It is a band scale like for a boxplot: each group has an dedicated RANGE on the axis. This range has a length of x.bandwidth
  x = d3.scaleBand().range([0, innerWidth]).padding(0.05) // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
  xAxis = svgViolin
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + innerHeight + ')')
    .call(d3.axisBottom(x))

  valueSelected()
}

function clearChart() {
  svgViolin.selectAll('.violin').remove()
}
