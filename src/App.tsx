import { FC, HTMLAttributes, SVGAttributes, useEffect, useRef, useState } from 'react';
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

  console.log('pos', projection([-155.54211, 19.08348]))
  console.log('shape', pathGenerator(countryShapes.features[0] as any))

  const pos = projection([-155.54211, 19.08348]) || [];
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
            <circle cx="3" cy="3" r="2" fill="black" />
          </pattern>
          <pattern id="Map__mouse-over" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#9980FA" />
          </pattern>
        </defs>
        <circle cx={pos[0]} cy={pos[1]} r="2"/>
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
      </svg>
    </div>
  )
}

function App() {
  useEffect(() => {

  }, [])

  return (
    <Map projectionName="geoMiller" />
  );
}

export default App;
