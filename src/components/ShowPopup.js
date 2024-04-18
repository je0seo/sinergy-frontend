const usePopupHandle = () => {
    const [popupImage, setPopupImage] = useState('');
    const [popupContent, setPopupContent] = useState('');
    const popupContainerRef = useRef(null);
    const popupContentRef = useRef(null);
    const popupCloserRef = useRef(null);

    return {popupImage, popupContent, popupContainerRef, popupContentRef, popupCloserRef};
}

const PopupUIComponent = ({type}) => {
    const {popupImage, popupContent, popupContainerRef, popupContentRef,popupCloserRef} = usePopupHandle;

    return (
        <div ref={popupContainerRef} className="ol-popup">
          <button ref={popupCloserRef} className="ol-popup-closer" onClick={() => deletePopup()}>X</button>
          {popupImage && <img src={popupImage} alt="Popup Image" style={{ width: '180px', height: '150px', display: 'block'}}/>}
          <div ref={popupContentRef} className="ol-popup-content">
            {(type === 'unpaved' || type === 'stairs' || type === 'slope') && <>경사도[degree]</>}
            {type === 'bump' && <>도로턱 높이[cm]</>}
            {type === 'bol' && <>볼라드 간격[cm]</>}
            <div dangerouslySetInnerHTML={{__html: popupContent}} />
          </div>
        </div>
    );
};

export default PopupUIComponent;