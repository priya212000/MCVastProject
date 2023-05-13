var participantID_apartmentID = {};
var participantID_joviality = {};
var participantID_educationLevel = {};
var apartmentID_location = {};
var participantID_apartmentLocation_joviality = {};
var participantID_apartmentLocation_educationLevel = {};
var location_cluster = [];
var location_cluster_dict = {};
var clusterChosen = "None";
var allDataLineChart = [];


var educationLevelMapping = { "Low": 1, "HighSchoolOrCollege": 2, "Bachelors": 3, "Graduate": 4 }
var chosenDataType = "joviality";

function updateCheckboxValues(chosenValue, idchosen) {
    if (idchosen === "id-joviality" && chosenValue == true) {
        d3.select("#id-educationLevel").property("checked", false);
        d3.select("#id-cluster").property("checked", false);
        chosenDataType = "joviality";
    }
    else if (idchosen === "id-educationLevel" && chosenValue == true) {
        d3.select("#id-joviality").property("checked", false);
        d3.select("#id-cluster").property("checked", false);
        chosenDataType = "educationLevel";
    }
    else if (idchosen === "id-cluster" && chosenValue == true) {
        d3.select("#id-joviality").property("checked", false);
        d3.select("#id-educationLevel").property("checked", false);
        chosenDataType = "clusterData";
    }
    drawChart();
}

// document.addEventListener('DOMContentLoaded', function () {
function createHeatMap(csvFilename) {
    d3.select("#id-joviality").property("checked", true);
    d3.select("#id-educationLevel").property("checked", false);
    d3.select("#id-cluster").property("checked", false);
    chosenDataType = "joviality";

    Promise.all([
        d3.csv(csvFilename)])
        .then(function (values) {
            allDataHeatMap = values[0];

            for (var i = 0; i < allDataHeatMap.length; i++) {
                participantID_joviality[allDataHeatMap[i].participantID] = allDataHeatMap[i].joviality;
                participantID_educationLevel[allDataHeatMap[i].participantID] = educationLevelMapping[allDataHeatMap[i].educationLevel];
                apartmentID_location[allDataHeatMap[i].apartmentID] = [Number(allDataHeatMap[i].locationx), Number(allDataHeatMap[i].locationy)]
                participantID_apartmentLocation_joviality[allDataHeatMap[i].participantID] = [Number(allDataHeatMap[i].locationx), Number(allDataHeatMap[i].locationy), allDataHeatMap[i].joviality];
                participantID_apartmentLocation_educationLevel[allDataHeatMap[i].participantID] = [Number(allDataHeatMap[i].locationx), Number(allDataHeatMap[i].locationy), educationLevelMapping[allDataHeatMap[i].educationLevel]];
                location_cluster.push([Number(allDataHeatMap[i].locationx), Number(allDataHeatMap[i].locationy), allDataHeatMap[i].cluster]);
                location_cluster_dict[String(Number(allDataHeatMap[i].locationx)).concat(" ", String(Number(allDataHeatMap[i].locationy)))] = allDataHeatMap[i].cluster;
            }


            drawChart();
        });
};
// });


function drawChart() {
    const svg = d3.select("#heatmap-svg");
    svg.selectAll("*").remove();

    svgHeight = svg.node().getBoundingClientRect().height - 40;
    svgWidth = svgHeight * 1076 / 1144;//svg.node().getBoundingClientRect().width;

    svg
        .attr("width", svgWidth)
        .attr("height", svgHeight)

    var yMaxValue = Number.MIN_SAFE_INTEGER;
    var yMinValue = Number.MAX_SAFE_INTEGER;
    var xMaxValue = Number.MIN_SAFE_INTEGER;
    var xMinValue = Number.MAX_SAFE_INTEGER;

    var apartmentID_location_keys = Object.keys(apartmentID_location);
    for (var i = 0; i < apartmentID_location_keys.length; i++) {
        if (yMaxValue < apartmentID_location[apartmentID_location_keys[i]][1]) {
            yMaxValue = apartmentID_location[apartmentID_location_keys[i]][1]
        }
        if (xMaxValue < apartmentID_location[apartmentID_location_keys[i]][0]) {
            xMaxValue = apartmentID_location[apartmentID_location_keys[i]][0]
        }
        if (yMinValue > apartmentID_location[apartmentID_location_keys[i]][1]) {
            yMinValue = apartmentID_location[apartmentID_location_keys[i]][1]
        }
        if (xMinValue > apartmentID_location[apartmentID_location_keys[i]][0]) {
            xMinValue = apartmentID_location[apartmentID_location_keys[i]][0]
        }
    }


    var yAxisRange = d3.scaleLinear()
        .domain([yMinValue, yMaxValue])
        .range([svgHeight, 0])



    var xAxisRange = d3.scaleLinear()
        .range([0, svgWidth])
        .domain([xMinValue, xMaxValue])


    if (chosenDataType == "clusterData") {

        svg.append('image')
            .attr('xlink:href', 'js/heatMap/BaseMap.png')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr('opacity', 1);

        var color;

        var values_forDensityData;
        for (var clusterIditer = 0; clusterIditer < 4; clusterIditer++) {
            values_forDensityData = [];

            for (var i = 0; i < location_cluster.length; i++) {
                if (location_cluster[i][2] == clusterIditer) {
                    values_forDensityData.push(location_cluster[i])
                }
            }
            color = d3.scaleOrdinal()
                .domain(["0", "1", "2", "3"])
                .range(["#440154ff", "#21908dff", "#fde725ff", "blue"])

            svg
                .selectAll(".cluster".concat(clusterIditer))
                .data(values_forDensityData)
                .enter()
                .append("circle")
                .attr("class", "cluster".concat(clusterIditer))
                .on("click", function (d, i) {
                    d3.selectAll(".cluster0")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster1")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster2")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster3")
                        .style('opacity', 0.2)
                    if ("cluster".concat(i[2]) == clusterChosen) {
                        clusterChosen = "None"
                    }
                    else {
                        clusterChosen = "cluster".concat(i[2])
                        var hashtag = ".cluster".concat(i[2]);
                        d3.selectAll(hashtag)
                            .style('opacity', 1)
                    }
                })

                .on("mouseover", function (d, i) {
                    var hashtag = ".cluster".concat(i[2]);
                    d3.selectAll(hashtag)
                        .style('opacity', 0.6)

                })
                .on("mouseout", function (d, i) {
                    d3.selectAll(".cluster0")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster1")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster2")
                        .style('opacity', 0.2)
                    d3.selectAll(".cluster3")
                        .style('opacity', 0.2)
                    if (clusterChosen != "None") {
                        var hashtag = ".".concat(clusterChosen);
                        d3.selectAll(hashtag)
                            .style('opacity', 1)
                    }

                })

                .attr("cx", function (d) { return xAxisRange(d[0]); })
                .attr("cy", function (d) { return yAxisRange(d[1]); })
                .attr("r", 10)
                .style("fill", function (d) { return color(d[2]); })
                .attr('opacity', 0.2)
                .attr("id", function (d) { return "cluster_".concat(clusterIditer); })

        }

    }
    else {
        var values_forDensityData = [];
        if (chosenDataType == "joviality") {
            values_forDensityData = Object.keys(participantID_apartmentLocation_joviality).map(function (key) {
                return participantID_apartmentLocation_joviality[key];
            });
        }
        else if (chosenDataType == "educationLevel") {
            values_forDensityData = Object.keys(participantID_apartmentLocation_educationLevel).map(function (key) {
                return participantID_apartmentLocation_educationLevel[key];
            });
        }
        const densityData = d3.contourDensity()
            .x(function (d) {
                return xAxisRange(d[0]);
            })
            .y(function (d) { return yAxisRange(d[1]); })
            .weight(function (d) { return d[2]; })
            .size([svgWidth, svgHeight])
            .bandwidth(18)
            (values_forDensityData)


        colorRange = [0, 0]

        for (var i = 0; i < densityData.length; i++) {

            if (densityData[i].value > colorRange[1]) {
                colorRange[1] = densityData[i].value
            }
            if (densityData[i].value < colorRange[0]) {
                colorRange[0] = densityData[i].value
            }
        }

        var color = d3
            .scaleLinear()
            // .scaleSequential()
            .domain([colorRange[0], (colorRange[1] / 3)])
            .range(["white", "#0047AB"])
        // .interpolator(d3.interpolateRdYlGn)

        svg
            .insert("g", "g")
            .attr('height', svgHeight)
            .attr('width', svgWidth)
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", function (d) { return color(d.value); })



        svg.append('image')
            .attr('height', svgHeight)
            .attr('width', svgWidth)
            .attr('opacity', 0.5)
            .attr("id", 'imageBaseMap')
            .attr('xlink:href', 'js/heatMap/BaseMap.png')
    }



}


