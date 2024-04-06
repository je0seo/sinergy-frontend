import { useEffect, useState } from 'react';
import axios from 'axios';
import {NODE_BACKEND_URL} from "../constants/urls";

const searchBuildingInfo = async (keyword, setBuildingInfo, setResultExistence) => {
    const req = {keyword};
    try {
        var response = await axios.post(NODE_BACKEND_URL+'/showBuildingInfo', req, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data.rowCount > 0) {
            setBuildingInfo(response.data);
            setResultExistence(true);
        }
        else {
            setResultExistence(false);
        }
    } catch (error) {
      console.error('Error during Axios POST request', error);
    }
};

const useSearch = ({keyword}) => {
    const [bgName, setBgName] = useState('');
    const [engName, setEngName] = useState('');
    const [bgId, setBgId] = useState(0);
    const [bgSummary, setBgSummary] = useState('');
    const [bgImage, setBgImage] = useState('');
    const [totalFloors, setTotalFloors] = useState(0);
    const [loungeCnt, setLoungeCnt] = useState(0);
    const [type, setType] = useState('');
    const [resultExistence, setResultExistence] = useState(true);

    const setBuildingInfo = (data) => {
        setBgName(data.rows[0].bg_name)
        setEngName(data.rows[0].eng_name)
        setBgId(data.rows[0].bd_id)
        setBgSummary(data.rows[0].summary)
        setLoungeCnt(data.rows[0].lounge_count)
        setTotalFloors(data.rows[0].total_floor)
        setType(data.rows[0].type)
        setBgImage(data.rows[0].image_url)
    }

    useEffect(() => {
        //SideEffect
        searchBuildingInfo(keyword, setBuildingInfo, setResultExistence)
    }, [keyword]) // SideEffect가 첫번째 렌더링 이후 한번 실행되고, 이후 특정 값의 업데이트를 감지했을 때마다 실행되어야 하는 경우

    if (resultExistence == false)
        return (
            <div>
                <h3> 검색 결과가 존재하지 않습니다.</h3>
            </div>
        )
    return (
        <div>
            {bgImage && <img id="bg-image" src={bgImage} alt="Building Image" style={{width: '250px',display: 'block',margin: '0 auto'}}/>}
            <h3> {bgName}({engName}) </h3>
            [ {type} | {(type === '건물') && (<> No.{bgId}</>)} | <>총 {totalFloors}층</> ]
            {loungeCnt && <>라운지 수 : {loungeCnt}</>}
            <p> {bgSummary} </p>
        </div>
    );
}

export default useSearch;