import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import _lodash from 'lodash';
import popNeighbData from './popNeighbData';
import Sidebar from './Sidebar';
import ChartHeader from './ChartHeader';
import BarChart from './BarChart';
import Footer from './Footer';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      valueForColors: "borough",
      refuseType: "allcollected",
      year: "2021",
      neighborhood: "bronx 1",
      // dataSort values: ascending, descending or alphabetical
      dataSort: 'sort ascending',
    }

    this.refuseTypeSubmit = this.refuseTypeSubmit.bind(this)
    this.yearDropdownSubmit = this.yearDropdownSubmit.bind(this)
    this.sortOrderRadioSubmit = this.sortOrderRadioSubmit.bind(this)
    this.neighborhoodDropdownSubmit = this.neighborhoodDropdownSubmit.bind(this)
  }

  getData(){

    let openDataSourceLink = `https://data.cityofnewyork.us/resource/8bkb-pvci.json?$where=month like '%25${this.state.year}%25'`

    axios.get(openDataSourceLink)
      .then( (response) =>  {

        this.setState({data: response.data})
        console.log("response.data is:", response.data)

        this.addBoroughCDKeyData()
        this.addBoroughCDKeyPopData()
        this.fixWeightToString()
        this.fixMonthValue()
        this.addNeighborhoodNamesPopulation()
        this.add12Months()
        this.addAllRefuseCollectedKey()
        this.dataSort()
        this.drawChart();

      }).catch(function (error) {
        console.log("getData() error: ", error);
      });
  }

   componentDidMount(){
    this.getData()
   }

   addBoroughCDKeyData() {
    const newData =

    _lodash.map(this.state.data, (entry) => {
      let o = Object.assign({}, entry);
      o.boroughDistrict = entry.borough + ' ' + entry.communitydistrict
      return o;
    })
    this.setState({data: newData})
   }

   addBoroughCDKeyPopData() {
    const newData =

    _lodash.map(popNeighbData, (entry) => {
      let newKey = Object.assign({}, entry);
      newKey.boroughDistrict = entry.borough + ' ' + entry.communitydistrict
      return newKey;
    })
    this.popNeighbData = newData
   }

   addAllRefuseCollectedKey() {
    const newData =

    _lodash.map(this.state.data, (entry) => {
      let newKey = Object.assign({}, entry);
      newKey.allcollected = (entry.refusetonscollected + entry.papertonscollected + entry.mgptonscollected + entry.resorganicstons + entry.xmastreetons + entry.leavesorganictons)
      return newKey;
    })
    this.setState({data: newData})
   }

  addNeighborhoodNamesPopulation() {
    this.state.data.forEach( (entry) => {
      if (entry.communitydistrict === "7A") {
        console.log("Encountered Queens CD 7A - returning.", entry.communitydistrict)
        return
      }

      let tempResult = this.popNeighbData.filter( (popEntry) => {
        _lodash.includes(tempResult, popEntry)

        let result = (entry.boroughDistrict === popEntry.boroughDistrict);
        return result
      })

        entry.cd_name = tempResult[0].cd_name
        entry._2020_population = tempResult[0]._2020_population
        entry._2010_population = tempResult[0]._2010_population
        entry._2000_population = tempResult[0]._2000_population
        entry._1990_population = tempResult[0]._1990_population
        entry._1980_population = tempResult[0]._1980_population
        entry._1970_population = tempResult[0]._1970_population
    });
  }

  dataSort() {
    if (this.state.dataSort === 'sort ascending') {
      this.state.data.sort( (a,b) => d3.ascending(a[this.state.refuseType]/a._2010_population,b[this.state.refuseType]/b._2010_population))
      // console.log("Sort ascending", this.state.data)
    }
      else if (this.state.dataSort === 'sort descending') {
        this.state.data.sort( (a,b) => d3.descending(a[this.state.refuseType]/a._2010_population,b[this.state.refuseType]/b._2010_population))
        // console.log("Sort descending", this.state.data)
    }
      else {
        this.state.data.sort( (a,b) => d3.descending(b.boroughDistrict,a.boroughDistrict))
        // console.log("Sort alphabetical", this.state.data)
    }
  };

   fixWeightToString() {
     const newData =

       _lodash.map(this.state.data, (entry) => {

        entry.refusetonscollected =   _lodash.parseInt(entry.refusetonscollected)
        entry.papertonscollected =   _lodash.parseInt(entry.papertonscollected)
        entry.mgptonscollected =   _lodash.parseInt(entry.mgptonscollected)
        entry.resorganicstons =   _lodash.parseInt(entry.resorganicstons)
        entry.leavesorganictons =   _lodash.parseInt(entry.leavesorganictons)
        entry.schoolorganictons =   _lodash.parseInt(entry.schoolorganictons)
        entry.xmastreetons =   _lodash.parseInt(entry.xmastreetons)
        entry.allcollected =   _lodash.parseInt(entry.allcollected)

        if (Number.isNaN(entry.refusetonscollected) === true ) { entry.refusetonscollected = 0}
        if (Number.isNaN(entry.papertonscollected) === true ) { entry.papertonscollected = 0}
        if (Number.isNaN(entry.mgptonscollected) === true ) { entry.mgptonscollected = 0}
        if (Number.isNaN(entry.resorganicstons) === true ) { entry.resorganicstons = 0}
        if (Number.isNaN(entry.leavesorganictons) === true ) { entry.leavesorganictons = 0}
        if (Number.isNaN(entry.schoolorganictons) === true ) { entry.schoolorganictons = 0}
        if (Number.isNaN(entry.xmastreetons) === true ) { entry.xmastreetons = 0}
        if (Number.isNaN(entry.allcollected) === true ) { entry.allcollected = 0}
        return entry
       })

    this.setState({data: newData})
  }

   fixMonthValue() {
     const newData =
       _lodash.map(this.state.data, (entry) => {
        entry.month =  entry.month.replace(/\s+/g, '')
        return entry
       })

    this.setState({data: newData})
  }

  add12Months() {
    let borough;
    let cd_name;
    let allBoroughDistrict = _lodash.uniqBy(this.state.data, (item)=>{
      return item.boroughDistrict
    })

     allBoroughDistrict = _lodash.map(allBoroughDistrict, (item)=>{
      return item.boroughDistrict
    })

    const newData = _lodash.map(allBoroughDistrict, (boroughDistrict)=>{

        const allBoroughDistrict = _lodash.filter(this.state.data, (item)=>{
          return item.boroughDistrict === boroughDistrict
        })


          borough = _lodash.filter(this.state.data, (item)=>{
            return item.borough === borough
          })

          cd_name = _lodash.filter(this.state.data, (item)=>{
            return item.cd_name === cd_name
          })

          let refusetonscollected = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.refusetonscollected
          })

          let papertonscollected = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.papertonscollected
          })

          let mgptonscollected = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.mgptonscollected
          })

          let resorganicstons = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.resorganicstons
          })

          let leavesorganictons = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.leavesorganictons
          })

          let schoolorganictons = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.schoolorganictons
          })

          let xmastreetons = _lodash.sumBy(allBoroughDistrict, (item)=>{
            return item.xmastreetons
          })


      return {
        boroughDistrict: boroughDistrict,
        borough: allBoroughDistrict[0].borough,
        cd_name: allBoroughDistrict[0].cd_name,
        _2010_population: allBoroughDistrict[0]._2010_population,
        refusetonscollected: refusetonscollected,
        papertonscollected: papertonscollected,
        mgptonscollected: mgptonscollected,
        resorganicstons: resorganicstons,
        leavesorganictons: leavesorganictons,
        schoolorganictons: schoolorganictons,
        xmastreetons: xmastreetons,
        }
    })
    console.log("data after adding the 12 months of data:", newData)
    this.setState({data: newData})
  }

   refuseTypeSubmit(event) {
     d3.selectAll("svg > *").remove()
     this.setState({data: []})
     this.setState({refuseType: event.target.id}, () => {
       this.getData()
     })
   }

   yearDropdownSubmit(event) {
    d3.selectAll("svg > *").remove()
    this.setState({year: event.target.value}, () => {
      this.getData()
    })
    event.preventDefault();
  }

   sortOrderRadioSubmit(event) {
    // 1) remove the current chart
    d3.selectAll("svg > *").remove()

    this.setState({dataSort: event.target.value}, () => {
      this.dataSort()
      this.getData()
    })
  }

   neighborhoodDropdownSubmit(event) {
    d3.selectAll("svg > *").remove()
    this.setState({neighborhood: event.target.value}, () => {
      this.getData()
    })
    console.log("neighborhood button clicked", event.target.value)
    event.preventDefault();
  }

   drawChart() {
    const svg = d3.select("svg")

    const margin = {top: 60, right: 140, bottom: 190, left: 150};
    const width = svg.attr('width')
    const height = svg.attr('height')

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let colorBars = d3.scaleOrdinal()
                      .domain(["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"])
                      .range(["#21E0D6", "#EF767A", "#820933", "#6457A6", "#2C579E"]);

    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tool-tip");

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.state.data, d => d[this.state.refuseType]/d._2010_population * 2000 )])
      .range([0, innerWidth])

    const yScale = d3.scaleBand()
      .domain(this.state.data.map(d => d.boroughDistrict))
      .range([0, innerHeight])
      .padding(0.1)

    const g = svg.append('g')
                 .attr('transform', `translate(${margin.left}, ${margin.top})`)

    g.append('g')
     .call(d3.axisLeft(yScale))

    g.append('g')
     .call(d3.axisTop(xScale))

    g.append('g')
     .call(d3.axisBottom(xScale))
     .attr('transform', `translate(0, ${innerHeight})`)

    g.selectAll('rect')
    .data(this.state.data)
    .enter()
    .append('rect')
    .style("fill", (d) => {return colorBars(d[this.state.valueForColors])})
    .attr('y', d => yScale(d.boroughDistrict))
    .attr('width', d => xScale(d[this.state.refuseType]/d._2010_population * 2000))
    .attr('height', yScale.bandwidth())
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("fill", "#ffcd44")
      })
      .on("mouseout", function(d) {
           d3.select(this)
           .transition()
           .duration(200)
           .style("fill", (d) => {return colorBars(d.borough)})
      })
      .on("mousemove", (d) => {
        tooltip.style("left", d3.event.pageX + 15 + "px")
               .style("top", d3.event.pageY - 120 + "px")
               .style("display", "inline-block")

               .html(`<h4>  ${d.cd_name}  </h4>
                  2010 population:  ${new Intl.NumberFormat().format(d._2010_population)} </br></br>
                  neighboood total: ${new Intl.NumberFormat().format(d[this.state.refuseType])} tons/year</br>
                  per person: ${Math.round(d[this.state.refuseType]/d._2010_population * 2000)} pounds/year</br></br>

                  <p>Breakdown of refuse by percent:</p>

                  <ul>

                  <li>trash: ${(d.refusetonscollected * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li></br>

                  <li>paper & cardboard: ${(d.papertonscollected * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li></br>

                  <li>metal/glass/plastic: ${(d.mgptonscollected * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li></br>

                  <li>brown bin organics: ${(d.resorganicstons * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li></br>

                  <li>leaves: ${(d.leavesorganictons * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li></br>

                  <li>christmas trees:  ${(d.xmastreetons * 100/(d.mgptonscollected + d.resorganicstons +
                  d.papertonscollected + d.refusetonscollected + d.xmastreetons + d.leavesorganictons)).toFixed(1)} % </li>

                  </ul>`
               )

      })
      g.on("mouseout", (d) => { tooltip.style("display", "none");})
      g.selectAll(".text")
      .data(this.state.data)
      .enter()
      .append("text")
      .style("opacity", 0)
        .attr("class","label")
        .text( (d) => {return new Intl.NumberFormat().format((d[this.state.refuseType]/d._2010_population) * 2000 )+ " lbs/person";})

        .attr('y', d => yScale(d.boroughDistrict) + 20)
        .attr('x', d => xScale(d[this.state.refuseType]/d._2010_population * 2000) + 5 )
      .style("opacity", 1)

      g.selectAll('rect')
       .data(this.state.data)
       .exit()
       .transition().duration(500)
       .remove()
   }

  render() {
    return (

      <div className="App row">

        <div className="sidebar-container col-xs-12 col-sm-4 col-md-3 col-lg-3 col-xl-3">
          <Sidebar refuseTypeSubmit={this.refuseTypeSubmit}
                   boroughSubmit={this.boroughSubmit}
                   yearDropdownSubmit={this.yearDropdownSubmit}
                   sortOrderRadioSubmit={this.sortOrderRadioSubmit}
                   totalOrPPRadioSubmit={this.totalOrPPRadioSubmit}
                   neighborhoodDropdownSubmit={this.neighborhoodDropdownSubmit}
                   />
        </div>

        <div className="chart-container col-xs-12 col-sm-8 col-md-9 col-lg-9 col-xl-9">
          <ChartHeader year={this.state.year} refuseType={this.state.refuseType} />
          <BarChart />
          <Footer />
        </div>

      </div>
    );
  }
}
