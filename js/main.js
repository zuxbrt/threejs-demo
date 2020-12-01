// js/main.js
var scene, camera, renderer, mesh;
var meshFloor, ambientLight, light;

var crate, crateTexture, createNormalMap, createBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;

// loading screen
var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial( { color: 0x4444ff } )
    )
}

var loadingManager = null;
var RESOURCES_LOADED = false;

function init(){

    // init scene
    scene = new THREE.Scene();

    // init camera
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // set up loading screen scene
    loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

    // create a loading manager to set RESOURCES_LOADED state,
    // and pass him to all resource loaders
    loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = function(item, loaded, total){
        console.log(item, loaded, total);
    }

    loadingManager.onLoad = function(){
        console.log("Finished loading.");
        RESOURCES_LOADED = true;
    }
    
    // create box in center
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshBasicMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	);
    mesh.position.y += 1; // Move the mesh up 1 meter

    // the cube can have shadows cast on it, and it can cast shadows
    mesh.receiveShadow = true;
    mesh.castShadow = true;
	scene.add(mesh);
    
    // create floor
	meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(10,10, 10,10),
        // MeshBasicMaterial does not react to lighting, so we replace with MeshPhongMaterial
        new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
        // See threejs.org/examples/ for other material types
	);
    meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
    // floor can have shadows cast onto it
    meshFloor.receiveShadow = true;
	scene.add(meshFloor);
    
    // lights
    // ambient
    ambientLight = new THREE.PointLight(0xffffff, 0.2);
    scene.add(ambientLight)

    // general
    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(-3, 6, -3);
    light.castShadow = true;
    // this light will not affect objects closer than 0.1 units / further than 25 units
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    // texture loading
    var textureLoader = new THREE.TextureLoader(loadingManager);
    textureLoader.crossOrigin = "anonymous";
    crateTexture = textureLoader.load('/textures/crate/crate0_diffuse.png');
    crateBumpMap = textureLoader.load('/textures/crate/crate0_bump.png');
    crateNormalMap = textureLoader.load('/textures/crate/crate0_normal.png');

    // create mesh with these textures
    crate = new THREE.Mesh(
		new THREE.BoxGeometry(3,3,3),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap
		})
	);
	scene.add(crate);
	crate.position.set(2.5, 3/2, 2.5);
	crate.receiveShadow = true;
	crate.castShadow = true;

    // Model/material loader - not working
    var mtlLoader = new THREE.MTLLoader(loadingManager);
    mtlLoader.load('models/Tent_Poles_01.mtl', function(materials){

        materials.preload();
        // object loader
        var objLoader = new THREE.OBJLoader(loadingManager);
        objLoader.setMaterials(materials);

        objLoader.load('models/Tent_Poles_01.obj', function(mesh){

            mesh.traverse(function(node){
                if(node instanceof THREE.Mesh ){
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            scene.add(mesh);
            mesh.position.set(-5, 0, 4);
            mesh.rotation.y = -Math.PI/4;
        })
    })

    // position the camera to look at the player
	camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // enable shadows in the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

	document.body.appendChild(renderer.domElement);
	
	animate();
}

function animate(){

    // this runs while resources are loading
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return; // Stop the function here.
    }

	requestAnimationFrame(animate);
	
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	
	// Keyboard movement inputs
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		// Redirect motion by 90 degrees
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	// Keyboard turn inputs
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;