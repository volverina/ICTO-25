import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xCBEFFF);

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

cube.position.x = -2;

camera.position.z = 5;

var pyramidgeometry=new THREE.CylinderGeometry(0, 0.8, 2, 4);
var pyramidmaterial=new THREE.MeshLambertMaterial({color: 0xF3FFE2});
var pyramidmesh=new THREE.Mesh(pyramidgeometry, pyramidmaterial);
scene.add( pyramidmesh );

//pyramidmesh.position.set(0, 2, -10);

var lightOne=new THREE.AmbientLight(0xffff, 0.5);
scene.add(lightOne);

var lightTwo=new THREE.PointLight(0xffff, 5);
scene.add(lightTwo);

lightTwo.position.y = 1;
lightTwo.position.x = -1.5;

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  pyramidmesh.rotation.y+=0.01;
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

