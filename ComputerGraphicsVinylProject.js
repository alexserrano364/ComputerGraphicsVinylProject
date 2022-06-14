"use strict";

import * as THREE from "./libs/three.js/three.module.js";
import { OrbitControls } from './libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from './libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from './libs/three.js/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null, objectList = [], group = null;

let floorUrl = "../images/wood.jpg";
let wallUrl = "../images/wall.jpg";
let roofUrl = "../images/roof.jpg";
let coffeeTableobjUrl = "../models.coffeeTable.obj"

let duration = 10000; // ms
let currentTime = Date.now();

let materials = {}
let textureMap = null;
let bumpMap = null;

function main()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    // create the scene
    createScene(canvas);

    // Run the update loop
    update();

    orbitControls().update;
}

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) 
{
    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        // console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

function animate(){
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * fract * 1.5;
}

function update(){
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );

    animate();
}

function createMaterialsPhong(MapURL, BumpMapURL, planetPhong, planetPhongTextured)
{
    
    textureMap = new THREE.TextureLoader().load(MapURL);
    bumpMap = new THREE.TextureLoader().load(BumpMapURL);

    materials[planetPhong] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    materials[planetPhongTextured] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    
}

function createMaterialsBasic(MapURL, BumpMapURL, planetBasic, planetBasicTextured)
{
 
    textureMap = new THREE.TextureLoader().load(MapURL);
    bumpMap = new THREE.TextureLoader().load(BumpMapURL);

    materials[planetBasic] = new THREE.MeshBasicMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    materials[planetBasicTextured] = new THREE.MeshBasicMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });

}

function setMaterial(name, object, objectTextured)
{
    materialName = name;
    if (textureOn)
    {
        object.visible = false;
        objectTextured.visible = true;
        objectTextured.material = materials[name];
    }
    else
    {
        object.visible = true;
        objectTextured.visible = false;
        object.material = materials[name];
    }
}

function createStructure(){
    // Create floor
    const floor = new THREE.TextureLoader().load(floorUrl);
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
    floor.repeat.set(8,8);

    let geometry = new THREE.PlaneGeometry(20, 20);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: floor, side: THREE.DoubleSide, shininess: 100}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Create walls and roof
    const wall = new THREE.TextureLoader().load(wallUrl);
    wall.wrapS = wall.wrapT = THREE.RepeatWrapping;
    wall.repeat.set(8,8);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: wall, side: THREE.DoubleSide, shininess: 5}));
    mesh.position.z -= 10;
    mesh.position.y += 4;
    group.add(mesh);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: wall, side: THREE.DoubleSide, shininess: 5}));
    mesh.position.z += 10;
    mesh.position.y += 4;
    group.add(mesh);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: wall, side: THREE.DoubleSide, shininess: 5}));
    mesh.position.x += 10;
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.y += 4;
    group.add(mesh);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: wall, side: THREE.DoubleSide, shininess: 5}));
    mesh.position.x -= 10;
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.y += 4;
    group.add(mesh);

    const roof = new THREE.TextureLoader().load(roofUrl);
    roof.wrapS = roof.wrapT = THREE.RepeatWrapping;
    roof.repeat.set(2,2);

    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( { map: roof, side: THREE.DoubleSide, shininess: 0}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y += 5.5;
    group.add(mesh);
}

function createScene(canvas){
    
    // Renderer
    renderer = new THREE.WebGLRenderer ( { canvas: canvas, antialias: true } );

    // Viewport
    renderer.setSize(canvas.width, canvas.height);

    // Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

    // Camera
    camera = new THREE.PerspectiveCamera( 60, canvas.width / canvas.height, 1, 100 );
    camera.position.z = 8;
    camera.position.y = 5;
    scene.add(camera);

    // OrbitControls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableZoom = false;

    // Create a group to hold all the objects
    group = new THREE.Object3D;
    scene.add(group);

    // Light
    let light = new THREE.AmbientLight ( 0xffffff , 0.3);
    scene.add(light);

    let pointLight = new THREE.PointLight( 0xe0ad42, 0.8, 0, 2);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    createStructure();



    

}

main();