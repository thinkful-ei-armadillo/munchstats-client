
import React, { Component } from 'react'
import Button from '../Button/Button'
import config from '../../config';
import TokenService from '../../services/token-service';
import './MealDetails.css';

export default class Meals extends Component {
  state = {
    ingredientInput: '',
    results: [],
    chosenIngredient: '',
    finalIngredients: [],
    mealInfo: {},
    mealIngredients: []
  }

  componentDidMount() {
    this.getMealInfo();
    this.getMealIngredients();
  }

  getMealInfo(){
    return fetch(`${config.API_ENDPOINT}/meal/${this.props.meal_id}`, {
      headers: {
        "authorization": `bearer ${TokenService.getAuthToken()}`
      }
    })
    .then(res => (res.json()))
    .then(res => {
      this.setState({mealInfo: res[0]});
    })
    .catch(err => console.log(err));
  }

  getMealIngredients(){
    return fetch(`${config.API_ENDPOINT}/ingredients`, {
      method: 'POST',
      headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${TokenService.getAuthToken()}`
      },
      body: JSON.stringify({meal: {id: this.props.meal_id}})
      })
      .then(res => 
          (!res.ok) 
          ? res.json().then(e => Promise.reject(e)) 
          : res.json()
      )
      .then(res => this.setState({mealIngredients: res.ingredients}));
  }

  handleInput = (e) => {
    this.setState({ ingredientInput: e.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ results: [] })
    let encodedInput = encodeURI(this.state.ingredientInput)
    fetch(`${config.API_ENDPOINT}/proxy/foods`, {
      method: 'POST',
      body: JSON.stringify({food: encodedInput}),
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(results => {
        // console.log(res)
        // for (let i = 0; i < 10; i++) {
        //   let item = res.hints[i]
        //   let newIngredient = {
        //     id: item.food.foodId,
        //     name: item.food.label,
        //     calories: (item.food.nutrients.ENERC_KCAL) ? item.food.nutrients.ENERC_KCAL : 0,
        //     protein: (item.food.nutrients.PROCNT) ? item.food.nutrients.PROCNT : 0,
        //     fat: (item.food.nutrients.FAT) ? item.food.nutrients.FAT : 0,
        //     carbs: (item.food.nutrients.CHOCDF) ? item.food.nutrients.CHOCDF : 0,
        //     image: item.food.image,
        //     measures: item.measures
        //   }
          // this.setState({ results: [...this.state.results, newIngredient] })
          this.setState({ results})
      })
      .catch(err => console.log(err))

  }

  handleClickIngredient = (item) => {
    this.setState({
      chosenIngredient: item,
      results: []
    })
  }

  getNutrientInfo = (e) => {
    e.preventDefault();
    let { quantity, measurements } = e.target;
    measurements = measurements.value.split(',');

    let uri = measurements[0];
    let label = measurements[1];

    const ingredients = 
        [
          {
            "quantity": Number(quantity.value),
            "measureURI": uri,
            "foodId": this.state.chosenIngredient.id
          }
        ]

    const body = {
      ingredients,
      name: this.state.chosenIngredient.name,
      label,
      quantity: Number(quantity.value)
    }
    fetch(`${config.API_ENDPOINT}/proxy/nutrition`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      return (res.json())
    }).then(res => {
      //send ingredient to items table in database
      this.setState({
        finalIngredients: [...this.state.finalIngredients, res],
        chosenIngredient: '',
        ingredientInput: '',
      })
      let results = {
        ingredient: {
          meal_id: Number(this.props.meal_id),
          name: res.name,
          total_calorie: Math.round(res.total_calorie),
          total_fat: Math.round(res.total_fat),
          total_carbs: Math.round(res.total_carbs),
          total_protein: Math.round(res.total_protein),
          amount: Number(quantity.value),      
          unit: res.unit
        }
      }
      fetch(`${config.API_ENDPOINT}/ingredients/${this.props.meal_id}`, {
        method: 'POST',
        body: JSON.stringify(results),
        headers: {
          'Content-Type': 'application/json',
          "authorization": `bearer ${TokenService.getAuthToken()}`
        }
      }).then(test => test.json())
      .then(() => {

        const newMealStats = {
          total_calorie: Number(this.state.mealInfo.total_calorie) + Number(results.ingredient.total_calorie),
          total_fat: Number(this.state.mealInfo.total_fat) + Number(results.ingredient.total_fat),
          total_carbs: Number(this.state.mealInfo.total_carbs) + Number(results.ingredient.total_carbs),
          total_protein: Number(this.state.mealInfo.total_protein) + Number(results.ingredient.total_protein)
        }
        const patchedMeal = {"meal": {...this.state.mealInfo, ...newMealStats} }
        fetch(`${config.API_ENDPOINT}/meal`, {
          method: 'PATCH',
          body: JSON.stringify(patchedMeal),
          headers: {
            'Content-Type': 'application/json',
            "authorization": `bearer ${TokenService.getAuthToken()}`
          }
        })
        .then(() => {
          this.getMealInfo();
          this.getMealIngredients();
        })
      })
    })
  }

  generateMeasureForm = () => {
    return <form className = 'measureForm' onSubmit={e => this.getNutrientInfo(e)}>
      <p>{this.state.chosenIngredient.name}</p>
      <label htmlFor='quantity'>how much do you want to add?</label>
      <input type='number' name='quantity' min='0' step='.25'>
      </input>
      <select name='measurements'>
        {this.state.chosenIngredient.measures.map((measure, index) => {
          return <option key={index} value={`${measure.uri},${measure.label}`} name={measure.label} >{measure.label}</option>
        })}
      </select>
      <button type='submit'> submit </button>
    </form>
  }

  generateResults = () => {
       return this.state.results.map((item, key) => <div id = 'results' key={key} onClick={() => this.handleClickIngredient(item)}><span>{item.name}</span></div>
      )
  }

  // generateMealStats = () => {
  //   let fat = 0;
  //   let calories = 0;
  //   let carbs = 0;
  //   let protein = 0;
  //   this.state.mealIngredients.map((item, key) => {
      
  //     fat += Number(item.total_fat)
  //     calories += Number(item.total_calorie)
  //     carbs += Number(item.total_carbs)
  //     protein += Number(item.total_protein)
  //   })
  //   let newMealInfo = {...this.state.mealInfo}
  //   newMealInfo.total_calorie = calories;
  //   newMealInfo.total_carbs = carbs;
  //   newMealInfo.total_fat = fat;
  //   newMealInfo.total_protein = protein;

  //   this.setState({
  //     mealInfo: newMealInfo
  //   })

  //   return <div className = 'nutritionInfo' >
  //     <h4>Meal Nutrition Information</h4>
  //     <p>calories: {Math.round(calories)}</p><p> fat: {Math.round(fat)} </p><p>carbs: {Math.round(carbs)} </p><p>protein: {Math.round(protein)}</p>
  //   </div>
  // }

  renderMealStats() {
    return <>
        <h4>Meal Nutrition Information</h4>
        <div className='nutritionInfo' >
          <p>calories: {Math.round(this.state.mealInfo.total_calorie)}</p>
          <p> fat: {Math.round(this.state.mealInfo.total_fat)} </p>
          <p>carbs: {Math.round(this.state.mealInfo.total_carbs)} </p>
          <p>protein: {Math.round(this.state.mealInfo.total_protein)}</p>
        </div>
      </>
  }

  generateFinalIngredients = () => {
    return this.state.mealIngredients.map((item, key) => <div key={key}>
      <span>
        {item.name} | {item.amount} {item.unit}
      </span>
      <span onClick={() => this.handleClickDelete(item.id)}><i class="fas fa-trash"></i></span>
    </div>
    )
  }

  handleClickDelete = (ingredient_id) => {
    fetch(`${config.API_ENDPOINT}/ingredients/`, {
      method: 'DELETE',
      body: JSON.stringify({ingredient_id}),
      headers: {
        'Content-Type': 'application/json',
        "authorization": `bearer ${TokenService.getAuthToken()}`
      }
    })
    .then(res => res.json)
    .then(() => {
      this.getMealInfo();
    this.getMealIngredients();
    })
    .catch(err => console.log(err))
  }

  handleGoBackClicked = () => {
    const  { history } = this.props;
    history.goBack();
  }

// display the current items in the meal
  // componentDidMount() {
  //   this.state.meal_id = 1;
  //   fetch(`${config.API_ENDPOINT}/meal`, {
  //     headers: {
  //       "authorization": `bearer ${TokenService.getAuthToken()}`
  //     }
  //   })
  //   .then(res => (res.json()))
  //   .then(res => {
  //     this.state.finalIngredients.push
  //   })
  // }


  render() {
    
    return (
      <>
        <section className='goBack'>
          <span onClick={() => this.handleGoBackClicked()} className='back_button'><i class="fas fa-chevron-left"></i></span>
        </section>
        <h3 className='mealName'>{this.state.mealInfo ? this.state.mealInfo.name : ''}</h3>

        <div className = 'mealContainer'> {/* main flex */}

          <div className = 'addIngredientContainer'>
            <h3>Add an ingredient to your meal</h3>
            <form
              className='mealForm'
              onSubmit={this.handleSubmit}
            >
              {/* <div role='alert'>
              {error && <p>{error}</p>}
            </div> */}
              <label htmlFor='ingredient-input'>
                Ingredient
              </label>
              <input
                ref={this.firstInput}
                id='ingredient-input'
                name='ingredient-input'
                value={this.state.ingredientInput}
                onChange={this.handleInput}
                required
              />
              <Button type='submit'>
                Search ingredients
              </Button>
            </form>

            {this.state.chosenIngredient ? this.generateMeasureForm() : null}
            
            <section className="results">
              {(this.state.results.length >= 1) && <h4>Pick one from below</h4>}
              {(this.state.results.length >= 1) && this.generateResults()}
            </section>
          </div>


          <div className = 'statsContainer'>

            <section className = 'finalIngredientsContainer'>
              <h4>Meal Ingredients</h4>
              <div className="finalIngredients">
                {(this.state.mealIngredients[0]) ? this.generateFinalIngredients() : 'Nothing so far!'}
              </div>
            </section>
            <section className='currentMealStats'>
              {this.renderMealStats()}
            </section>
          </div>
          
        </div>
      </>
    );
  }
}
