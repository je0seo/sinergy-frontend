//HandleCategoryClick.js
import { useEffect, useState } from 'react';
import {PopupUIComponent} from './PopupC'
import Map from 'ol/Map';

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {GeoJSON} from "ol/format";

import { Style } from "ol/style";
import {showMarkerStyle} from './MarkerStyle'

const createUrl4WFS = (category) => {
     switch (category.type) {
         case 'unpaved':
         case 'stairs':
         case 'slope':
             return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                  '&request=GetFeature&typeName=gp%3Alink&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=id in ('
                  +category.data.ids + ')';
         default:
             return 'http://localhost:8080/geoserver/gp/wfs?service=WFS&version=2.0.0' +
                 '&request=GetFeature&typeName=gp%3Anode&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=node_id in ('
                 +category.data.ids +')';
     }
}

const createShowLayer = (category) => {
    return new VectorLayer({
            title: `${category.type} Layer`, // 편의시설, 도로턱, 볼라드의 노드Id 배열을 가시화
            visible: true,
            source: new VectorSource({
                format: new GeoJSON({
                    dataProjection: 'EPSG:5181'
                }),
                url: function (extent) {
                    return createUrl4WFS(category)
                },
                serverType: 'geoserver'
            }),
            zIndex: 5,
            style: showMarkerStyle(category.type),
    });
}

const HandleCategoryClick = ({category, map}) => {
    let [showLayer, setShowLayer] = useState(null); //const로 하면 바로 적용이 안 됨 + 첫 렌더링 시 addLayer에서  null 오류

    useEffect(() => {
        let layer2Add = null
        if (map && category.type) {
            console.log(category.type)
            // 편의시설 및 장애물 일괄 아이콘 표시
            layer2Add = createShowLayer(category)
            map.addLayer(layer2Add);
            setShowLayer(layer2Add);

            return () => {
                map.removeLayer(layer2Add);
            }

        }
    }, [category]);

    return (
        <PopupUIComponent category={category} map={map} layer={showLayer}/>
    );
}

export default HandleCategoryClick;