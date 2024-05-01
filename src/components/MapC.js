//MapC.js
import { useEffect, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';
import makeCrsFilter4node from "./utils/filter-for-node.js";
import {makeCrsFilter} from "./utils/crs-filter.js";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Stroke, Style} from "ol/style";
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import {basicMarkerStyle, clickedMarkerStyle} from './MarkerStyle'

import Select from 'ol/interaction/Select';
import { click, pointerMove } from 'ol/events/condition';

import HandleCategoryClick from './HandleCategoryClick';
import ShowObsOnPath from './ShowObsOnPath';

import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/IrumakerY.png';

const VWorldBaseUrl = 'https://api.vworld.kr/req/wmts/1.0.0/ABA020A7-DBB7-3954-900F-E891C0E4995E';

const osmLayer = new TileLayer({
    source: new OSM({ attributions: '', cacheSize: 0 }),
    properties: { name: 'base-osm' },
    //zIndex: 1,
    //preload: Infinity,
});

const vworldBaseLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Base/{z}/{y}/{x}.png` }),
    properties: { name: 'base-vworld-base' },
    minZoom: 16,
    maxZoom: 22,
    //zIndex: 2,
    //preload: Infinity,
});

const vworldSatelliteLayer = new TileLayer({
    source: new XYZ({ url: `${VWorldBaseUrl}/Satellite/{z}/{y}/{x}.jpeg` }),
    properties: { name: 'base-vworld-satellite' },
    minZoom: 15,
    maxZoom: 22,
    //preload: Infinity,
});

const UOSbasemapTile = new TileLayer({
    title: 'UOS Base Map',
    visible: true,
    source: new TileWMS({
        url: 'http://localhost:8080/geoserver/gp/wms',
        params: { 'LAYERS': 'gp:basemap' },
        serverType: 'geoserver',
    }),
});

const UOSorthoTile = new TileLayer({
        title: 'UOS Road',
        visible: true,
        source: new TileWMS({
            url: 'http://localhost:8080/geoserver/gp/wms',
            params: { 'LAYERS': 'gp:uos_orthomosaic' },
            serverType: 'geoserver',
        }),
        zIndex: 1
    });


const makelocaArrayFromNodes = (pathData, locaArray) => {
    pathData.forEach((path, index) => {
        const listOfNodeId = path.map(n => n.node) // 주의: 출발지의 start_vid, 도착지의 end_vid는 빼고 node가 다 2개씩 있음
        locaArray.push(listOfNodeId[0]);
        if (index === pathData.length - 1) {
            locaArray.push(listOfNodeId[listOfNodeId.length - 1]);
        }
    });
    return locaArray;
}

const setMarkerSrcOf = (locaArray,index) => {
    if (index === 0) { // 출발지
        return irumarkerS;
    } else if (index === locaArray.length - 1) { //도착지
        return irumarkerE;
    } else {
        return irumarker2; // 경유지
    }
}

const poiMarkerClickEventWith = (keyword, selectClick) => {
    // feature를 선택할 때 이벤트
    selectClick.on('select', function(e) {
        var selectedFeatures = e.selected;

        selectedFeatures.forEach(function(feature) {
            if (feature.get('bg_name') === keyword) {
                feature.setStyle(clickedMarkerStyle(irumarker2))
                console.log(keyword + ' click')
            }
        });
    });
}

const createPoiMarkerLayer = (cqlFilter) => {
    const poiSource = new VectorSource({ // feature들이 담겨있는 vector source
        format: new GeoJSON({
            dataProjection: 'EPSG:5181'
        }),
        url: function(extent) {
            return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                '&request=GetFeature&typeName=gp%3Apoi_point&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='+cqlFilter;
        },
        serverType: 'geoserver'
    });

    // poiLayer -> poiMarkerLayer (이름 변경)
    const poiMarkerLayer = new VectorLayer({
        title: 'POI',
        visible: true,
        source: poiSource,
        style: basicMarkerStyle(irumarker2),
        zIndex: 4
    });

    return poiMarkerLayer;
}

const markerClickEventWith = (locaArray, selectClick) => {
    // feature를 선택할 때 이벤트
    selectClick.on('select', function(e) {
        var selectedFeatures = e.selected;

        selectedFeatures.forEach(function(feature) {

            if (feature.get('node_id')==locaArray[0]) {
                feature.setStyle(clickedMarkerStyle(irumarkerS))
                console.log('출발지 click: '+feature.getId());
                //setMarkerClicked(false);
            } else if (feature.get('node_id')==locaArray[locaArray.length-1]){
                feature.setStyle(clickedMarkerStyle(irumarkerE))
                console.log('도착지 click: '+feature.getId());
            } else {
                feature.setStyle(clickedMarkerStyle(irumarker2))
                console.log('경유지 click: '+feature.getId());
            }
        });
    });
}

export const useMap = () => { // 배경지도만 따로 분리
    const [map, setMap] = useState(null);
    //추가부분
    proj4.defs('EPSG:5181', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs');
    register(proj4);

    useEffect(() => {
        const view = new View({
            //projection: getProjection('EPSG:5181'),
            center: fromLonLat([127.0596, 37.5837]),
            zoom: 17,
            minZoom: 16,
            maxZoom: 22,
        });

        const newMap = new Map({
            layers: [osmLayer],
            target: 'map',
            view: view,
        });

        setMap(newMap);

        return () => {
            newMap.setTarget(null);
        };
    }, []);
    return map;
}


export const MapC = ({ pathData, width, height, keyword, setKeyword, bol, bump, showObs, category}) => {
    const map = useMap();
    const [layerState, setLayerState] = useState('base-base');
    var locaArray = []; // 출발, 경유지, 도착지의 link_id를 담는 배열

    const createShortestPathLayer = (pathData) => {
        console.log("pathData:", pathData);
        const colorPalette = ['#FD5230', '#007AC5','#44EAC5', 'yellow', 'orange', 'purple', 'cyan', 'magenta'];

        pathData.forEach((path, index) => {
            const listOfEdgeId = path.map(e => e.edge);
            const crsFilter = makeCrsFilter(listOfEdgeId);

            const colorIndex = (index === pathData.length - 1) ? 0 : index +1;

            const shortestPathLayer = new VectorLayer({
                title: `UOS Shortest Path ${index + 1}`,
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                        '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='+crsFilter
                }),
                style: new Style({
                    stroke: new Stroke({
                        color: colorPalette[colorIndex],
                        width: 2
                    })
                }),
                zIndex: 2
            });

            map.addLayer(shortestPathLayer);
        });
    }

    const createNAddNodeLayersFrom = (locaArray) => {
        let nodeLayers = [];
        locaArray.forEach((nodeId, index) => {
            // shortestPathLayer->nodeLayer
            const nodeLayer = new VectorLayer({
                title: `Marker ${index + 1}`,
                visible: true,
                source: new VectorSource({ // feature들이 담겨있는 vector source
                    format: new GeoJSON({
                        dataProjection: 'EPSG:5181'
                    }),
                    url: function(extent) { // WMS방식에서 WFS로 변경
                        return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                            '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id='+nodeId;
                    },
                    serverType: 'geoserver'
                }),
                style: basicMarkerStyle(setMarkerSrcOf(locaArray,index)),
                zIndex: 5
            });
            nodeLayers.push(nodeLayer);
            map.addLayer(nodeLayer);
        });
        return nodeLayers;
    }

    useEffect(() => {
        if (map) {
            console.log('-------rendering------')
            const layerExists = map.getLayers();
            // 배경지도 옵션 설정
            if (layerExists) {
                switch (layerState) {
                    case 'base-base':
                        map.getLayers().clear();
                        map.addLayer(vworldBaseLayer);
                        map.addLayer(UOSbasemapTile);
                        break;
                    case 'base-satellite':
                        map.getLayers().clear();
                        map.addLayer(vworldSatelliteLayer);
                        map.addLayer(UOSorthoTile);
                        break;
                    default:
                        map.getLayers().clear();
                        map.addLayer(osmLayer);
                        break;
                }
            }
            map.on('pointermove', (e) => map.getViewport().style.cursor = map.hasFeatureAtPixel(e.pixel) ? 'pointer' : '');

            // 출발지 도착지 다 분홍색 노드로 보여줬던 부분. 링크 추출
            if (pathData && pathData.length >= 1) { // 경로를 이루는 간선이 하나라도 존재를 하면
                createShortestPathLayer(pathData);
                locaArray = makelocaArrayFromNodes(pathData,locaArray); // pathData 가공해서 locaArray 도출
            }
            // 출발, 도착, 경유 노드 마커 표시
            if (locaArray && locaArray.length >= 2) {
                let selectSingleClick = new Select({ //feature 클릭 가능한 select 객체
                   condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
                   layers: createNAddNodeLayersFrom(locaArray)
                });
                map.addInteraction(selectSingleClick);
                markerClickEventWith(locaArray, selectSingleClick); // 노드 마커 클릭 이벤트
            }
        }
    }, [map, layerState, pathData, showObs]);

    useEffect(() => { // 건물 | 하늘못 | 운동시설 검색 시
            if (map && keyword) {
            // Replace 'desiredName' with the name you want to filter by
            let cqlFilter = encodeURIComponent("name like '%"+keyword+"%'" + "or nickname like '"+keyword+"' or eng_name ILIKE '%"+keyword+"%'");

            const poiMarkerLayer = createPoiMarkerLayer(cqlFilter)
            map.addLayer(poiMarkerLayer)

            let selectBuildClick = new Select({
               condition: click, // click 이벤트. condition: Select 객체 사용시 click, move 등의 이벤트 설정
               layers: [poiMarkerLayer]
            });
            map.addInteraction(selectBuildClick);
           // poiMarkerClickEventWith(keyword,selectBuildClick); // 건물 마커 클릭 이벤트
        }
    }, [keyword])

    return (
        <div>
            <div className="select-layer-wrap" style={{ position: 'relative' }}>
                <select style={{ position: 'absolute', top: '4px', right: '4px', 'zIndex': '100', fontSize: '15px' }} value={layerState} onChange={(e) => setLayerState(e.target.value)}>
                    <option value='base-osm'>OSM</option>
                    <option value='base-base'>기본지도</option>
                    <option value='base-satellite'>항공영상</option>
                </select>
            </div>
            <div id="map" style={{ width, height }}></div>
            {category && category.type && <HandleCategoryClick category = {category} map = {map}/>}
            {showObs && <ShowObsOnPath map={map} pathData={pathData} locaArray={locaArray} bump={bump} bol={bol} showObs={showObs}/>}
        </div>
    );
};