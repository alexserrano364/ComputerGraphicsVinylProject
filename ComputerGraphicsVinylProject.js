"use strict";

import * as THREE from "./libs/three.js/three.module.js";
import { OrbitControls } from './libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from './libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from './libs/three.js/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null, objectList = [], group = null, vinylGroup = null;

let raycaster = null, mouse = new THREE.Vector2(), intersected, clicked;

let floorUrl = "../images/wood.jpg", wallUrl = "../images/wall.jpg", roofUrl = "../images/roof.jpg";
let klaatuUrl = "../images/klaatu.jpg", deathfameURL = "../images/deathfame.png", joyURL = "../images/joy.png";
let coffeeTableObjUrl = {obj: "../models/coffeeTable.obj"};
let table1ObjMtlUrl = {obj: "../models/table1/table1.obj", mtl: "../models/table1/table1.mtl"}
let recordPlayerObjMtlUrl = {obj: "../models/recordPlayer/record player.obj", mtl: "../models/recordPlayer/record player.mtl"}

let duration = 10000; // ms
let currentTime = Date.now();

let materials = {}
let textureMap = null;
let bumpMap = null;

function main()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;           // Full Screen
    canvas.height = document.body.clientHeight;         // 

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

function createMaterialsPhong(MapURL, BumpMapURL, objectPhong, objectPhongTextured)
{
    
    textureMap = new THREE.TextureLoader().load(MapURL);
    bumpMap = new THREE.TextureLoader().load(BumpMapURL);

    materials[objectPhong] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    materials[objectPhongTextured] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    
}

function createMaterialsBasic(MapURL, BumpMapURL, objectBasic, objectBasicTextured)
{
 
    textureMap = new THREE.TextureLoader().load(MapURL);
    bumpMap = new THREE.TextureLoader().load(BumpMapURL);

    materials[objectBasic] = new THREE.MeshBasicMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });
    materials[objectBasicTextured] = new THREE.MeshBasicMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.18 });

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

async function loadObjTable(objModelUrl, objectList)
{
    try
    {
        const object = await new OBJLoader().loadAsync(objModelUrl.obj, onProgress, onError);

        let texture = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;
        
        // object.traverse(function (child) 
        // {
            for(const child of object.children)
            {
                //     if (child.isMesh)
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        // });

        object.scale.set(0.05, 0.06, 0.05);
        object.position.z = 6.5;
        object.position.y = -4;
        object.position.x = 4.8;
        object.rotation.y = -(Math.PI * 0.33);
        object.name = "objObject";
        
        objectList.push(object);
        scene.add(object);
    }
    catch (err) 
    {
        onError(err);
    }
}

async function loadObjMtlTable(objModelUrl, objectList)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl, onProgress, onError);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);
    
        object.traverse(function (child) {
            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // console.log(object);

        object.position.y -= 4;
        object.position.x -= 3;
        object.position.z -= 4;
        object.scale.set(0.007, 0.004, 0.005);

        objectList.push(object);
        scene.add(object);
    }
    catch (err)
    {
        onError(err);
    }
}

async function loadObjMtlRecordPlayer(objModelUrl, objectList)
{
    try
    {
        const mtlLoader = new MTLLoader();

        const materials = await mtlLoader.loadAsync(objModelUrl.mtl, onProgress, onError);

        materials.preload();
        
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        const object = await objLoader.loadAsync(objModelUrl.obj, onProgress, onError);
    
        object.traverse(function (child) {
            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // console.log(object);

        object.position.y -= 4;
        object.position.x += 5;
        object.position.z -= 4;
        object.scale.set(7.007, 7.004, 7.005);

        objectList.push(object);
        scene.add(object);
    }
    catch (err)
    {
        onError(err);
    }
}

function createVinylMesh(albumUrl, z){

    // Load album image
    const album = new THREE.TextureLoader().load(albumUrl);

    // Set up album geometry
    let vinylGeometry = new THREE.PlaneGeometry(3, 3);
    let vinylMesh = new THREE.Mesh(vinylGeometry, new THREE.MeshPhongMaterial( { map: album, side: THREE.DoubleSide, shininess: 100}));
    vinylMesh.rotation.y = -Math.PI / 2;
    vinylMesh.position.y = 2;                   // Add to wall
    vinylMesh.position.x = 9.99;                //
    vinylMesh.position.z = z;                   // Left to right on the wall
    vinylMesh.receiveShadow = true;

    return vinylMesh;
}

function onDocumentPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(vinylGroup.children);

    if (intersects.length > 0) {
        if (intersected != intersects[0].object) {
            if (intersected)
                intersected.material.emissive.set(intersected.currentHex);

            intersected = intersects[0].object;
            intersected.currentHex = intersected.material.emissive.getHex();
            intersected.material.emissive.set(0xff0000);
        }
    } else {
        if (intersected)
            intersected.material.emissive.set(intersected.currentHex);

        intersected = null;
    }
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

    // Luz del techo
    let pointLight = new THREE.PointLight( 0xe0ad42, 0.8, 0, 2.5);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Objetos obj/mtl
    loadObjTable(coffeeTableObjUrl, objectList);
    loadObjMtlTable(table1ObjMtlUrl, objectList);
    loadObjMtlRecordPlayer(recordPlayerObjMtlUrl, objectList);

    // Se crea el cuarto
    createStructure();

    // Grupo para los viniles
    vinylGroup = new THREE.Object3D;

    let klaatuMesh = createVinylMesh(klaatuUrl, -6);             // Panoramas
    vinylGroup.add(klaatuMesh);

    let deathfameMesh = createVinylMesh(deathfameURL, 6);       // Deathfame
    vinylGroup.add(deathfameMesh);

    let joyMesh = createVinylMesh(joyURL, 0);                  // JOY
    vinylGroup.add(joyMesh);

    // Se agregan los viniles al grupo general
    group.add(vinylGroup);

    // Raycasting
    document.addEventListener('pointermove', onDocumentPointerMove);



    

}

main();