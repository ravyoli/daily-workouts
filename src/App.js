import React, { Component } from 'react';
import './App.css';
import { Data } from './data.js';

import { CanvasJSChart } from './canvasjs.react';


const DATES = ['2019-04', '2019-03', '2019-02', '2019-01', '2018-12', '2018-11', '2018-10'];

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
  month = new Date(month);
  for (let day = 1; day <= 31; day++) {
    let date = new Date(month);
    date.setDate(day);
    if (date.getMonth() === month.getMonth()) {
      dates.push(date);
    }
  }
  return dates;
}

function getPracticesInDate(date, color) {
  if (date.toISOString) {
    date = date.toISOString().slice(0,10);
  }

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

function getAllColors() {
  return Array.from( new Set( Object.values(Data.classes).map(cls => cls.color || 'na') ) );
}

function getDurations(month, color) {

  return getDaysOfMonth(month).map(date => ({
      'x': date,
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
    this.charts = { };
  }

	toggleDataSeries(e) {
    const dsName = e.dataSeries.name;
    const charts = Object.values(this.charts);
    if (this.focused === dsName) {
      this.focused = null;
    } else {
      this.focused = dsName;
    }

    charts.forEach(chart => {
      chart.options.data.filter(ds => ds.name === dsName)[0].visible = true;
      chart.options.data.filter(ds => ds.name !== dsName).forEach(ds => ds.visible = !this.focused );
      chart.render();
    });
	}

  getTooltip(e) {
    let ps = getPracticesInDate(e.dataPoint.x, e.dataSeries.name)
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
          axisX: {
            interval: 1,
            intervalType: "day",
            valueFormatString: "DDD",
          },
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

    return <div style={{width: 1500, padding:10}}><CanvasJSChart options={options} onRef={ref => this.charts[month] = ref} /></div>;
  }

  render() {
    const charts = DATES.map(month =>
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
