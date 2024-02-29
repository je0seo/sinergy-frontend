import { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { get as getProjection, fromLonLat } from 'ol/proj';
import { VectorImage } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import { Fill, Stroke, Style } from 'ol/style';

import makeCrsFilter4node from "./utils/filter-for-node.js";
import makeCrsFilter from "./utils/crs-filter.js";
import { MapStyles, MapStyles as styles } from "./MapStyle.js";
import { BuildingJson } from "./jsonDatas/Building.js";

const VWorldBaseUrl = 'https://api.vworld.kr/req/wmts/1.0.0/288AB3D7-7900-3465-BC2F-66917AB18D55';

const osmLayer = new TileLayer({
    source: new OSM({ attributions: '', cacheSize: 0 }),
    properties: { name: 'base-osm' },
    //preload: Infinity,
});

const vworldBaseLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Base/{z}/{y}/{x}.png` }),
    properties: { name: 'base-vworld-base' },
    minZoom: 16,
    maxZoom: 22,
    //preload: Infinity,
});

const vworldSatelliteLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Satellite/{z}/{y}/{x}.jpeg` }),
    properties: { name: 'base-vworld-satellite' },
    minZoom: 15,
    maxZoom: 22,
    //preload: Infinity,
});

const MapC = ({ pathData, width, height }) => {
    const [map, setMap] = useState(null);
    const [layerState, setLayerState] = useState('base-osm');
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    const UOSorthoTile = new TileLayer({
        title: 'UOS Drone',
        visible: true,
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:uos_orthomosaic' },
            serverType: 'geoserver',
        }),
        zIndex: 2
    });

    const UOSbasemapTile = new TileLayer({
        title: 'UOS Base Map',
        visible: true,
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:basemap' },
            serverType: 'geoserver',
        }),
        zIndex: 2
    });

    const BuildingrSource = new VectorSource({
        features: new GeoJSON().readFeatures(BuildingJson),
        format: new GeoJSON()
    });
    const BuildingLayer = new VectorImage({
        title: 'UOS Building',
        source: BuildingrSource,
        style: new Style({
            stroke: new Stroke({ color: 'yellow', width: 1, }),
            fill: new Fill({ color: 'rgba(255, 255, 0, 0.1)', }),
        }),
        visible: true,
        zIndex: 10
    });
    useEffect(() => {
        const view = new View({
            projection: getProjection('EPSG:5181'),
            center: fromLonLat([127.0596, 37.5837]),
            zoom: 17,
            minZoom: 16,
            maxZoom: 22,
        });

        const Map = new Map({
            layers: [osmLayer],
            target: 'map',
            view: new View({
                projection: getProjection('EPSG:5181'),
                center: fromLonLat([127.0596, 37.5837]),
                zoom: 17,
                minZoom: 16,
                maxZoom: 22,
            }),
        });

        setMap(Map);
        map.on('click', function(e){
          map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
              console.log(feature);
          })
        })

        return () => {
            Map.setTarget(null);
        };
    }, []);

    useEffect(() => {
        if (map) {
            const layerExists = map.getLayers();
            if (layerExists) {
                switch (layerState) {
                    case 'base-base':
                        map.getLayers().clear();
                        map.addLayer(vworldBaseLayer);
                        map.addLayer(UOSbasemapTile);
                        map.addLayer(BuildingLayer);

                        break;
                    case 'base-satellite':
                        map.getLayers().clear();
                        map.addLayer(vworldSatelliteLayer);
                        map.addLayer(UOSorthoTile);
                        break;
                    default:
                        map.getLayers().clear();
                        map.addLayer(osmLayer);
                        map.addLayer(BuildingLayer);
                        break;
                }
            }
            // Add UOS Shortest Path layers
            var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열
            if (pathData && pathData.length >= 1) {
                pathData.forEach((path, index) => {
                    const listOfEdgeId = path.map(e => e.edge);
                    const listOfNodeId = path.map(n => n.node);
                    locaArray.push(listOfNodeId[0]);
                    const crsFilter = makeCrsFilter(listOfEdgeId);
                    if (index === pathData.length - 1) {
                        locaArray.push(listOfNodeId[listOfNodeId.length - 2]);
                    }
                    const shortestPathLayer = new TileLayer({
                        title: `UOS Shortest Path ${index + 1}`,
                        source: new TileWMS({
                            url: 'http://localhost:8080/geoserver/gp/wms',
                            params: { 'LAYERS': 'gp:link', ...crsFilter },
                            serverType: 'geoserver',
                            visible: true,
                        }),
                        zIndex: 2
                    });
                    map.addLayer(shortestPathLayer);
                });
                console.log(locaArray);
            }
            if (locaArray && locaArray.length >= 2) {
                locaArray.forEach((path, index) => {
                    const crsFilter = makeCrsFilter4node(locaArray);
                    const shortestPathLayer = new TileLayer({
                        title: `Marker ${index + 1}`,
                        source: new TileWMS({
                            url: 'http://localhost:8080/geoserver/gp/wms',
                            params: { 'LAYERS': 'gp:node', ...crsFilter },
                            serverType: 'geoserver',
                            visible: true,
                        }),
                        zIndex: 2
                    });
                    map.addLayer(shortestPathLayer);
                });
            }
        }
    }, [map, layerState, pathData]);

    return (
        <div>
            <div className="select-layer-wrap" style={{ position: 'relative' }}>
                <select style={{ position: 'absolute', top: '4px', right: '4px', 'zIndex': '100', fontSize: '15px' }} value={layerState} onChange={(e) => setLayerState(e.target.value)}>
                    <option value='base-osm'>OSM</option>
                    <option value='base-base'>기본지도</option>
                    <option value='base-satellite'>위성지도</option>
                </select>
            </div>
            <div id="map" style={{ width, height }}></div>
        </div>
    );
};

export default MapC;