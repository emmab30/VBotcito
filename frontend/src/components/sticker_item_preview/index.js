import React from 'react'; // eslint-disable-line no-unused-vars

const StickerItemPreview = ({ code, url, onFlagContent }) => {

    const tagColor = `#0054ff`;
    const tag = 'Sticker';

    return (
        <div className="member">

            { tag &&
                <div style={{ position: 'absolute', top: 0, left: 0, height: 'auto', width: '100%', backgroundColor: tagColor, zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 800, fontSize: 14, color: 'white', padding: 10 }}>
                    { tag }
                </div>
            }

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${url})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center center' }} />

            <a onClick={() => onFlagContent(code)} style={{ position: 'absolute', bottom: 0, left: 0, borderTopRightRadius: 5, backgroundColor: 'white', padding: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img style={{ width: 16, height: 16 }} src="https://www.flaticon.com/svg/static/icons/svg/985/985280.svg" />
                <p style={{ fontWeight: 600, margin: 0, marginLeft: 10, fontSize: 10 }}>Flag content</p>
            </a>
        </div>
    );
} 

export default StickerItemPreview;