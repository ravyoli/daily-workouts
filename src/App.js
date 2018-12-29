import React, { Component } from 'react';
import './App.css';
import { BarChart } from 'react-easy-chart';
import { Data } from'./data.js';

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

function getPracticesInDate(date) {
  return Data.dates[date] || [];
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

function getDurations(month) {
  var p;
  return getDaysOfMonth(month).map(date => ({
      'x': date,
      'y': getPracticesInDate(date)
      .reduce(
        (sum, p) => sum += getClassByPractice(p).duration,
        0
      ),
      'color': (p = getLongestPracticeInDate(date)) && p.color
    }));
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  getTooltip() {
    if(!this.state.showToolTip) {
      return null;
    }

    const divStyle = {
      position: "absolute",
      top: this.state.top,
      left: this.state.left,
      backgroundColor: 'white',
      border: 'solid black 1px',
      padding: '2px',
      width: '300px',
      transform: 'translate(0, -100%)',
    };

    const practices =
    getPracticesInDate(this.state.x)
      .map(p => getClassByPractice(p))
      .map((c,i) => <div key={i}>{getClassToString(c)}</div>);

    return <div style={divStyle}>
      {this.state.x}: {this.state.y} minutes
      {practices}
    </div>;
  }

  getChartForMonth(month) {
    return <BarChart
      key={"bar-" + month}
      axes
      grid
      yTickNumber={4}
      yDomainRange={[0, 120]}
      mouseOutHandler={this.mouseOutHandler.bind(this)}
      mouseMoveHandler={this.mouseMoveHandler.bind(this)}
      height={400}
      width={1000}
      data={getDurations(month)}
    />;
  }

  render() {
    const charts = ['Dec', 'Nov', 'Oct'].map(month =>
      this.getChartForMonth(month)
    );

    return (
      <div className="App">
        {charts}
        {this.getTooltip()}
      </div>
    );
  }

  mouseMoveHandler(d,e) {
    this.setState({
      showToolTip: true,
      top: `${e.pageY - 4}px`,
      left: `${e.pageX + 4}px`,
      y: d.y,
      x: d.x});
  }

  mouseOutHandler() {
    this.setState({showToolTip: false});
  }
}

export default App;
