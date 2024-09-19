// Hint: This is a great place to declare your global variables

let svg;
let female_data, male_data;
let margin = { top: 50, right: 150, bottom: 50, left: 100 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
    // Create the SVG inside the #myDataVis div
    svg = d3.select("#myDataVis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load CSV files
    Promise.all([d3.csv('data/females_data.csv'), d3.csv('data/males_data.csv')])
        .then(function (values) {
            female_data = values[0];
            male_data = values[1];

            // Extract unique country names for the dropdown
            const header = Object.keys(female_data[0]);

            // Remove the first element (year)
            const countries = header.slice(1);

            // Populate the dropdown with country names
            const dropdown = d3.select("#countryDropdown");
            console.log(countries);

            countries.sort((a, b) => 0.5 - Math.random()).slice(0, 5).forEach(country => {
                dropdown.append("option").text(country).attr("value", country);
            });
            // Initial draw
            let selectedCountry = dropdown.node().value || countries[0];
            drawLollipopChart(selectedCountry);

            // Update chart when country changes
            dropdown.on("change", function () {
                selectedCountry = this.value;
                drawLollipopChart(selectedCountry);
            });
        });
});

// Function to draw the lollipop chart for the selected country
function drawLollipopChart(selectedCountry) {
    // Filter data for the selected country
    const parseYear = d3.timeParse("%Y");
    let filteredMaleData = male_data.map(d => ({ Year: parseYear(d["Year"]), Employment_Rate: +d[selectedCountry] }));
    let filteredFemaleData = female_data.map(d => ({ Year: parseYear(d["Year"]), Employment_Rate: +d[selectedCountry] }));

    // Scales
    const xScale = d3.scaleTime()
        .domain([new Date("1990-01-01T00:00:00"), new Date("2023-01-01T00:00:00")])  // Use the extent of the parsed dates
        .range([0, width]);

    const yMax = d3.max([...filteredMaleData, ...filteredFemaleData], d => Math.max(+d.Employment_Rate));

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);

    // Transition for axes
    const transition = d3.transition().duration(1000);

    // Update x-axis
    svg.selectAll(".x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Smooth transition for y-axis
    svg.selectAll(".y-axis")
        .transition(transition)
        .call(d3.axisLeft(yScale));

    // if the y-axis doesn't exist (first time), append it
    svg.selectAll(".y-axis").data([null])
        .join(
            enter => enter.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(yScale))
        );

    // Update lollipops for male data
    const maleLines = svg.selectAll(".line-male")
        .data(filteredMaleData);

    maleLines.join(
        enter => enter.append("line")
            .attr("class", "line-male")
            .attr("x1", d => xScale(d.Year) - 5)
            .attr("x2", d => xScale(d.Year) - 5)
            .attr("y1", yScale(0))
            .attr("y2", yScale(0))
            .attr("stroke", "teal")
            .transition(transition)
            .attr("y2", d => yScale(d.Employment_Rate)),
        update => update.transition(transition)
            .attr("x1", d => xScale(d.Year) - 5)
            .attr("x2", d => xScale(d.Year) - 5)
            .attr("y2", d => yScale(d.Employment_Rate))
    );

    const maleCircles = svg.selectAll(".circle-male")
        .data(filteredMaleData);

    maleCircles.join(
        enter => enter.append("circle")
            .attr("class", "circle-male")
            .attr("cx", d => xScale(d.Year) - 5)
            .attr("cy", yScale(0))
            .attr("r", 4)
            .attr("fill", "teal")
            .transition(transition)
            .attr("cy", d => yScale(d.Employment_Rate)),
        update => update.transition(transition)
            .attr("cx", d => xScale(d.Year) - 5)
            .attr("cy", d => yScale(d.Employment_Rate))
    );

    // Update lollipops for female data
    const femaleLines = svg.selectAll(".line-female")
        .data(filteredFemaleData);

    femaleLines.join(
        enter => enter.append("line")
            .attr("class", "line-female")
            .attr("x1", d => xScale(d.Year) + 5)
            .attr("x2", d => xScale(d.Year) + 5)
            .attr("y1", yScale(0))
            .attr("y2", yScale(0))
            .attr("stroke", "deeppink")
            .transition(transition)
            .attr("y2", d => yScale(d.Employment_Rate)),
        update => update.transition(transition)
            .attr("x1", d => xScale(d.Year) + 5)
            .attr("x2", d => xScale(d.Year) + 5)
            .attr("y2", d => yScale(d.Employment_Rate))
    );

    const femaleCircles = svg.selectAll(".circle-female")
        .data(filteredFemaleData);

    femaleCircles.join(
        enter => enter.append("circle")
            .attr("class", "circle-female")
            .attr("cx", d => xScale(d.Year) + 5)
            .attr("cy", yScale(0))
            .attr("r", 4)
            .attr("fill", "deeppink")
            .transition(transition)
            .attr("cy", d => yScale(d.Employment_Rate)),
        update => update.transition(transition)
            .attr("cx", d => xScale(d.Year) + 5)
            .attr("cy", d => yScale(d.Employment_Rate))
    );

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 250}, -45)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", "deeppink");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text("Female Employment Rate");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", "teal");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .text("Male Employment Rate");

    // add axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + 40})`)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", `translate(-60,${height / 2}) rotate(-90)`)
        .style("text-anchor", "middle")
        .text("Employment Rate ");

}