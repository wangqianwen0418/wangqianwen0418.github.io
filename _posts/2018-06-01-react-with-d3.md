---
layout: post
title: "D3.js with React"
tags:
- developer experience 
thumbnail_path: blog/react-with-d3/react-d3.png
---

[D3.js](https://d3js.org/) is one of the best available options for data visualization. 
Since its creation in 2011, it has become the de facto for bulding data visualziations on the web.
[React](https://reactjs.org/), in my opionion, is obviously the best library. 
It's simple, declarative, and composable. 

Bringing together D3.js and React isn’t new but is still not well-established enougth to point to one sure way to do it.
In this post, I'd like to write down my own experience of using React with D3. 

So, the first question is:  
## Why it is not easy to use D3 with React
The biggest obstacle is the different rendering mechanisms between React and D3, which makes it not easy to integrate React and D3 seamlessly.   

React uses **states** for data management and render virtual DOMs.
A diff algorithm is used to control the rendering of differnt components.

<!-- Here is an example to use React to render a series of bars.  
```
const data =  [3,4,5]
``` -->

D3 use **enter**, **update**, **exit** selection to bind data with DOMs and control the rendering of different DOMs.


## Three ways to use D3 with React
I will use a simplied force-directed example to demonstrate the three ways. 

<!-- {% include figure.html path="blog/react-with-d3/example.png" alt="example" %} -->

### way 1:
React for structure    
D3 for data calculation    
D3 for rendering   

React creates a component called as Graph, which consist of an update button and a svg. 
D3 binds data and draw DOMs in the componentDidMount() function of this react component.
We explicitly forbide the update of React in  shouldComponentUpdate() and use D3 to update the DOMs.

``` 
force = d3.layout.force()
  .charge(-300)
  .linkDistance(50)
  .size([width, height]);


class Graph extends React.Component{

  componentDidMount(){
    // use D3 to bind data and render DOMs here
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    force.on('tick', () => {
    // uses d3 to manipulate the attributes,
    // and React doesn't have to go through lifecycle on each tick
    this.d3Graph.call(updateGraph);
    });

  }
  shouldComponentUpdate(nextProps) {
    // here, we use D3 to update and forbid the update of React
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    let d3Nodes = this.d3Graph.selectAll('.node')
      .data(nextProps.nodes, (node) => node.key);
    d3Nodes.enter().append('g').call(enterNode);
    d3Nodes.exit().remove();
    d3Nodes.call(updateNode);

    let d3Links = this.d3Graph.selectAll('.link')
      .data(nextProps.links, (link) => link.key);
    d3Links.enter().insert('line', '.node').call(enterLink);
    d3Links.exit().remove();
    d3Links.call(updateLink);

    force.nodes(nextProps.nodes).links(nextProps.links);
    force.start();

    return false;
  }

  render() {
    return (
      <div>
        <button className="update">update</button>
         <svg width={width} height={height}>
            <g className ='graph' />
        </svg>
      </div>
    );
  },
};
```

  
- Pro:
Use all the d3 functions => the viz scales well
- Con:
not take full advantages of React

### way 2:
React for structure  
D3 for data calculation  
D3 AND React for rendering  
React for enter/exit  
D3 for update  

React is used to wrap all visual element.
In each element, D3 does the binding and rendering.
```
var Node = React.createClass({
  componentDidMount() {
    this.d3Node = d3.select(ReactDOM.findDOMNode(this))
      .datum(this.props.data)
      .call(enterNode);
  },

  componentDidUpdate() {
    this.d3Node.datum(this.props.data)
      .call(updateNode);
  },

  render() {
    return (
      <g className='node'>
        <circle/>
        <text>{this.props.data.key}</text>
      </g>
    );
  },
});
```

Then, create a Graph react component
```
var Graph = React.createClass({
  componentDidMount() {
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this));
    force.on('tick', () => {
      // after force calculation starts, call updateGraph
      // which uses d3 to manipulate the attributes,
      // and React doesn't have to go through lifecycle on each tick
      this.d3Graph.call(updateGraph);
    });
  },

  componentDidUpdate() {
    force.nodes(this.props.nodes).links(this.props.links);
    
    // start force calculations after
    // React has taken care of enter/exit of elements
    force.start();
  },

  render() {
    // use React to draw all the nodes, d3 calculates the x and y
    var nodes = _.map(this.props.nodes, (node) => {
      return (<Node data={node} key={node.key} />);
    });
    var links = _.map(this.props.links, (link) => {
      return (<Link key={link.key} data={link} />);
    });

    return (
      <svg width={width} height={height}>
        <g>
          {links}
          {nodes}
        </g>
      </svg>
    );
  }
});
```

- Pro: Takes advantage of respective strengths  
- Con: Wraps React component around all vis components -> will not scale    
unclear structure  

### way 3:
React for structure     
D3 for data calculation    
React for rendering   


```
class Graph extends React.component{
  componentDidMount() {
    // D3 to calculate position
    // forceUpdate on the React component on each tick
    force.on('tick', () => {
    this.forceUpdate()
    });
  },

  componentWillReceiveProps(nextProps) {
    force.nodes(nextProps.nodes).links(nextProps.links);
    force.start();
  },

  render() {
    // use React to draw all the nodes, d3 calculates the x and y
    var nodes = _.map(this.props.nodes, (node) => {
      var transform = 'translate(' + node.x + ',' + node.y + ')';
      return (
        <g className='node' key={node.key} transform={transform}>
          <circle r={node.size} />
          <text x={node.size + 5} dy='.35em'>{node.key}</text>
        </g>
      );
    });
    var links = _.map(this.props.links, (link) => {
      return (
        <line className='link' key={link.key} strokeWidth={link.size}
          x1={link.source.x} x2={link.target.x} y1={link.source.y} y2={link.target.y} />
      );
    });

    return (
      <svg width={width} height={height}>
        <g>
          {links}
          {nodes}
        </g>
      </svg>
    );
  }
};
```

- Pro: 
Clean, easy to reason about  
- Con: 
Goes through lifecycle for every tick -> will not scale  
Cannot use D3 functions that need access to DOM  

#### My preferred method:
Personally, I prefer way 3 because a) it has a clear structure and b) it takes the full advantages of React.  

### Do we really need to use D3?
Apart from D3, there are other fantastic data visualization libraries.
Among these libraries, I personally like [Echarts](https://ecomfe.github.io/echarts-doc/public/en/index.html) and [Vega](https://vega.github.io/vega/examples/) since they have more clear and modern structure designs.
Moerover, since ECharts and Vega are JSON-specified, they are more easy to be used with React.

**Reference**  
[Building interactive visualizations with React, D3, and TypeScript](https://blog.lucify.com/building-interactive-visualizations-with-react-d3-and-typescript-206c7172b0d2)  
[React + D3.js: Balancing Performance & Developer Experience](https://medium.com/@tibotiber/react-d3-js-balancing-performance-developer-experience-4da35f912484)