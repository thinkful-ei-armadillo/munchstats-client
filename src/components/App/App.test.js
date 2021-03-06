import React from 'react';
import App from './App';
import {MemoryRouter} from 'react-router-dom';
import {mount} from 'enzyme';
import renderer from 'react-test-renderer';

describe('<App />', () => {
  it('Renders without crashing', () => {
    mount(<MemoryRouter><App /></MemoryRouter>);
  });
  it('renders the UI as expected', () => {
    const tree = renderer
      .create(<MemoryRouter><App/></MemoryRouter>)
      .toJSON();
    expect(tree).toMatchSnapshot();  
  });
});