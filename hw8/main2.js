import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {

		const mindarThree = new MindARThree({
			container: document.body,
			imageTargetSrc: "../images/kvadevit.mind"
		      });

		const {renderer, scene, camera} = mindarThree;
		
		const anchor = mindarThree.addAnchor(0);

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );
		anchor.group.add( cube );

		cube.position.x = -2;

		//camera.position.z = 5;

		var pyramidgeometry=new THREE.CylinderGeometry(0, 0.8, 2, 4);
		var pyramidmaterial=new THREE.MeshLambertMaterial({color: 0xF3FFE2});
		var pyramidmesh=new THREE.Mesh(pyramidgeometry, pyramidmaterial);
		anchor.group.add( pyramidmesh );

		pyramidmesh.position.set(0, 2, -10);

		var lightOne=new THREE.AmbientLight(0xffff, 0.5);
		anchor.group.add(lightOne);

		var lightTwo=new THREE.PointLight(0xffff, 5);
		anchor.group.add(lightTwo);

		lightTwo.position.y = 1;
		lightTwo.position.x = -1.5;

		await mindarThree.start();

		renderer.setAnimationLoop(() => {
			  cube.rotation.x += 0.01;
			  cube.rotation.y += 0.01;
			  pyramidmesh.rotation.x+=0.01;
			renderer.render(scene, camera);
		});
	
	}
	
	start();
});


