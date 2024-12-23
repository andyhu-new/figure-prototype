import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Point {
  x: number;
  y: number;
}

const HeroBanner: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    svg
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue');

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));
  }, [points]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPoints((currentPoints) =>
        [
          ...currentPoints,
          {
            x: Math.random(),
            y: Math.random(),
          },
        ].slice(-50)
      );
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <svg ref={svgRef} width="600" height="400">
        <g className="plot-area" />
      </svg>
    </div>
  );
};

export default HeroBanner;
