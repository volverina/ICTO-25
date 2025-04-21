import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
//const mobilenet = require('@tensorflow-models/mobilenet');


document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {

		const mindarThree = new MindARThree({
			container: document.body,
			imageTargetSrc: "../images/kvadevit.mind",
			uiLoading: "no", uiScanning: "no", uiError: "no",
		      });

		const {renderer, scene, camera} = mindarThree;
		
		const result = document.getElementById("result");
		
		
		console.log(mobilenet);
		
		//const model = await mobilenet.load();
		const model = await window.mobilenet.load();
	        console.log("MobileNet model loaded");

		await mindarThree.start();
		
		const SKIP=10;
		let count = 1;
		
		const video = mindarThree.video;

		renderer.setAnimationLoop(async () => {
			if(count % SKIP == 0) {
				const predictions = await model.classify(video);
				result.innerHTML = "";
				for(let i=0;i<predictions.length;i++) {
					result.innerHTML += predictions[i].className + " - " + 
						Math.round(100*predictions[i].probability) + "%<br>";
				}
				//console.log(video);
			}
			count++;
			renderer.render(scene, camera);
		});
	}
	
	start();
});


