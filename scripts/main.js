const fillColors = [
  '#f7fbff',
  '#deebf7',
  '#c6dbef',
  '#9ecae1',
  '#6baed6',
  '#4292c6',
  '#2171b5',
  '#08519c',
  '#08306b'
];

const thresholds = [3, 12, 21, 30, 39, 48, 57, 66];

window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (topographyData, educationData) => {
  const chartTitle = 'United States Educational Attainment';
  const chartDescription =
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";

  const chartDimensions = {
    width: 1200,
    height: 1000,
    padding: { top: 100, bottom: 100, right: 100, left: 100 }
  };

  const titleX = 250;
  const titleY = 60;
  const descriptionX = 160;
  const descriptionY = 90;

  const svg = createSVG(chartDimensions);
  drawTitle(svg, titleX, titleY, chartTitle);
  drawDescription(svg, descriptionX, descriptionY, chartDescription);
  drawMap(svg, topographyData, educationData);

  drawLegend(svg);
  initMapEventHandlers();
};

const drawMap = (svg, topographyData, educationData) => {
  const { geoCounties } = getGeoJSON(topographyData);

  const mapSvg = svg
    .append('svg')
    .attr('id', 'map-svg')
    .attr('y', 130)
    .attr('x', 25);

  // Draw counties
  mapSvg
    .selectAll('path')
    .data(geoCounties.features)
    .enter()
    .append('path')
    .attr('transform', 'scale(1.2)')
    .attr('d', d3.geoPath())
    .attr('class', 'county')
    .attr('fill', (d) =>
      getFillColor(educationData.filter((county) => county.fips === d.id)[0])
    )
    .attr('data-fips', (d) => d.id)
    .attr(
      'data-county',
      (d) => educationData.filter((county) => county.fips === d.id)[0].area_name
    )
    .attr(
      'data-state',
      (d) => educationData.filter((county) => county.fips === d.id)[0].state
    )
    .attr(
      'data-education',
      (d) =>
        educationData.filter((county) => county.fips === d.id)[0]
          .bachelorsOrHigher
    );

  // Draw state outlines
  mapSvg
    .append('path')
    .datum(
      topojson.mesh(
        topographyData,
        topographyData.objects.states,
        (a, b) => a !== b
      )
    )
    .attr('fill', 'none')
    .attr('stroke', fillColors[0])
    .attr('stroke-linkjoin', 'round')
    .attr('transform', 'scale(1.2)')
    .attr('d', d3.geoPath());
};

const getGeoJSON = (topojsonData) => {
  const geoNation = topojson.feature(topojsonData, topojsonData.objects.nation);
  const geoStates = topojson.feature(topojsonData, topojsonData.objects.states);
  const geoCounties = topojson.feature(
    topojsonData,
    topojsonData.objects.counties
  );
  return { geoNation, geoStates, geoCounties };
};

const createSVG = (chartDimensions) =>
  d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartDimensions.width)
    .attr('height', chartDimensions.height)
    .attr('class', 'chart');

const displayTooltip = (mouseCoords, data) => {
  const offset = { x: 20, y: 20 };

  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = `${mouseCoords.x + offset.x}px`;
  tooltip.style.top = `${mouseCoords.y + offset.y}px`;
  tooltip.style.visibility = 'visible';
  tooltip.setAttribute('data-education', data.education);

  let markup = `
  <strong>${data.county}, ${data.state}: ${data.education}%</strong>
  `;

  tooltip.innerHTML = markup;
};

const makeJSONRequest = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    xhr.onload = () => {
      if (xhr.status !== 200) reject('Bad status code');
      else resolve(JSON.parse(xhr.responseText));
    };
  });
};

const getData = async () => {
  const topographyDataURL =
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
  const educationDataURL =
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

  try {
    const data = await Promise.all([
      makeJSONRequest(topographyDataURL),
      makeJSONRequest(educationDataURL)
    ]);
    return drawGraph(data[0], data[1]);
  } catch (err) {
    return console.error(err);
  }
};

const getFillColor = (educationData) => {
  const degreePct = educationData.bachelorsOrHigher;
  if (degreePct >= thresholds[7]) {
    // console.log(typeof degreePct, degreePct);
    // console.log(typeof thresholds[7], thresholds[7]);
    return fillColors[8];
  } else if (degreePct >= thresholds[6]) {
    return fillColors[7];
  } else if (degreePct >= thresholds[5]) {
    return fillColors[6];
  } else if (degreePct >= thresholds[4]) {
    return fillColors[5];
  } else if (degreePct >= thresholds[3]) {
    return fillColors[4];
  } else if (degreePct >= thresholds[2]) {
    return fillColors[3];
  } else if (degreePct >= thresholds[1]) {
    return fillColors[2];
  } else if (degreePct >= thresholds[0]) {
    return fillColors[1];
  } else return fillColors[0];
};

const drawLegend = (svg) => {
  const legendBoxWidth = 25;
  const offset = { x: 800, y: 150 };

  const legend = svg.append('svg').attr('id', 'legend');

  const legendScale = d3.scaleOrdinal().domain(thresholds);
  legendScale.range(
    legendScale.domain().map((val, i) => offset.x + i * legendBoxWidth)
  );
  const legendAxis = d3.axisBottom(legendScale);
  legend
    .append('g')
    .attr(
      'transform',
      `translate(${legendBoxWidth - 0.5}, ${offset.y + legendBoxWidth})`
    )
    .call(legendAxis);

  legend
    .selectAll('rect')
    .data(fillColors)
    .enter()
    .append('rect')
    .attr('stroke', '#333')
    .attr('x', (d, i) => offset.x + legendBoxWidth * i)
    .attr('y', offset.y)
    .attr('fill', (d) => d)
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth);
};

const initMapEventHandlers = () => {
  const counties = document.querySelectorAll('.county');
  counties.forEach((county) => {
    county.addEventListener('mouseover', (e) => {
      const county = e.target.getAttribute('data-county');
      const state = e.target.getAttribute('data-state');
      const education = e.target.getAttribute('data-education');
      displayTooltip(
        { x: e.clientX, y: e.clientY },
        { county, state, education }
      );
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
