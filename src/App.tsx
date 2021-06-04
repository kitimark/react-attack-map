import { FC, SVGAttributes, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { GeoPermissibleObjects } from 'd3-geo';
//@ts-ignore
import * as d3GeoProjection from 'd3-geo-projection';
import countryShapes from './geo.json';
import { useChartDimensions } from './useChartDimension';

type Features = typeof countryShapes['features']

type Unpacked<T> = T extends (infer U)[] ? U : T;

type Feature = Unpacked<Features>;

type CountryProps = SVGAttributes<SVGPathElement> & {
  shape: Feature;
}

const Country: FC<CountryProps> = ({ shape, ...props }) => {
  const ref = useRef<SVGPathElement>(null);

  return (
    <path
      {...props}
      ref={ref}
      onMouseOver={e => {
        e.currentTarget.style.fill = 'url(#Map__mouse-over)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.fill = 'url(#Map__default)';
      }}
    >
      <title>
        {shape.properties.name}
      </title>
    </path>
  )
}

function getDrawPath(e: number, t: number, a: number, r: number) {
  const samePlace = e === a && t === r;
  var o = 3 * Math.random();
  if (samePlace) {
    var i = 25 + 10 * o;
    return `M  ${e} ${t} c ${i} ${-i} ${-i} ${-i} 0 0`;
  }
  var E = (e + a) / 2,
    c = (t + r) / 2,
    A = 2 * Math.random();
  return (
    `M ${e} ${t} S ${E + 30 * o} ${Math.abs(c - 20 ** A)} ${a} ${r}`
  );
}

interface BoomProps {
  pos: [number, number];
}

const Boom: FC<BoomProps> = ({ pos }) => {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = d3.select(ref.current)

    path.attr('opacity', 0)
      .transition()
        .duration(2000)
      .transition()
        .duration(500)
        .ease(d3.easeExpOut)
        .attr('opacity', .75)
      .transition()
        .duration(1000)
      .transition()
        .duration(2000)
        .ease(d3.easeExpOut)
        .attr('opacity', 0)
  }, [ref.current]);
  
  return (
    <g ref={ref}>
      <circle 
        cx={pos[0]} 
        cy={pos[1]} 
        r="20" 
        stroke="red" 
        fill="red" 
        opacity=".45" 
      />
      <circle
        cx={pos[0]} 
        cy={pos[1]} 
        r="8" 
        stroke="red" 
        fill="red" 
      />
      <circle
        cx={pos[0]} 
        cy={pos[1]} 
        r="14" 
        stroke="red" 
        strokeWidth="2px"
        fill="transparent" 
      />
    </g>
  )
}

interface AttackProps {
  pos1: [number, number];
  pos2: [number, number];
}

const Attack: FC<AttackProps> = ({ pos1, pos2 }) => {
  const ref = useRef<SVGPathElement>(null)
  useEffect(() => {
    const length = ref.current?.getTotalLength() || 0;
    const path = d3.select(ref.current);

    path
      .attr('stroke-dasharray', length)
      .attr('stroke-dashoffset', length)
      .attr('stroke', 'red')
      .transition()
        .duration(500)
      .transition()
        .duration(1500)
        .ease(d3.easeExpInOut)
        // .attr('stroke', 'blue')
        .attr('stroke-dashoffset', 0)
      .transition()
        .duration(1500)
        .ease(d3.easeExpInOut)
        // .attr('stroke', 'red')
        .attr('stroke-dashoffset', -length)
      // .transition()
      //   .duration(500)
      //   .remove()
  }, [ref.current, pos1, pos2])

  return (
    <g>
      <Boom pos={pos2} />
      <path
        ref={ref}
        fill="none"
        stroke="transparent"
        strokeWidth="2px"
        style={{
          zIndex: 100,
        }}
        d={getDrawPath(pos1[0], pos1[1], pos2[0], pos2[1])}
      />
    </g>
  )
}

const Map = ({ projectionName = "geoArmadillo" }) => {
  // grab our custom React hook we defined above
  const [ref, dms] = useChartDimensions({})

  // this is the definition for the whole Earth
  const sphere: GeoPermissibleObjects = { type: "Sphere" }

  const projectionFunction: any = d3Geo[projectionName as keyof typeof d3Geo]
    || d3GeoProjection[projectionName];
  const projection: d3Geo.GeoProjection = projectionFunction()
    .fitWidth(dms.width, sphere)
  const pathGenerator = d3.geoPath(projection)

  const pos1 = projection([-123.51000158755114,48.51001089130344]) as [number, number];
  const pos2 = projection([102.5849324890267,12.186594956913282]) as [number, number];
  // size the svg to fit the height of the map
  const [
    [x0, y0],
    [x1, y1]
  ] = pathGenerator.bounds(sphere)
  const height = y1

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
      }}
    >
      <svg width={dms.width} height={height}>
        <defs>
          <pattern id="Map__default" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#808080" />
          </pattern>
          <pattern id="Map__mouse-over" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#9980FA" />
          </pattern>
        </defs>
        <circle cx={pos1[0]} cy={pos1[1]} r="2"/>
        <g style={{ clipPath: "url(#Map__default)" }}>
          {countryShapes.features
            .map((shape) => {
            return (
              <Country 
                key={shape.properties.subunit}
                d={pathGenerator(shape as any) || undefined}
                // fill="#9980FA"
                fill="url(#Map__default)"
                stroke="#fff"
                shape={shape}
              />
            )
          })}
        </g>
        {new Array(1).fill(null).map((_, index) => 
          <Attack key={index} pos1={pos1} pos2={pos2} />
        )}
      </svg>
    </div>
  )
}

function App() {
  return (
    <Map projectionName="geoMiller" />
  );
}

export default App;
