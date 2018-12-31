import React, { Component } from 'react';
import './App.css';
import { Data } from './data.js';

import { CanvasJS, CanvasJSChart } from './canvasjs.react';

function getClassByPractice(practice) {
  if (Data.classes[practice]) {
    return Data.classes[practice]
  }

  const p_name = practice.match(/\w+/)[0];
  const cls = Data.classes[p_name];

  if (!cls) {
    throw new Error('unknown practice ' + practice);
  }

  return cls;
}

function getDaysOfMonth(month) {
  const dates = [];
  for (let day = 1; day <= 31; day++) {
    dates.push(month + day);
  }
  return dates;
}

function getPracticesInDate(date, color) {
  let practices = Data.dates[date];
  if (!practices) {
    return [];
  }
  if (color) {
    practices = practices.filter(practice => getClassByPractice(practice).color === color);
  }
  return practices || [];
}

function getClassToString(clazz) {
  return `${clazz.name} (${clazz.duration})`;
}

function getLongestPracticeInDate(date) {
  let maxP = null;
  getPracticesInDate(date).map(p => getClassByPractice(p)).forEach(p => {
    if (!maxP || p.duration > maxP.duration) {
      maxP = p;
    }
  });
  return maxP;
}

function getAllColors() {
  return Array.from( new Set( Object.values(Data.classes).map(cls => cls.color || 'na') ) );
}

function getDurations(month, color) {

  return getDaysOfMonth(month).map(date => ({
      'label': date,
      'y': getPracticesInDate(date, color)
      .reduce(
        (sum, p) => sum += getClassByPractice(p).duration,
        0
      ),
      // 'color': (p = getLongestPracticeInDate(date)) && p.color
    }));
}

class App extends Component {
  constructor(props) {
    super(props);
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
    this.state = { };
  }

	toggleDataSeries(e){
		if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
			e.dataSeries.visible = false;
		}
		else{
			e.dataSeries.visible = true;
		}
    e.chart.render();
	}

  getTooltip(e) {
    let ps = getPracticesInDate(e.dataPoint.label, e.dataSeries.name)
      .map(p => getClassByPractice(p))
      .map((c,i) => getClassToString(c));

    ps.unshift(e.dataSeries.name + ':');
    return ps.join('<br/>');
  }

  getChartForMonth(month) {
    const byColor = getAllColors().map(color => (
    {
      type: "stackedColumn",
      dataPoints: getDurations(month, color),
      name: color,
      showInLegend: true,
    }));

    const options = {
          title: {
    				text: month
    			},
    			data: byColor,
          axisY:{
   maximum: 120,
 },
          legend: {
          				verticalAlign: "center",
          				horizontalAlign: "right",
          				reversed: true,
          				cursor: "pointer",
          				itemclick: this.toggleDataSeries
          			},
        toolTip: {
            content: (e) => this.getTooltip(e.entries[0])
        }
    };

    return <div style={{width: 1500}}><CanvasJSChart options={options} /></div>;
  }

  render() {
    const charts = ['Dec', 'Nov', 'Oct'].map(month =>
      this.getChartForMonth(month)
    );

    return (
      <div className="App">
        {charts}
      </div>
    );
  }
}

export default App;
