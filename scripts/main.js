window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (countyData, educationData) => {
  const chartTitle = 'United States Educational Attainment';
  const chartDescription =
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";

  const chartDimensions = {
    width: 1000,
    height: 600,
    padding: { top: 100, bottom: 100, right: 100, left: 100 }
  };

  const titleX = 215;
  const titleY = 50;
  const descriptionX = 220;
  const descriptionY = 75;

  const svg = createSVG(chartDimensions);
  drawTitle(svg, titleX, titleY, chartTitle);
  drawDescription(svg, descriptionX, descriptionY, chartDescription);

  // drawLegend(svg);
};

const createSVG = (chartDimensions) =>
  d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
    .attr('class', 'chart');

const displayTooltip = (mouseCoords, data) => {
  const offset = { x: 20, y: -20 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';

  let markup = `
  `;

  tooltip.innerHTML = markup;
};

const makeJSONRequest = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
  });
};

const getData = () => {
  const countyDataURL =
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
  const educationDataURL =
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

  return Promise.all([
    makeJSONRequest(countyDataURL),
    makeJSONRequest(educationDataURL)
  ]).then((data) => drawGraph(data[0], data[1]));
};

const getFillColor = (temp) => {
  if (temp >= 12.8) {
    return cellColors[10];
  } else if (temp >= 11.7) {
    return cellColors[9];
  } else if (temp >= 10.6) {
    return cellColors[8];
  } else if (temp >= 9.5) {
    return cellColors[7];
  } else if (temp >= 8.3) {
    return cellColors[6];
  } else if (temp >= 7.2) {
    return cellColors[5];
  } else if (temp >= 6.1) {
    return cellColors[4];
  } else if (temp >= 5.0) {
    return cellColors[3];
  } else if (temp >= 3.9) {
    return cellColors[2];
  } else if (temp >= 2.8) {
    return cellColors[1];
  } else return cellColors[0];
};

const drawLegend = (svg) => {
  const legendBoxWidth = 40;

  const legend = svg.append('svg').attr('id', 'legend');

  const legendScale = d3
    .scaleOrdinal()
    .domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]);
  // .range(100, 100 + 11 * legendBoxWidth);
  legendScale.range(
    legendScale.domain().map((val, i) => 100 + i * legendBoxWidth)
  );
  const axis = d3.axisBottom(legendScale);
  legend
    .append('g')
    .attr('transform', `translate(${legendBoxWidth - 0.5},540)`)
    .call(axis);

  legend
    .selectAll('rect')
    .data(cellColors)
    .enter()
    .append('rect')
    .attr('stroke', '#333')
    .attr('x', (d, i) => 100 + legendBoxWidth * i)
    .attr('y', 500)
    .attr('fill', (d) => d)
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth);
};

const initMapEventHandlers = () => {
  const counties = document.querySelectorAll('.cell');
  counties.forEach((county) => {
    county.addEventListener('mouseover', (e) => {
      displayTooltip({ x: e.clientX, y: e.clientY });
    });
    county.addEventListener('mouseleave', (e) => {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.visibility = 'hidden';
    });
  });
};

const drawDescription = (svg, descriptionX, descriptionY, chartDescription) => {
  svg
    .append('text')
    .attr('id', 'description')
    .attr('x', descriptionX)
    .attr('y', descriptionY)
    .text(chartDescription);
};

const drawTitle = (svg, titleX, titleY, chartTitle) => {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
};
