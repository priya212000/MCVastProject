var newData = [
  {
    0: 425,
    1: 435,
    2: 468,
    3: 189,
    csvName: 'Apartment'
  },
  {
    0: 38,
    1: 94,
    2: 86,
    3: 35,
    csvName: 'Workplace'
  },
  {
    0: 1,
    1: 6,
    2: 3,
    3: 2,
    csvName: 'Pub'
  },
  {
    0: 3,
    1: 9,
    2: 6,
    3: 2,
    csvName: 'Restaurant'
  }
]

var checkData = null
var selectedAreas = [0, 1, 2, 3]

//loads the checkin data from the csv file
function loadCheckInDataBubble(startDate, endDate) {
  // Load the CSV data
  d3.csv('data/checkin.csv', function (d) {
    // Parse the timestamp string into a Date object
    d.timestamp = d3.timeParse('%Y-%m-%dT%H:%M:%SZ')(d.timestamp)
    // Return the parsed object
    return d
  }).then(function (rawData) {
    // Store the data in a variable
    checkData = rawData
    // Select the checkboxes and button
    var checkboxes = document.querySelectorAll(
      'input[type="checkbox"][name="area"]'
    )
    var storeButton = document.getElementById('store-selection')

    // Add an event listener to the button
    storeButton.addEventListener('click', function () {
      // Store the selected areas in an array
      selectedAreas = []
      checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
          selectedAreas.push(parseInt(checkbox.value))
        }
      })
      updateInnovativeChart(startDate, endDate)
    })
    barBubbleChart(startDate, endDate)
  })
}

//drawing the chart
function barBubbleChart(startDate, endDate) {
  var transformedData = {}
  transformedData = getBubbleData(startDate, endDate, checkData)
  // Initialize an object to store the venue types
  var venues = {}
  venues = getVenueData(transformedData)
  var width = 1500,
    height = 650
  var color = d3
    .scaleOrdinal()
    .domain(['0', '1', '2', '3'])
    .range(['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3'])
  var colorBubble = d3
    .scaleOrdinal()
    .domain(['Area 0', 'Area 1', 'Area 2', 'Area 3'])
    .range(['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3'])
  newData.forEach(function (d) {
    d.total = +d['0'] + +d['1'] + +d['2'] + +d['3']
  })
  var margin = {
    top: 20,
    right: 20,
    bottom: 150,
    left: 100
  },
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom

  var x = d3.scaleBand().range([0, width]).padding(0.9)
  var y = d3.scaleLinear().range([height, 140])

  x.domain(
    newData.map(function (d) {
      return d.csvName
    })
  )
  y.domain([
    0,
    d3.max(newData, function (d) {
      return d.total
    })
  ])

  const existingSvg = d3.select('.lollipopchart svg')
  // If the SVG element exists, remove it
  if (!existingSvg.empty()) {
    existingSvg.remove()
  }
  var svg = d3
    .select('.lollipopchart')

    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class', 'lollipopchart')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('class', 'bubble')

  const finalData = newData.map(item => {
    const filteredItem = {}
    filteredItem['csvName'] = item['csvName']
    filteredItem['total'] = selectedAreas.reduce(
      (acc, area) => acc + item[area],
      0
    )
    selectedAreas.forEach(area => {
      filteredItem[area] = item[area]
    })
    return filteredItem
  })

  // Compute the stacked layout
  var stack = d3
    .stack()
    .keys(
      Object.keys(finalData[0]).filter(
        key => key !== 'csvName' && key !== 'total'
      )
    )
    .offset(d3.stackOffsetNone)

  var stackedData = stack(finalData)

  var lollipop = svg.append('g').attr('class', 'lollipop')

  var bars = lollipop.append('g').attr('class', 'bars')

  // Add x-axis label
  svg
    .append('text')
    .attr('class', 'x label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 75)
    .text('Types of buildings')

  // Add y-axis label
  svg
    .append('text')
    .attr('class', 'y label')
    .attr('text-anchor', 'middle')
    .attr('x', 0 - height / 2)
    .attr('y', margin.left - 150)
    .attr('transform', 'rotate(-90)')
    .attr('font-size', '12px')
    .text('Distribution of each building type in each area');

  tooltip = d3
    .select('body')
    .append('div')
    .style('opacity', 0)
    .style('position', 'absolute')
    .attr('class', 'tooltip');

  // Add the bars
  bars
    .selectAll('.bar')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', function (d, i) {
      return 'bar group-' + i
    })
    .attr('fill', function (d, i) {
      return color(d.key)
    })
    .selectAll('rect')
    .data(function (d) {
      return d
    })
    .enter()
    .append('rect')
    .attr('x', function (d) {
      return x(d.data.csvName) + x.bandwidth() / 2 - x.bandwidth() * 2
    })
    .attr('width', x.bandwidth() * 4)
    .attr('y', function (d) {
      return y(d[1])
    })
    .attr('height', function (d) {
      return y(d[0]) - y(d[1])
    })
    .attr('stroke', 'grey')
    .attr('stroke-width', 1.5)
    .on("mouseover", function (event, d) {
      const data = d3.select(this).datum();
      var buildingType = data.data.csvName + 's';
      tooltip
        .style('top', event.pageY - 40 + 'px')
        .style('left', event.pageX + 15 + 'px')
        .style('opacity', '1')
        .html(`Total ${buildingType} : ${data[1] - data[0]} `);
      d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
    })
    .on('mousemove', function (event, d) {
      tooltip
        .style('left', event.pageX + 15 + 'px')
        .style('top', event.pageY - 50 + 'px')
    })
    .on("mouseout", function (event, d) {
      tooltip
        .style('opacity', 0)
        .style('left', -500 + 'px')
        .style('top', -500 + 'px');
      d3.select(this).attr("stroke", "grey").attr("stroke-width", 1.5);
    });

  var ven = ['Pub', 'Restaurant', 'Apartment', 'Workplace']

  for (i = 0; i < 4; i++) {
    var bubbleData = getTotalByVenueType(finalData, ven[i])
    bubbleGroupFunc(bubbleData, ven[i])
  }

  function bubbleGroupFunc(bubbleData, venueType) {
    var bubbleGroupPub = null,
      bubbleGroupApartment = null,
      bubbleGroupRestaurant = null,
      bubbleGroupWorkplace = null,
      boundaryPub = null,
      boundaryApartment = null,
      boundaryRestaurant = null,
      boundaryWorkplace = null,
      bubblePub = null,
      bubbleApartment = null,
      bubbleRestaurant = null,
      bubbleWorkplace = null,
      nodesPub = null,
      nodesApartment = null,
      nodesRestaurant = null,
      nodesWorkplace = null,
      nodeGroupPub = null,
      nodeGroupApartment = null,
      nodeGroupRestaurant = null,
      nodeGroupWorkplace = null,
      nodePub = null,
      nodeApartment = null,
      nodeRestaurant = null,
      nodeWorkplace = null

    var bubbleGroupMap = {
      Pub: [
        bubbleGroupPub,
        boundaryPub,
        bubblePub,
        nodesPub,
        nodeGroupPub,
        nodePub
      ],
      Apartment: [
        bubbleGroupApartment,
        boundaryApartment,
        bubbleApartment,
        nodesApartment,
        nodeGroupApartment,
        nodeApartment
      ],
      Restaurant: [
        bubbleGroupRestaurant,
        boundaryRestaurant,
        bubbleRestaurant,
        nodesRestaurant,
        nodeGroupRestaurant,
        nodeRestaurant
      ],
      Workplace: [
        bubbleGroupWorkplace,
        boundaryWorkplace,
        bubbleWorkplace,
        nodesWorkplace,
        nodeGroupWorkplace,
        nodeWorkplace
      ]
    }

    // Create a group element for the circle and bubbles
    bubbleGroupMap[venueType][0] = svg
      .append('g')
      .data(bubbleData)
      .attr('transform', function (d) {
        xpos = x(venueType) + x.bandwidth() / 2 - 75
        ypos = y(d.total) - 150

        return 'translate(' + xpos + ',' + ypos + ')'
      })

    // Append the circle to the bubble group

    bubbleGroupMap[venueType][1] = bubbleGroupMap[venueType][0]
      .append('circle')
      .attr('r', 150 / 2)
      .attr('cx', 150 / 2)
      .attr('cy', 150 / 2)
      .style('fill', 'none')
      .style('stroke', 'grey')
      .style('stroke-width', 1.5);

    // Set the pack layout for the bubbles
    bubbleGroupMap[venueType][2] = d3
      .pack(venues[venueType])
      .size([
        bubbleGroupMap[venueType][1].attr('r') * 2,
        bubbleGroupMap[venueType][1].attr('r') * 2
      ])
      .padding(1.5)

    bubbleGroupMap[venueType][3] = d3
      .hierarchy(venues[venueType])
      .sum(function (d) {
        return d.Count
      })

    // Create a group element for the nodes
    bubbleGroupMap[venueType][4] = bubbleGroupMap[venueType][0]
      .append('g')
      .attr('class', 'node-group-' + venueType.toLowerCase())

    bubbleGroupMap[venueType][5] = bubbleGroupMap[venueType][4]
      .selectAll('.node')
      .data(
        bubbleGroupMap[venueType][2](bubbleGroupMap[venueType][3]).descendants()
      )
      .enter()
      .filter(function (d) {
        return !d.children
      })
      .append('g')
      .attr('class', 'node')
      .attr('transform', function (d) {
        var xValue = x(venueType)
        return 'translate(' + d.x + ',' + d.y + ')'
      })

    bubbleGroupMap[venueType][5]
      .append('circle')
      .attr('r', function (d) {
        return d.r;
      })
      .style('fill', function (d, i) {
        return colorBubble(d.data.Name)
      })
      .attr("stroke", "grey")
      .attr("stroke-width", 1.25)
      .on("mouseover", function (event, d) {
        const data = d3.select(this).datum()
        tooltip
          .style('top', event.pageY - 40 + 'px')
          .style('left', event.pageX + 15 + 'px')
          .style('opacity', '1')
          .html(`Traffic in ${data.data.Name} : ${data.data.Count} `);
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on('mousemove', function (event, d) {
        tooltip
          .style('left', event.pageX + 15 + 'px')
          .style('top', event.pageY - 50 + 'px')
      })
      .on("mouseout", function (event, d) {
        tooltip
          .style('opacity', 0)
          .style('left', -500 + 'px')
          .style('top', -500 + 'px');
        d3.select(this).attr("stroke", "grey").attr("stroke-width", 1.5);
      });

    bubbleGroupMap[venueType][5]
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(function (d) {
        return d.data.Name.substring(0, d.r / 3)
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', function (d) {
        return d.r / 5
      })
      .attr('fill', 'white')

    bubbleGroupMap[venueType][5]
      .append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(function (d) {
        return d.data.Count
      })
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', function (d) {
        return d.r / 5
      })
      .attr('fill', 'white')
  }

  lollipop
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-65)')

  lollipop.append('g').call(d3.axisLeft(y))
}
function getTotalByVenueType(data, venueType) {
  var filteredData = data.filter(function (d) {
    return d.csvName === venueType
  })
  return filteredData
}

function getBubbleData(startDate, endDate, checkinData) {
  const filteredData = checkinData.filter(function (d) {
    return (
      d.timestamp >= new Date(startDate) && d.timestamp <= new Date(endDate)
    )
  })

  const result = filteredData.reduce(
    function (acc, cur) {
      const venueType = cur.venueType
      const area = 'Area ' + cur.clusterId
      const count = acc[venueType][area] || 0
      acc[venueType][area] = count + 1
      return acc
    },
    {
      Pub: {},
      Apartment: {},
      Restaurant: {},
      Workplace: {}
    }
  )
  const finalResult = {}
  Object.keys(result).forEach(function (venueType) {
    const data = Object.keys(result[venueType]).map(function (area) {
      return { Area: area, Count: result[venueType][area] }
    })
    finalResult[venueType] = data
  })

  const areaRes = {}

  Object.keys(finalResult).forEach(key => {
    areaRes[key] = finalResult[key]
      .filter(item => selectedAreas.includes(parseInt(item.Area.split(' ')[1])))
      .map(item => ({ Area: item.Area, Count: item.Count }))
  })

  return areaRes
}

function getVenueData(transformedData) {
  var venues = {}
  // Loop through each venue type in temp
  Object.keys(transformedData).forEach(function (venueType) {
    // Create an array of objects for each venue type
    var venueData = transformedData[venueType].map(function (d) {
      return {
        Name: d.Area,
        Count: d.Count
      }
    })
    // Create a new object for the current venue type and add it to the venues object
    venues[venueType] = {
      children: venueData
    }
  })
  return venues
}

function updateInnovativeChart(startDate, endDate) {
  if (checkData == null) {
    loadCheckInDataBubble(startDate, endDate)
  } else {
    barBubbleChart(startDate, endDate)
  }
}
