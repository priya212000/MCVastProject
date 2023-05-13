// const width = 1076
// const height = 1144
const X = { min: -4762.19066918826, max: 2650.0 }
const Y = { min: -30.08359080145072, max: 7850.037195143702 }
let trafficData
let trafficG

document.addEventListener('DOMContentLoaded', function () {
  const trafficSvg = d3.select('#traffic-map')

  const height = trafficSvg.node().getBoundingClientRect().height - 50
  const width = (height * 1076) / 1144

  innerHeight = height
  innerWidth = width

  trafficG = trafficSvg.append('g')

  xScale = d3.scaleLinear().domain([X.min, X.max]).range([0, innerWidth])

  xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat('')

  trafficG
    .append('g')
    .call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`)

  yScale = d3.scaleLinear().domain([Y.max, Y.min]).range([0, innerHeight])

  yAxis = d3.axisLeft(yScale).tickSize(0).tickFormat('')

  trafficG.append('g').call(yAxis)

  trafficG
    .append('svg:image')
    .attr('height', height)
    .attr('width', width)
    .attr('x', 0)
    .attr('y', 0)
    .attr('xlink:href', 'images/BaseMap.png')
    .attr('opacity', 0.6)

  trafficG
    .append('rect')
    .attr('height', height)
    .attr('width', width)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'none')
    .attr('stroke', 'black')

  tooltip = d3
    .select('body')
    .append('div')
    .style('opacity', 0)
    .style('position', 'absolute')
    .attr('class', 'tooltip')
})
function createTrafficMap(week) {
  d3.csv('data/traffic_data/' + week + '.csv').then(function (values) {
    trafficData = values
    trafficData.forEach(d => {
      d.count = +d.count
      d.xLocation = +d.xLocation
      d.yLocation = +d.yLocation
    })

    // const svg = d3.select('#traffic-map')

    // const height = svg.node().getBoundingClientRect().height - 40
    // const width = (height * 1076) / 1144

    // const innerHeight = height
    // const innerWidth = width

    // g = svg.append('g')

    // xScale = d3.scaleLinear().domain([X.min, X.max]).range([0, innerWidth])

    // xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat('')

    // g.append('g').call(xAxis).attr('transform', `translate(0,${innerHeight})`)

    // yScale = d3.scaleLinear().domain([Y.max, Y.min]).range([0, innerHeight])

    // yAxis = d3.axisLeft(yScale).tickSize(0).tickFormat('')

    // g.append('g').call(yAxis)

    // g.append('svg:image')
    //   .attr('height', height)
    //   .attr('width', width)
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('xlink:href', 'images/BaseMap.png')
    //   .attr('opacity', 0.6)

    // g.append('rect')
    //   .attr('height', height)
    //   .attr('width', width)
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('fill', 'none')
    //   .attr('stroke', 'black')

    // tooltip = d3
    //   .select('body')
    //   .append('div')
    //   .style('opacity', 0)
    //   .style('position', 'absolute')
    //   .attr('class', 'tooltip')

    trafficG
      .selectAll('.circles')
      .data(trafficData, d => d.location)
      .join(
        enter =>
          enter
            .append('circle')
            .attr('class', 'circles')
            .attr('cx', d => xScale(d.xLocation))
            .attr('cy', d => yScale(d.yLocation))
            .attr('r', d => (d.count > 100 ? d.count / 100 : 1))
            .style('fill', function (d) {
              return d.norm_count > 0.4 ? '#E72D2D' : 'black'
            })
            .attr('opacity', d => (d.norm_count > 0.4 ? 0.6 : 1)),
        update =>
          update.call(update =>
            update
              .transition()
              .duration(1000)
              .attr('r', d => (d.count > 100 ? 1 + d.count / 100 : 1))
              .style('fill', function (d) {
                return d.norm_count > 0.4 ? '#E72D2D' : 'black'
              })
              .attr('opacity', d => (d.norm_count > 0.4 ? 0.7 : 1))
          )
      )
      .on('mouseover', function (d, i) {
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('left', d.pageX + 15 + 'px')
          .style('top', d.pageY - 40 + 'px')

        tooltip.html('Total Traffic : ' + i.count)
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
          .style('top', d.pageY - 50 + 'px')
      })
  })
}
