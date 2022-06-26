import Frame from '../components/Frame.js';

export default function Explore() {
  function generateGif() {
    window.open('', document.getElementById('glitch').toDataURL());
  }

  return <>
    <Frame title='Explore'>
      <script src="ccapture/build/CCapture.all.min.js"></script>
      <script src="main.js"></script>

      <div id="para" className="glitch-embed-wrap">
        {/* <iframe id="glitch" src="https://glitch.com/embed/#!/embed/generative-trees?path=index.html&previewSize=100"></iframe> */}
        <iframe id="glitch" src="/index.html"></iframe>
      </div>
    </Frame>
  </>
}
