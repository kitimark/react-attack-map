import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { GeoPermissibleObjects } from 'd3-geo';
//@ts-ignore
import * as d3GeoProjection from 'd3-geo-projection';
import countryShapes from './geo.json';
import { useChartDimensions } from './useChartDimension';

const Map = ({ projectionName = "geoArmadillo" }) => {
  // grab our custom React hook we defined above
  const [ref, dms] = useChartDimensions({})

  // this is the definition for the whole Earth
  const sphere: GeoPermissibleObjects = { type: "Sphere" }

  console.log(d3GeoProjection);
  const projectionFunction: any = d3Geo[projectionName as keyof typeof d3Geo]
    || d3GeoProjection[projectionName];
  const projection = projectionFunction()
    .fitWidth(dms.width, sphere)
  const pathGenerator = d3.geoPath(projection)

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
{/* some projections bleed outside the edges of the Earth's sphere */}
{/* let's create a clip path to keep things in bounds */}
          <clipPath id="Map__sphere">
            <path d={pathGenerator(sphere) || undefined} />
          </clipPath>
        </defs>

        <path
          d={pathGenerator(sphere) || undefined}
          fill="#f2f2f7"
        />

        <g style={{ clipPath: "url(#Map__sphere)" }}>
          {/* we can even have graticules! */}
          <path
            d={pathGenerator(d3.geoGraticule10()) || undefined}
            fill="none"
            stroke="#fff"
          />

          {countryShapes.features
            .filter((shape) => shape.properties.iso_a3 !== 'ATA')
            .map((shape) => {
            return (
              <path
                key={shape.properties.subunit}
                d={pathGenerator(shape as any) || undefined}
                fill="#9980FA"
                stroke="#fff"
              >
                <title>
                  {shape.properties.name}
                </title>
              </path>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function App() {
  return (
    <Map projectionName="geoMiller" />
    // <svg>
    //   <circle cx="100" cy="100" r="50"></circle>
    // </svg>
  );
}

export default App;
