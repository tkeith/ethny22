import Frame from '../components/Frame.js';
import Script from 'next/script'

export default function Explore() {
  function generateGif() {
    window.open('', document.getElementById('glitch').toDataURL());
  }

  return <>
    <Frame title='Explore'>
      <Script src="ccapture/build/CCapture.all.min.js"></Script>
      <Script src="main.js"></Script>

      <div id="para" className="glitch-embed-wrap">
        {/* <iframe id="glitch" src="https://glitch.com/embed/#!/embed/generative-trees?path=index.html&previewSize=100"></iframe> */}
        <iframe id="glitch" src="/index.html"></iframe>
      </div>
    </Frame>
  </>
}
