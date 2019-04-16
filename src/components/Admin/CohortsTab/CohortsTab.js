import React, { Component } from 'react';
import AllCohorts from './AllCohorts';
import Cohort from './Cohort';

export default class CohortsTab extends Component {
  state = {
    cohortPage: 'all',
    cohortName: '',
    cohortStatus: ''
  }

  navigate = (cohortPage, name, status) => this.setState({ cohortPage, cohortName: name, cohortStatus: status })

  handleRender = () => {
    switch(this.state.cohortPage) {
      case 'all':
        return <AllCohorts navigate={ this.navigate } />
      default:
        return <Cohort navigate={ this.navigate }
                       cohortId={ this.state.cohortPage }
                       cohortName={ this.state.cohortName }
                       cohortStatus={ this.state.cohortStatus }
                       showProfile={ this.props.showProfile } />
    }
  }

  render() {
    return this.handleRender()
  }
}
