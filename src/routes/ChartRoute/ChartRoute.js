import React, { Component } from 'react';
import CalorieChart1 from '../../components/CalorieChart1/CalorieChart1';
import GramChart1 from '../../components/GramChart1/GramChart1';
import './ChartRoute.css';
import Datetime from 'react-datetime';
import moment from 'moment';
import Button from '../../components/Button/Button';
import EventsApiService from '../../services/events-api-service';
import UserContext from '../../contexts/UserContext';



class ChartRoute extends Component {
  static contextType = UserContext;
  state = {
    datePicker:false,
    start: null,
    end: null,
    title: 'Today\'s Nutrition',
    chartData: null,
    days:null
  }
  handleClick = () => {
    this.setState({
      datePicker: !this.state.datePicker,
      end:null,
      start:null
    });
  }

  handleSubmitStart = (event) => {
    event.preventDefault();
    let datetime = document.getElementsByClassName('form-control')[0].value;
    this.setState({
      start:datetime
    });
  }

  handleSubmitEnd = (event) => {
    event.preventDefault();
    let datetime = document.getElementsByClassName('form-control')[0].value;
    this.setState({
      end:datetime,
      datePicker:false
    });
  }

  renderDatePickerStart() {
    return <form onSubmit = {e => this.handleSubmitStart(e)} className = 'chartDatePicker shadow backgroundColor5'>
      <h3>Pick a Start Date</h3>
      <Datetime closeOnSelect={true} defaultValue={moment()} name = 'date' id = 'date' locale={'true'} timeFormat = {false}/>
      <Button className = 'backgroundColor6 shadow' type ='submit'>Next</Button>
      <p onClick = {this.handleClick} style={{cursor: 'pointer', marginTop: '10px'}}>cancel</p>
    </form>;
  }
  renderDatePickerEnd() {
    return <form onSubmit = {e => this.handleSubmitEnd(e)} className = 'chartDatePicker shadow backgroundColor5'>
      <h3>Pick an End Date</h3>
      <Datetime closeOnSelect={true} defaultValue={moment()} inputProps={{ readOnly: true }} timeFormat={false} />
      <Button className = 'backgroundColor6 shadow' type ='submit'>Submit</Button>
      <p onClick = {this.handleClick} style={{cursor: 'pointer', marginTop: '10px'}}>cancel</p>
    </form>;
  }

  getRange = () => {
    EventsApiService.getDateRangeEvents(this.state.start, this.state.end)
      .then(res => {
        let days=[];
        res.map(event => {
          if (!(days.includes(event.date.substring(0,10)))){
            days.push(event.date.substring(0, 10));
          }
          return event;
        });
        this.setState({
          chartData: res,
          days: days.length,
          title: `Nutrition Info for ${days.length} days`
        });
      });
    this.setState({
      end:null,
      start:null
    });
  }

  render() {
    if(this.state.end && this.state.start) {
      this.getRange();
    }
    return (
      <>
        <section className="chartsPage">          
          {this.state.datePicker && !this.state.start && this.renderDatePickerStart()}
          {this.state.datePicker && this.state.start && this.renderDatePickerEnd()}
          {!this.state.datePicker && <button className = 'center' onClick = {this.handleClick}>Pick a Date Range</button>}
          <h2>{this.state.title}:</h2>
          <h3>Calories:</h3>
          <CalorieChart1 days = {this.state.days} chartData = {this.state.chartData}/>
          <h3>Other Nutritional Stats:</h3>
          <GramChart1 days={this.state.days} chartData = {this.state.chartData} />
        </section>
      </>
    );
  }
}

export default ChartRoute;