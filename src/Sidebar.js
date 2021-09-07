import React, { Component } from 'react';
import RefuseTypeButtonsRadio from './RefuseTypeButtonsRadio';
import YearButton from './YearButton';
import SortOrderRadio from './SortOrderRadio';


export default class Sidebar extends Component {
  render() {
    return (

      <aside className="sidebar">

        <h1 className="title">Data Visualization Dashboard</h1>

          <p className="sidebar-text">Visualizing a neighborhood comparison of trash, recycling, and compost pick-up in New York City.</p>

          <YearButton yearDropdownSubmit={this.props.yearDropdownSubmit} />

          <RefuseTypeButtonsRadio refuseTypeSubmit={this.props.refuseTypeSubmit} />

          <SortOrderRadio sortOrderRadioSubmit={this.props.sortOrderRadioSubmit} />

          <br/>
      </aside>
    );
  }
}
