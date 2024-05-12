//ShowObsOnPath.js
import { useEffect, useState } from 'react';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {GeoJSON} from "ol/format";

import {makeCrsFilter} from "./utils/crs-filter.js";
import { Stroke, Style } from "ol/style";
import {showMarkerStyle} from './MarkerStyle'
import {PopupUIComponent} from './PopupC'

export const getNodeIdsOnPath = (pathData) => {
    let listOfNodeId = [];
    pathData.forEach((path, index) => {
        listOfNodeId = listOfNodeId.concat(path.map(n => n.node))
    });
    listOfNodeId = Array.from(new Set(listOfNodeId)); // 중복된 값 제거
    return listOfNodeId
}

const getEdgeIdsOnPath = (pathData) => {
    let listOfEdgeId = [];
    pathData.forEach((path, index) => {
        listOfEdgeId = listOfEdgeId.concat(path.map(e => e.edge));
    });
    listOfEdgeId = Array.from(new Set(listOfEdgeId));
    listOfEdgeId.pop()
    return listOfEdgeId
}

const url4slopeObs = (edgeIds, slopeD) => {
    const crsFilter = makeCrsFilter(edgeIds);
    return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
           '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='
           + crsFilter
           + ' And (link_att NEQ 5 AND grad_deg >='+slopeD + ')'
}
const url4unpavedObs = (edgeIds) => {
    const crsFilter = makeCrsFilter(edgeIds);
    return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
        '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='
        + crsFilter
        + ' AND link_att = 4'
}
const url4stairObs = (edgeIds) => {
    const crsFilter = makeCrsFilter(edgeIds);
    return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
        '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER='
        + crsFilter
        + ' AND link_att = 5'
}

const createObsLayerWith = (obsType, pathNodeIds) => {
    let obsSource = new VectorSource({
        format: new GeoJSON({
            dataProjection: 'EPSG:5181'
        }),
        url: function (extent) {
            return  'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                              '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
                              +obsType.data.ids +') and node_id in (' +pathNodeIds + ')';
        },
        serverType: 'geoserver'
    })
    //console.log(obsSource.getFeatures())
    const obsLayer = new VectorLayer({
        title: `${obsType.type}OnPath Layer`,
        visible: true,
        source: obsSource,
        zIndex: 6,
        style: showMarkerStyle(obsType.type),
    });
    return obsLayer
}

const createVisibleLinkObsLayer = (obsType, url) => {
    let colorCode = 'black'
    if (obsType === 'slope'){
        colorCode = '#FF8400'
    }
    else if (obsType === 'unpaved'){
        colorCode = '#711B6B'
    }
    else if (obsType === 'stair'){
        colorCode = '#FF0000'
    }
    return new VectorLayer({
        title: `${obsType}OnPath Layer`,
        visible: true,
        source: new VectorSource({
            format: new GeoJSON({
                dataProjection: 'EPSG:5181'
            }),
            url: url,
            serverType: 'geoserver'
        }),
        zIndex: 6,
        style:
            new Style({
                stroke: new Stroke({
                    color: colorCode,
                    width: 5,
                    lineCap: 'square'

                })
            })
    })
}
export const ShowObsOnPath = ({map, pathData, locaArray, bump, bol, slopeD, showObs, onObstacleAvoidance}) => {
    let [bumpLayer, setBumpLayer] = useState([]);
    let [bolLayer, setBolLayer] = useState([]);
    let [slopeLinkLayer, setSlopeLinkLayer] = useState([]);
    let [stairLinkLayer, setStairLinkLayer] = useState([]);
    let [unpavedLinkLayer, setUnpavedLinkLayer] = useState([]);

    useEffect(() => {
        if (map && locaArray && locaArray.length >= 2) {
            let pathNodeIds = getNodeIdsOnPath(pathData).map(Number);
            let pathEdgeIds = getEdgeIdsOnPath(pathData).map(Number);

            // 1. 노드 장애물 레이어 생성
            const bumpMarker = createObsLayerWith(bump, pathNodeIds)
            const bolMarker = createObsLayerWith(bol, pathNodeIds)
            setBumpLayer(bumpMarker)
            setBolLayer(bolMarker)

            // 2. 링크 장애물 레이어 생성
            const urlSl = url4slopeObs(pathEdgeIds, slopeD)
            slopeLinkLayer = createVisibleLinkObsLayer('slope', urlSl)
            setSlopeLinkLayer(slopeLinkLayer) //setLinkObsLayer(createInvisibleLinkObsLayer(url)) 하면 null오류 남
            const urlSt = url4stairObs(pathEdgeIds)
            stairLinkLayer = createVisibleLinkObsLayer('stair', urlSt)
            setStairLinkLayer(stairLinkLayer)
            const urlUn = url4unpavedObs(pathEdgeIds)
            unpavedLinkLayer = createVisibleLinkObsLayer('unpaved', urlUn)
            setUnpavedLinkLayer(unpavedLinkLayer)

            // 2. 범례 지도에 시각화
            pathData.forEach((path, index) => {
                const listOfEdgeId = path.map(e => e.edge);
                const crsFilter = makeCrsFilter(listOfEdgeId);
                const legendLayer = new TileLayer({
                    title: `legend ${index + 1}`,
                    source: new TileWMS({
                        url: 'http://localhost:8080/geoserver/gp/wms',
                        params: { 'LAYERS': 'gp:link','CQL_FILTER': crsFilter },
                        serverType: 'geoserver',
                        visible: true,
                    }),
                    zIndex: 2
                });
                map.addLayer(legendLayer);
            })

            // 4. 모든 경로 내 장애물 레이어 지도에 추가
            map.addLayer(bumpMarker)
            map.addLayer(bolMarker)
            map.addLayer(slopeLinkLayer)
            map.addLayer(stairLinkLayer)
            map.addLayer(unpavedLinkLayer)

            // 장애물 레이어 위로 마우스 호버 시 포인터 커서 스타일 변경
            map.on('pointermove', (e) => {
                const pixel = e.pixel;
                const radius = 3; // 호버 반경 설정

                for (let dx = -radius; dx <= radius; dx++) {
                    for (let dy = -radius; dy <= radius; dy++) {
                        const feature = map.forEachFeatureAtPixel([pixel[0] + dx, pixel[1] + dy], function(feature, layer) {
                            if (layer.get('title') === 'bumpOnPath Layer' || layer.get('title') === 'bolOnPath Layer'
                            || layer.get('title') === 'slopeOnPath Layer' || layer.get('title') === 'stairOnPath Layer' || layer.get('title') === 'unpavedOnPath Layer') {
                                console.log(layer.get('title'));
                                map.getViewport().style.cursor = 'pointer';
                                return feature;
                            }
                        });
                        if (feature) return;
                    }
                }

                map.getViewport().style.cursor = '';
            });

            return () => {  // cleanUp
                map.removeLayer(bumpMarker);
                map.removeLayer(bolMarker);
                map.removeLayer(slopeLinkLayer);
                map.removeLayer(stairLinkLayer);
                map.removeLayer(unpavedLinkLayer);
            }
        }
    }, [map, pathData, bump, bol, showObs]);

    return (
        <div>
            {<PopupUIComponent category={{type: 'allObs'}} map={map} layer={[bumpLayer, bolLayer, slopeLinkLayer, stairLinkLayer, unpavedLinkLayer ]} onPath = {true} onObstacleAvoidance={onObstacleAvoidance}/>}
        </div>
    );
}
export default ShowObsOnPath;