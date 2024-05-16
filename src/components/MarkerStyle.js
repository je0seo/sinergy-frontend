import {Circle, Fill, Stroke, Style, Icon} from "ol/style";

import bumpIcon from './images/icons/bumpIcon.png';
import bolIcon from './images/icons/bolIcon.png';
import unpavedIcon from './images/icons/unpavedIcon.png';
import stairsIcon from './images/icons/stairsIcon.png';
import slopeIcon from './images/icons/slopeIcon.png';
import facilitiesIcon from './images/icons/facilitiesIcon.png';
import benchIcon from './images/icons/benchIcon.png';
import atmIcon from './images/icons/atmIcon.png';
import bicycleIcon from './images/icons/bicycleIcon.png';
import smokingIcon from './images/icons/smokingIcon.png';
import storeIcon from './images/icons/storeIcon.png';
import cafeIcon from './images/icons/cafeIcon.png';
import postOfficeIcon from './images/icons/postOfficeIcon.png';
import healthServiceIcon from './images/icons/healthServiceIcon.png';
import cafeteriaIcon from './images/icons/cafeteriaIcon.png';
import printIcon from './images/icons/printIcon.png';
import gymIcon from './images/icons/gymIcon.png';
import tennisIcon from './images/icons/tennisIcon.png';
import basketballIcon from './images/icons/basketballIcon.png';
import breakRoomIcon from './images/icons/breakRoomIcon.png';
import loungeIcon from './images/icons/loungeIcon.png';
import seminarRoomIcon from './images/icons/seminarRoomIcon.png';
import sBicycleIcon from './images/icons/sBicycleIcon.png';
import vendingMachineIcon from './images/icons/vendingMachineIcon.png';
import libraryIcon from './images/icons/libraryIcon.png';
import toiletIcon from './images/icons/toiletIcon.png';
import magnifier from './images/icons/magnifier.png';
import rooftopIcon from './images/icons/rooftopIcon.png';
import cafestoreIcon from './images/icons/cafestoreIcon.png';
import diningIcon from './images/icons/diningIcon.png';
import restaurantIcon from './images/icons/restaurantIcon.png';
import showerRoomIcon from './images/icons/showerroomIcon.png';
import sportsIcon from './images/icons/sportsIcon.png';
import squashIcon from './images/icons/squashIcon.png';
import unmannedIcon from './images/icons/unmannedIcon.png';
import settingsIcon from './images/icons/settingsIcon.png'
import NoBumpIcon from './images/icons/NoBumpIcon.png';
import NoBolIcon from './images/icons/NoBolIcon.png';
import NoUnpavedIcon from './images/icons/NoUnpavedIcon.png';
import NoStairsIcon from './images/icons/NoStairIcon.png';
import NoSlopeIcon from './images/icons/NoSlopeIcon.png';

import IrubumpIcon from './images/icons/Icon/bumpIcon.png';
import IrubolIcon from './images/icons/Icon/bolIcon.png';
import IruunpavedIcon from './images/icons/Icon/unpavedIcon.png';
import IrustairsIcon from './images/icons/Icon/stairsIcon.png';
import IruslopeIcon from './images/icons/Icon/slopeIcon.png';
//import facilitiesIcon from './images/icons/facilitiesIcon.png';
import IrubenchIcon from './images/icons/Icon/benchIcon.png';
import IruatmIcon from './images/icons/Icon/atmIcon.png';
import IrubicycleIcon from './images/icons/Icon/bicycleIcon.png';
import IrusmokingIcon from './images/icons/Icon/smokingIcon.png';
import IrustoreIcon from './images/icons/Icon/storeIcon.png';
import IrucafeIcon from './images/icons/Icon/cafeIcon.png';
import IrupostOfficeIcon from './images/icons/Icon/postOfficeIcon.png';
import IruhealthServiceIcon from './images/icons/Icon/healthServiceIcon.png';
import IrucafeteriaIcon from './images/icons/Icon/cafeteriaIcon.png';
import IruprintIcon from './images/icons/Icon/printIcon.png';
import IrugymIcon from './images/icons/Icon/gymIcon.png';
import IrutennisIcon from './images/icons/Icon/tennisIcon.png';
import IrubasketballIcon from './images/icons/Icon/basketballIcon.png';
import IrubreakRoomIcon from './images/icons/Icon/breakRoomIcon.png';
import IruloungeIcon from './images/icons/Icon/loungeIcon.png';
import IruseminarRoomIcon from './images/icons/Icon/seminarRoomIcon.png';
import IrusBicycleIcon from './images/icons/Icon/sBicycleIcon.png';
import IruvendingMachineIcon from './images/icons/Icon/vendingMachineIcon.png';
import IrulibraryIcon from './images/icons/Icon/libraryIcon.png';
import IrutoiletIcon from './images/icons/Icon/toiletIcon.png';
import IrurooftopIcon from './images/icons/Icon/rooftopIcon.png';
import IrucafestoreIcon from './images/icons/Icon/cafestoreIcon.png';
import IrudiningIcon from './images/icons/Icon/diningIcon.png';
import IrurestaurantIcon from './images/icons/Icon/restaurantIcon.png';
import IrushowerRoomIcon from './images/icons/Icon/showerroomIcon.png';
import IrusportsIcon from './images/icons/Icon/sportsIcon.png';
import IrusquashIcon from './images/icons/Icon/squashIcon.png';
import IruunmannedIcon from './images/icons/Icon/unmannedIcon.png';

//import magnifier from './images/icons/magnifier.png';


import irumarkerS from './images/IrumakerS.png';
import irumarkerE from './images/IrumakerE.png';
import irumarker2 from './images/IrumakerY.png';

export const Icons = {
    bumpIcon, bolIcon, unpavedIcon, stairsIcon, slopeIcon, facilitiesIcon, benchIcon, atmIcon,
    bicycleIcon, smokingIcon, storeIcon, cafeIcon, postOfficeIcon, healthServiceIcon, cafeteriaIcon,
    printIcon, gymIcon, tennisIcon, basketballIcon, breakRoomIcon, loungeIcon, seminarRoomIcon,
    sBicycleIcon, vendingMachineIcon, libraryIcon, toiletIcon, magnifier, rooftopIcon, cafestoreIcon, diningIcon, restaurantIcon, showerRoomIcon, sportsIcon, squashIcon, unmannedIcon, settingsIcon, NoBumpIcon, NoBolIcon, NoUnpavedIcon, NoSlopeIcon, NoStairsIcon
}

export const clickedLinkStyle = new Style({
     stroke: new Stroke({
         color: 'rgba(255, 255, 255, 1)',
         width: 7
     })
})

export const basicMarkerStyle = (irumarker) => { //출발지 스타일
    return new Style({
        image: new Icon({
            src: irumarker,
            scale: 0.08,
            opacity: 1, // 이미지의 투명도
            rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부
            rotation: 0,// 이미지의 초기 회전 각도
            anchor: [0.5, 1] // 아이콘의 중심을 아이콘 이미지의 아래 중앙으로 이동
        }),
    });
};

export const clickedMarkerStyle = (irumarker) => {
  return new Style({
      image: new Icon({
          src: irumarker, // 이미지 파일의 경로를 설정합니다.
          scale: 0.08, // 이미지의 크기를 조절합니다. 필요에 따라 조절하세요.
          opacity: 0.7, // 이미지의 투명도를 조절합니다.
          rotateWithView: false, // 지도 회전에 따라 이미지를 회전할지 여부를 설정합니다.
          rotation: 0, // 이미지의 초기 회전 각도를 설정합니다.
          anchor: [0.5, 1], // 아이콘의 중심을 아이콘 이미지의 아래 중앙으로 이동
      })
  });
};

export const showMarkerStyle = (markertype) => {
    let markerimg; // markerimg 변수를 함수 스코프 내로 이동하여 전역으로 선언
    switch (markertype) {
        case 'facilities': markerimg = facilitiesIcon; break;
        case 'bench': markerimg = IrubenchIcon; break;
        case 'atm': markerimg = IruatmIcon; break;
        case 'bicycle': markerimg = IrubicycleIcon; break;
        case 'smoking': markerimg = IrusmokingIcon; break;
        case 'store': markerimg = IrustoreIcon; break;
        case 'cafe': markerimg = IrucafeIcon; break;
        case 'postoffice': markerimg = IrupostOfficeIcon; break;
        case 'healthservice': markerimg = IruhealthServiceIcon; break;
        case 'cafeteria': markerimg = IrucafeteriaIcon; break;
        case 'print': markerimg = IruprintIcon; break;
        case 'gym': markerimg = IrugymIcon; break;
        case 'tennis': markerimg = IrutennisIcon; break;
        case 'basketball': markerimg = IrubasketballIcon; break;
        case 'breakroom': markerimg = IrubreakRoomIcon; break;
        case 'lounge': markerimg = IruloungeIcon; break;
        case 'seminarroom': markerimg = IruseminarRoomIcon; break;
        case 'Sbicycle': markerimg = IrusBicycleIcon; break;
        case 'library': markerimg = IrulibraryIcon; break;
        case 'vendingMachine': markerimg = IruvendingMachineIcon; break;
        case 'toilet': markerimg = IrutoiletIcon; break;
        case 'restaurant': markerimg = IrurestaurantIcon; break;
        case 'unmanned civil service': markerimg = IruunmannedIcon; break;
        case 'rooftop garden': markerimg = IrurooftopIcon; break;
        case 'shower room': markerimg = IrushowerRoomIcon; break;
        case 'sports': markerimg = IrusportsIcon; break;
        case 'squash': markerimg = IrusquashIcon; break;
        case 'dining': markerimg = IrudiningIcon; break;
        case 'cafe&store': markerimg = IrucafestoreIcon; break;
        case 'bump': markerimg = IrubumpIcon; break;
        case 'bol': markerimg = IrubolIcon; break;
        case 'unpaved':
            return new Style({
                stroke: new Stroke({
                    color: '#711B6B', // 선의 색상
                    width: 3 // 선의 두께
                })
            });
        case 'stairs':
            return new Style({
                stroke: new Stroke({
                    color: '#ff0000', // 선의 색상
                    width: 3 // 선의 두께
                })
            });
        case 'slope':
            return new Style({
                stroke: new Stroke({
                    color: '#ffac00', // 선의 색상
                    width: 3 // 선의 두께
                })
            });
        default: /* 처리되지 않은 경우 기본값 설정 */ break;
    }
    return new Style({
        image: new Icon({
            src: markerimg,
            scale: 0.06,
            opacity: 1,
            rotateWithView: false,
            rotation: 0,
            anchor: [0.5, 1], // 아이콘의 중심을 아이콘 이미지의 아래 중앙으로 이동
            //color: 'rgb(252,243,198)'
        })
    });
};