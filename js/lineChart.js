document.addEventListener('DOMContentLoaded', function () {
  drawLineChart()
})

function drawLineChart() {
  d3.csv('data/FinancialSum.csv', d => {
    const date = d3.timeParse('%Y-%m-%d')(d.date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 13) //add 13 days to the date
    return { id: +d.id, date: date, endDate: endDate, roip: d.roip }
  }).then(function (data) {
    const margin = { top: 10, right: 30, bottom: 0, left: 40 }

    const tooltip = d3
      .select('body')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('position', 'absolute')

    const svg = d3.select('#line-chart')
    const innerHeight = svg.node().getBoundingClientRect().height - 80
    const innerWidth = svg.node().getBoundingClientRect().width - 60

    g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, innerWidth])
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B '%g")))

    var formatPercent = d3.format('.0%')
    const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])
    g.append('g').call(d3.axisLeft(y).ticks(7).tickFormat(formatPercent))

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'purple')
      .attr('stroke-width', 3)
      .attr(
        'd',
        d3
          .line()
          .curve(d3.curveBasis)
          .x(d => x(d.date))
          .y(d => y(d.roip))
      )

    g.append('g')
      .selectAll('dot')
      .data(data)
      .join('circle')
      .attr('class', 'myCircle')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.roip))
      .attr('r', 8)
      .attr('stroke', '#C8A2C8')
      .attr('stroke-width', 3)
      .attr('fill', 'white')
      .on('mouseover', function (d, i) {
        d3.select(this).style('cursor', 'pointer')
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('left', d.pageX + 15 + 'px')
          .style('top', d.pageY - 40 + 'px')

        tooltip.html('Avg. Balance Increase (%) : ' + (i.roip * 100).toFixed(2))
      })
      .on('mouseout', function (d, i) {
        tooltip
          .style('opacity', 0)
          .style('left', -500 + 'px')
          .style('top', -500 + 'px')
      })
      .on('mousemove', function (d, i) {
        tooltip
          .style('left', d.pageX + 15 + 'px')
          .style('top', d.pageY - 60 + 'px')
      })
      .on('click', function (d, i) {
        updateCharts({
          name: 'Week' + i.id,
          startDate: i.date,
          endDate: i.endDate
        })
      })
  })
}
