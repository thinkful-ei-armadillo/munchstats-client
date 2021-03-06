import React, { Component } from 'react';
import MealDetails from '../../components/MealDetails/MealDetails';

class MealDetailsRoute extends Component {
  render() {
    return (
      <section>
        <MealDetails meal_id = {this.props.match.params.meal_id} history={this.props.history}/>
      </section>
    );
  }
}

export default MealDetailsRoute;