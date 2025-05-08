// main1.js - Object Detection with YOLOv5
import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

//alert("main1.js, подія DOMContentLoaded ще не надійшла");

//document.addEventListener("DOMContentLoaded", () => {
//  alert("main1.js, подія DOMContentLoaded надійшла");
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
    
    // 3. Load YOLO model
    result.innerHTML = "Loading YOLOv5 model...";
    // const modelUrl = "https://www.kaggle.com/api/v1/models/kaggle/yolo-v5/tfLite/tflite-tflite-model/1/download";
    // const modelUrl = 'https://tfhub.dev/tensorflow/tfjs-model/yolov5s/1/default/1';
    const modelUrl = "../lib/yolov5s/model.json";
    const model = await tf.loadGraphModel(modelUrl);
    result.innerHTML = "YOLOv5 model loaded";
    
    // Get COCO class names
    const labels = [
      'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
      'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
      'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
      'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
      'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
      'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
      'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
      'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
      'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
      'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
    ];

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
    const SKIP = 1; // Process every 20th frame for better performance
    let count = 1;
    
    // For visualization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Detection function
    const detectObjects = async (videoElement) => {
      // Prepare canvas
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Model expects 640x640 input
      const inputTensor = tf.tidy(() => {
        // Capture frame from video and normalize
        const imgTensor = tf.browser.fromPixels(videoElement);
        
        // Resize and normalize
        const resized = tf.image.resizeBilinear(imgTensor, [640, 640]);
        const normalized = resized.div(255.0).expandDims(0);
        return normalized;
      });
      
      // Run detection
      const predictions = await model.executeAsync(inputTensor);
      
      // Process output
      const [boxes, scores, classes, valid_detections] = predictions;
      const boxesData = boxes.dataSync();
      const scoresData = scores.dataSync();
      const classesData = classes.dataSync();
      const validDetections = valid_detections.dataSync()[0];
      
      // Clean up tensors
      tf.dispose(predictions);
      inputTensor.dispose();
      
      // Filter results with confidence > 0.4
      let detectionResults = [];
      for (let i = 0; i < validDetections; ++i) {
        const confidence = scoresData[i];
        if (confidence > 0.4) {
          const classId = Math.round(classesData[i]);
          const label = labels[classId];
          
          // YOLOv5 outputs boxes in normalized [y1, x1, y2, x2] format
          const y1 = boxesData[i * 4] * canvas.height;
          const x1 = boxesData[i * 4 + 1] * canvas.width;
          const y2 = boxesData[i * 4 + 2] * canvas.height;
          const x2 = boxesData[i * 4 + 3] * canvas.width;
          
          detectionResults.push({
            label,
            confidence,
            x1, y1, x2, y2
          });
        }
      }
      
      return detectionResults;
    };
    
    // Animation loop
    renderer.setAnimationLoop(async () => {
    	if(isStop)
    		renderer.setAnimationLoop( null );
    
      if (count % SKIP === 0) {
        try {
          const detections = await detectObjects(video);
          
          // Display results
          result.innerHTML = `<div>Detected ${detections.length} objects:</div>`;
          
          detections.forEach(detection => {
            result.innerHTML += `
              <div style="margin-top: 5px;">
                ${detection.label} - ${Math.round(detection.confidence * 100)}% 
                [${Math.round(detection.x1)}, ${Math.round(detection.y1)}, ${Math.round(detection.x2)}, ${Math.round(detection.y2)}]
              </div>
            `;
          });
        } catch (error) {
          console.error("Error in detection:", error);
        }
      }
      count++;
      renderer.render(scene, camera);
    });
  };
  
  start();
//});

