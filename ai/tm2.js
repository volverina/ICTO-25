import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {
  const start = async() => {
    // 1. Set up MindAR
    const mindarThree = new MindARThree({
      container: document.body,
      imageTargetSrc: "../images/kvadevit.mind",
      uiLoading: "no", uiScanning: "no", uiError: "no",
    });
    const {renderer, scene, camera} = mindarThree;
    
    const stopButton = document.getElementById('stop');
    
    // 2. Add result display
    const result = document.getElementById("result");
    result.style.position = "absolute";
    result.style.top = "0";
    result.style.left = "0";
    result.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    result.style.color = "white";
    result.style.padding = "10px";
    result.style.fontSize = "14px";
    result.style.fontFamily = "monospace";
    result.style.maxWidth = "100%";
    result.style.maxHeight = "100%";
    result.style.overflow = "auto";

    const URL = "../lib/model/"
   
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        const model = await tmImage.load(modelURL, metadataURL);
        const maxPredictions = model.getTotalClasses();

    result.innerHTML = "Our model loaded";
    
    // 4. Start MindAR
    await mindarThree.start();
    let isStop = false;

    stopButton.addEventListener('click', () => {
    	mindarThree.stop();
    	isStop = true;
    	renderer.setAnimationLoop( null );
    	result.innerHTML = "";
    });


    // 5. Process video frames
    const video = mindarThree.video;
    const SKIP = 5; // Process every 20th frame for better performance
    let count = 1;
    
    // Animation loop
    renderer.setAnimationLoop(async () => {
    	if(isStop)
    		renderer.setAnimationLoop( null );
    
      if (count % SKIP === 0) {
                const prediction = await model.predict(video);
                result.innerHTML = "";
		for (let i = 0; i < maxPredictions; i++) 
		    result.innerHTML +=
		        prediction[i].className + ": " + 100*prediction[i].probability.toFixed(2) + "%<br>";
      }
      count++;
      renderer.render(scene, camera);
    });
  };
  
  start();
});

