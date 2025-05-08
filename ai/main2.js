// main2.js - Pose Estimation with MoveNet
import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

//document.addEventListener("DOMContentLoaded", () => {
  const start = async() => {
    // 1. Set up MindAR
    const mindarThree = new MindARThree({
      container: document.body,
      imageTargetSrc: "../images/kvadevit.mind",
      uiLoading: "no", uiScanning: "no", uiError: "no",
    });
    const {renderer, scene, camera} = mindarThree;
    
    // 2. Set up display elements
    const result = document.getElementById("result");
    result.style.position = "absolute";
    result.style.top = "0";
    result.style.left = "0";
    result.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    result.style.color = "white";
    result.style.padding = "10px";
    result.style.fontFamily = "monospace";
    
    // 3. Load MoveNet model (Lightning variant for speed)
    result.innerHTML = "Loading MoveNet model...";
    //const modelUrl = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
    const modelUrl = "../lib/movenet/model.json";

    const model = await tf.loadGraphModel(modelUrl);
    result.innerHTML = "MoveNet model loaded";
    
    // 4. Start MindAR
    await mindarThree.start();
    
    // 5. Set up processing parameters
    const video = mindarThree.video;
    const SKIP = 5; // Process every 5th frame
    let count = 1;
    
    // Create a canvas overlay for visualization
    const canvas = document.createElement('canvas');
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    // Keypoint names for easier reference
    const KEYPOINT_NAMES = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    // Connections for visualization
    const CONNECTIONS = [
      ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'], ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle'],
      ['nose', 'left_eye'], ['left_eye', 'left_ear'], ['nose', 'right_eye'],
      ['right_eye', 'right_ear']
    ];
    
    // Function to detect pose
    const detectPose = async (videoElement) => {
      return tf.tidy(() => {
        // Prepare input: MoveNet requires 192x192
        const img = tf.browser.fromPixels(videoElement);
        const input = tf.image.resizeBilinear(img, [192, 192]);
        const expanded = input.expandDims(0);
        const normalized = expanded.div(127.5).sub(1);
        
        // Run prediction
        const result = model.predict(normalized);
        
        // Process and return keypoints
        const keypoints = result.arraySync()[0][0];
        
        return keypoints.map((keypoint, i) => {
          return {
            name: KEYPOINT_NAMES[i],
            x: keypoint[1] * videoElement.videoWidth,
            y: keypoint[0] * videoElement.videoHeight,
            score: keypoint[2]
          };
        });
      });
    };
    
    // Function to draw pose
    const drawPose = (keypoints) => {
      // Clear canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Set drawing styles
      ctx.fillStyle = "red";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      
      // Draw keypoints
      keypoints.forEach(keypoint => {
        if (keypoint.score > 0.3) { // Only draw confident keypoints
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      
      // Draw connections
      CONNECTIONS.forEach(connection => {
        const from = keypoints.find(kp => kp.name === connection[0]);
        const to = keypoints.find(kp => kp.name === connection[1]);
        
        if (from && to && from.score > 0.3 && to.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      });
    };
    
    // Animation loop
    renderer.setAnimationLoop(async () => {
      if (count % SKIP === 0) {
        try {
          const keypoints = await detectPose(video);
          
          // Update canvas size to match video
          if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          
          // Draw pose
          drawPose(keypoints);
          
          // Update results display
          result.innerHTML = "Detected Pose Points:<br>";
          
          // Filter for high-confidence points
          const confidentPoints = keypoints.filter(kp => kp.score > 0.5);
          confidentPoints.slice(0, 5).forEach(kp => { // Show top 5 most confident points
            result.innerHTML += `${kp.name}: ${Math.round(kp.score * 100)}%<br>`;
          });
          
        } catch (error) {
          console.error("Error in pose detection:", error);
        }
      }
      count++;
      renderer.render(scene, camera);
    });
  };
  
  start();
//});

