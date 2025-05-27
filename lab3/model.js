import * as THREE from 'three';
import {ARButton} from "three/addons/webxr/ARButton.js";


document.addEventListener("DOMContentLoaded", () => {

const start = async() => {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera();
	const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

    const group = new THREE.Group();

    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    group.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    group.add(directionalLight);
    
    // Load the brick texture
    const textureLoader = new THREE.TextureLoader();
    const brickTexture = textureLoader.load('https://raw.githubusercontent.com/aframevr/sample-assets/refs/heads/master/assets/images/bricks/brick_roughness.jpg');
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    
    // Create materials with different texture repeats
    function createBrickMaterial(repeatX, repeatY) {
      const texture = brickTexture.clone();
      texture.repeat.set(repeatX, repeatY);
      return new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.8,
        metalness: 0.2
      });
    }
    
    // Create the ground plane
    /*
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7d1d });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.receiveShadow = true;
    group.add(ground);
    */
    
    // Function to create a wall box
    function createWall(x, y, z, width, height, depth, material, rotationY = 0) {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotationY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }
    
    // Function to create a tower
    function createTower(x, y, z, radius, height, material) {
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }
    
    // Function to create a cone (roof)
    function createCone(x, y, z, radiusBottom, height, color) {
      const geometry = new THREE.ConeGeometry(radiusBottom, height, 16);
      const material = new THREE.MeshStandardMaterial({ color: color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }
    
    // Create Fortress Exterior Walls
    // Front walls with gate
    createWall(-7, 2, -5, 4, 4, 0.5, createBrickMaterial(2, 2));
    createWall(-3, 2, -5, 4, 4, 0.5, createBrickMaterial(2, 2));
    createWall(-5, 4, -5, 2, 2, 0.5, createBrickMaterial(1, 1));
    
    // Back wall
    createWall(-5, 2, 5, 10, 4, 0.5, createBrickMaterial(5, 2));
    
    // Side walls
    createWall(-10, 2, 0, 0.5, 4, 10, createBrickMaterial(5, 2), Math.PI / 2);
    createWall(0, 2, 0, 0.5, 4, 10, createBrickMaterial(5, 2), Math.PI / 2);
    
    // Corner towers
    createTower(-10, 3, -5, 1.2, 6, createBrickMaterial(3, 2));
    createTower(-10, 3, 5, 1.2, 6, createBrickMaterial(3, 2));
    createTower(0, 3, -5, 1.2, 6, createBrickMaterial(3, 2));
    createTower(0, 3, 5, 1.2, 6, createBrickMaterial(3, 2));
    
    // Tower roofs
    createCone(-10, 6.5, -5, 1.4, 2, 0x8B4513);
    createCone(-10, 6.5, 5, 1.4, 2, 0x8B4513);
    createCone(0, 6.5, -5, 1.4, 2, 0x8B4513);
    createCone(0, 6.5, 5, 1.4, 2, 0x8B4513);
    
    // Central tower
    createTower(-5, 4, 0, 2.5, 8, createBrickMaterial(5, 3));
    createCone(-5, 8.5, 0, 2.7, 3, 0x8B4513);
    
    // Small guard tower on the wall
    createTower(-5, 4, -5, 0.6, 4, createBrickMaterial(2, 1));
    createCone(-5, 6, -5, 0.7, 1, 0x8B4513);
    
    // Interior buildings
    createWall(-7, 1, 0, 3, 2, 4, createBrickMaterial(2, 1));
    createWall(-3, 1, 0, 3, 2, 4, createBrickMaterial(2, 1));
    
    // Flagpole
    const flagpoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const flagpoleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const flagpole = new THREE.Mesh(flagpoleGeometry, flagpoleMaterial);
    flagpole.position.set(-5, 11, 0);
    flagpole.castShadow = true;
    group.add(flagpole);
    
    // Create flag with text
    const flagGroup = new THREE.Group();
    group.add(flagGroup);
    
    // Create a canvas for the flag texture with text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;
    
    // Draw red background
    context.fillStyle = 'red';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    context.font = 'bold 36px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Write the text lines
    const lines = [
      "Thank You Mario",
      "But Our Princess",
      "Is in Another Castle"
    ];
    
    lines.forEach((line, i) => {
      context.fillText(line, canvas.width / 2, (i + 0.5) * canvas.height / 3);
    });
    
    // Create a texture from the canvas
    const flagTexture = new THREE.CanvasTexture(canvas);
    
    // Create flag with the texture
    const flagGeometry = new THREE.PlaneGeometry(2.5, 1.5);
    const flagMaterial = new THREE.MeshStandardMaterial({ 
      map: flagTexture,
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(1.25, 0, 0);
    flagGroup.add(flag);
    
    // Position the flag group at the starting position for animation
    flagGroup.position.set(-5, 8.5, 0);
    
    // Animation variables
    let currentHeight = 8.5;
    const maxHeight = 12;
    const raiseSpeed = 0.03;
    let flagRaised = false;
    
    group.scale.set(0.02, 0.02, 0.02);
    group.position.z = -0.5;
    group.position.y = -0.25;
    
    scene.add(group);
    
    renderer.xr.enabled = true;
		
	const arButton = ARButton.createButton(renderer,
				{ optionalFeatures: ["dom-overlay"], domOverlay: {root: document.body} }
	);
		
	document.body.appendChild(arButton);
    
    // Animation loop
    let time = 0;
    
	renderer.setAnimationLoop(() => {
      //requestAnimationFrame(animate);
      
      // Flag raising animation
      if (!flagRaised) {
        currentHeight += raiseSpeed;
        flagGroup.position.y = currentHeight;
        
        if (currentHeight >= maxHeight) {
          flagRaised = true;
        }
      }
      
      // Flag waving animation
      if (flagRaised) {
        time += 0.03;
        
        // Simulate wind effect
        const rotY = Math.sin(time) * 8 * (Math.PI / 180);  // Convert to radians
        const rotX = Math.sin(time * 1.2) * 2 * (Math.PI / 180);
        const rotZ = Math.sin(time * 0.7) * 3 * (Math.PI / 180);
        
        flag.rotation.set(rotX, rotY, rotZ);
        
        // Add small position changes for more natural movement
        const posX = Math.sin(time * 0.8) * 0.05;
        const posY = Math.sin(time * 1.1) * 0.03;
        
        flag.position.x = 1.25 + posX;
        flag.position.y = 0 + posY;
      }
      
      renderer.render(scene, camera);
});
    
}

start();

});


