// js/main.js
var scene, camera, renderer, mesh;
var meshFloor, ambientLight, light;

var crate, crateTexture, createNormalMap, createBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;

function init(){

    // init scene
    scene = new THREE.Scene();

    // init camera
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    
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
    var textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    crateTexture = textureLoader.load('crate0_diffuse.png');

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