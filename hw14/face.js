import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import * as faceapi from 'face-api';


document.addEventListener("DOMContentLoaded", () => {
  const start = async() => {
    // 1. Set up MindAR
    const mindarThree = new MindARThree({
      container: document.body,
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

    // model load
    URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/";
    await faceapi.nets.ssdMobilenetv1.loadFromUri(URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(URL);
    await faceapi.nets.ageGenderNet.loadFromUri(URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(URL);

    result.innerHTML = "Our model loaded";
    
    
    const textureLoader = new THREE.TextureLoader();
    let smiles = [
    	textureLoader.load("../images/Neutral Face Emoji.png"), //   "neutral": 0.986554741859436,
    	textureLoader.load("../images/Happy Emoji [Download iPhone Emojis].png"), //   "happy": 0.004523441195487976,
    	textureLoader.load("../images/Sad Face Emoji.png"), //   "sad": 0.0003753863857127726,
    	textureLoader.load("../images/Very Angry Emoji.png"), //   "angry": 0.002992176916450262,
    	textureLoader.load("../images/Fearful Face Emoji.png"), //   "fearful": 0.00001208446792588802,
    	textureLoader.load("../images/Disgusted Emoji.png"), //   "disgusted": 0.0010366406058892608,
    	textureLoader.load("../images/Surprised Emoji PNG.png"), //   "surprised": 0.004505474586039782
    ];
    
    const smileGeometry = new THREE.PlaneGeometry(1, 1);
    const smileMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    const smile = new THREE.Mesh(smileGeometry, smileMaterial);
    
    smileMaterial.map = smiles[0];
    smile.position.x = 0.5;
    
    const anchor = mindarThree.addAnchor(454);
    anchor.group.add(smile);

    
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
    
    console.log(faceapi.nets);
    
    // Animation loop
    renderer.setAnimationLoop(async () => {
    	if(isStop)
    		renderer.setAnimationLoop( null );
    
      if (count % SKIP === 0) {
      		//get prediction
      		const detections = await faceapi.detectAllFaces(video)
      			.withFaceLandmarks()
      			.withAgeAndGender()
      			.withFaceExpressions();

      		console.log(detections);
                const age = Math.round(detections[0].age);
                const gender = detections[0].gender;
                const gprob = Math.round(100*detections[0].genderProbability);
 
                const prob_neutral = Math.trunc(100*detections[0].expressions.neutral);
                const prob_happy = Math.trunc(100*detections[0].expressions.happy);
                const prob_sad = Math.trunc(100*detections[0].expressions.sad);
                const prob_angry = Math.trunc(100*detections[0].expressions.angry);
                const prob_fearful = Math.trunc(100*detections[0].expressions.fearful);
                const prob_disgusted = Math.trunc(100*detections[0].expressions.disgusted);
                const prob_surprised = Math.trunc(100*detections[0].expressions.surprised);
                
                // Створити масив емоцій з їх значеннями та індексами
		const emotions = [
		    { value: prob_neutral, index: 0, name: 'neutral' },
		    { value: prob_happy, index: 1, name: 'happy' },
		    { value: prob_sad, index: 2, name: 'sad' },
		    { value: prob_angry, index: 3, name: 'angry' },
		    { value: prob_fearful, index: 4, name: 'fearful' },
		    { value: prob_disgusted, index: 5, name: 'disgusted' },
		    { value: prob_surprised, index: 6, name: 'surprised' }
		];

		// Знайти емоцію з максимальним значенням
		const maxEmotion = emotions.reduce((max, current) => 
		    current.value > max.value ? current : max
		);

		// Встановити відповідну текстуру
		smileMaterial.map = smiles[maxEmotion.index];

		// Оновити матеріал
		smileMaterial.needsUpdate = true;

                //visualise prediction
                result.innerHTML = "Вік - " + age + "<br>" +
                			"Стать - " + ((gender == "male") ? "чоловіча" : "жіноча") + "<br>" +
                			"Імовірність статі - " + gprob + "<br>" +
                			"Настрій - " + maxEmotion.name + " (" + maxEmotion.value + "%)";
                
      }
      count++;
      renderer.render(scene, camera);
    });
  };
  
  start();
});

