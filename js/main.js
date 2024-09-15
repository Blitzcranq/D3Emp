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
    console.log(selectedCountry);

    let filteredMaleData = male_data.map(d => ({ Year: +d["Year"], Employment_Rate: +d[selectedCountry] }));
    let filteredFemaleData = female_data.map(d => ({ Year: +d["Year"], Employment_Rate: +d[selectedCountry] }));
    console.log(male_data);
    console.log(filteredMaleData);
    console.log(filteredFemaleData);

    // Get all years from the data
    const allYears = male_data.map(d => +d["Year"]);
    console.log(allYears);

    // Scales
    const xScale = d3.scaleBand()
        .domain([allYears[0] - 1, ...allYears])
        .range([0, width])
        .padding(1)
        .align(0);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...filteredMaleData, ...filteredFemaleData], d => Math.max(+d.Employment_Rate))])
        .range([height, 0]);

    // Remove previous chart content
    svg.selectAll("*").remove();

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).tickValues(d3.range(1990, 2025, 5)));

    svg.append("g")
        .call(d3.axisLeft(yScale)); // Employment rates on y-axis

    // Draw lollipops for male data
    svg.selectAll(".line-male")
        .data(filteredMaleData)
        .enter()
        .append("line")
        .attr("x1", d => xScale(+d.Year) - 5)
        .attr("x2", d => xScale(+d.Year) - 5)
        .attr("y1", yScale(0))
        .attr("y2", d => yScale(+d.Employment_Rate))
        .attr("stroke", "teal");

    svg.selectAll(".circle-male")
        .data(filteredMaleData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(+d.Year) - 5)
        .attr("cy", d => yScale(+d.Employment_Rate))
        .attr("r", 4)
        .attr("fill", "teal");

    // Draw lollipops for female data
    svg.selectAll(".line-female")
        .data(filteredFemaleData)
        .enter()
        .append("line")
        .attr("x1", d => xScale(+d.Year) + 10 - 5)
        .attr("x2", d => xScale(+d.Year) + 10 - 5)
        .attr("y1", yScale(0))
        .attr("y2", d => yScale(+d.Employment_Rate))
        .attr("stroke", "deeppink");

    svg.selectAll(".circle-female")
        .data(filteredFemaleData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(+d.Year) + 10 - 5)
        .attr("cy", d => yScale(+d.Employment_Rate))
        .attr("r", 4)
        .attr("fill", "deeppink");

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, -40)`);

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
