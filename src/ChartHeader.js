import React, { Component } from 'react';

export default class ChartHeader extends Component {
  render() {

  if (this.props.refuseType === "allcollected") {
  this.heading = "Trash/Recycling/Compost"
} else if (this.props.refuseType === "refusetonscollected") {
  this.heading = "Trash"
} else if (this.props.refuseType === "papertonscollected" ) {
  this.heading = "Paper & Cardboard"
} else if (this.props.refuseType === "mgptonscollected" ) {
  this.heading = "Metal/Glass/Plastic"
} else if (this.props.refuseType === "resorganicstons" ) {
  this.heading = "Organics"
} else if (this.props.refuseType === "leavesorganictons" ) {
  this.heading = "Leaves"
} else if (this.props.refuseType === "xmastreetons" ) {
  this.heading = "Christmas Tree"}

    return (
      <div>
        <h2>
          <span id="chart-description">Comparing {this.heading} Collection for </span>
          <span id="chart-year">{this.props.year}</span>
        </h2>

      </div>
    );
  }
}
