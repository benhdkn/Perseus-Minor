/*
Perseus-Minor by benhdkn
*/

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var MARGIN = 100;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

var camera, controls, scene, renderer;
var spaceship, spaceshipRoad01 = [], spaceshipRoad02 = [], spaceshipRoad03 = [], i;
var moon, moonGlow;
var particle, particles, p, particleSystem;

init();
animate();

function init() {	
	// Camera
	camera = new THREE.PerspectiveCamera( 60, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000 );
	camera.position.set( 150, 100, 100 );

	// Orbit controls
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	controls.autoRotate = true;
	controls.autoRotateSpeed = 1.5;
	controls.userPan = false;
	controls.userRotate = true;
	controls.userZoom = false;

	// Scene
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x171717, 0.01, 800 );
	
	// Tall buildings
	var tallBuildings = new THREE.Geometry();
	var tallBuildingGeom = new THREE.CubeGeometry( 10, 80, 10 );
	// Remove bottom triangles for perf
	tallBuildingGeom.faces.splice( 6, 2 );
	var tallBuildingMat = new THREE.MeshLambertMaterial( {color: 0x0D4947});
	
	for ( var i = 0; i < 200; i ++ ) {
		var tallBuilding = new THREE.Mesh( tallBuildingGeom, tallBuildingMat );
		tallBuilding.position.x = ( Math.random() - 0.5 ) * 1000;
		tallBuilding.position.y = -320;
		tallBuilding.position.z = ( Math.random() - 0.5 ) * 1000;
		tallBuilding.scale.y = Math.random() * 10 + 1;
		tallBuilding.updateMatrix();
		tallBuilding.matrixAutoUpdate = false;
		// Merge the buildings for perf
		THREE.GeometryUtils.merge( tallBuildings, tallBuilding );
	}
	var tallBuildingsMerged = new THREE.Mesh( tallBuildings, tallBuildingMat );
	scene.add( tallBuildingsMerged );

	// Small buildings
	var smallBuildings = new THREE.Geometry();
	var smallBuildingGeom = new THREE.CubeGeometry( 20, 80, 20 );
	// Remove bottom triangles for perf
	smallBuildingGeom.faces.splice( 6, 2 );
	var smallBuildingMat = new THREE.MeshLambertMaterial( {color: 0x362F6D});

	for ( var i = 0; i < 500; i ++ ) {
		var smallBuilding = new THREE.Mesh( smallBuildingGeom, smallBuildingMat );
		smallBuilding.position.x = ( Math.random() - 0.5 ) * 1000;
		smallBuilding.position.y = -330;
		smallBuilding.position.z = ( Math.random() - 0.5 ) * 1000;
		smallBuilding.scale.y = Math.random() * 7 + 1;
		smallBuilding.updateMatrix();
		smallBuilding.matrixAutoUpdate = false;
		//Merge the buildings for perf.
		THREE.GeometryUtils.merge( smallBuildings, smallBuilding );
	}
	var smallBuildingsMerged = new THREE.Mesh( smallBuildings, smallBuildingMat );
	scene.add( smallBuildingsMerged );

	// Moon
	var moonGeom = new THREE.IcosahedronGeometry( 30, 1 );
	var moonMat = new THREE.MeshBasicMaterial( {color: 0x0D4947, wireframe: true});
	moon = new THREE.Mesh( moonGeom, moonMat );
	moon.position.set( 0, 70, 0 );
	scene.add( moon );
	// Moon glow
	// Cf. vertexShader / fragmentShader scripts
	var glowMat = new THREE.ShaderMaterial( {
	    uniforms: { 
			"c":   { type: "f", value: 1.0 },
			"p":   { type: "f", value: 1.4 },
			glowColor: { type: "c", value: new THREE.Color(0x0D4947) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	} );
	moonGlow = new THREE.Mesh( moonGeom.clone(), glowMat.clone() );
    moonGlow.position = moon.position;
	moonGlow.scale.multiplyScalar( 1.0 );
	scene.add( moonGlow );

	// Spaceships
	var spaceshipGeom = new THREE.CylinderGeometry (0, 1.5, 8, 4, false );
	var spaceshipMats = [
						new THREE.MeshBasicMaterial ( {wireframe: true, color: 0xD91657} ),
						new THREE.MeshBasicMaterial ( {wireframe: true, color: 0x8E1657} ),
						new THREE.MeshBasicMaterial ( {wireframe: true, color: 0xA11040} ),
						];
	// Spaceships road 01
	for ( var i = 0; i < 70; i ++ ) {
		spaceship = new THREE.Mesh( spaceshipGeom, spaceshipMats[ Math.round( Math.random() * 2 ) ] );
		spaceshipRoad01.push( spaceship );
		spaceship.rotation.set( (Math.PI / 2), (Math.PI), (Math.PI / 2) );
		spaceship.position.x = ( Math.random() - 0.5 ) * 1000;
		spaceship.position.y = 80 + ( Math.random() - 0.5 ) * 10;
		spaceship.position.z = -50 + ( Math.random() - 0.5 ) * 10;
		scene.add( spaceship );
	}
	// Spaceships road 02
	for ( var i = 0; i < 65; i ++ ) {
		spaceship = new THREE.Mesh( spaceshipGeom, spaceshipMats[ Math.round( Math.random() * 2 ) ] );
		spaceshipRoad02.push( spaceship );
		spaceship.rotation.set( (Math.PI / 2), 0, 0 );
		spaceship.position.x = 200 + ( Math.random() - 0.5 ) * 10;
		spaceship.position.y = 40 + ( Math.random() - 0.5 ) * 10;
		spaceship.position.z = ( Math.random() - 0.5 ) * 1000;
		scene.add( spaceship );
	}
	// Spaceships road 03
	for ( var i = 0; i < 60; i ++ ) {
		spaceship = new THREE.Mesh( spaceshipGeom, spaceshipMats[ Math.round( Math.random() * 2 ) ] );
		spaceshipRoad03.push( spaceship );
		spaceship.rotation.set( (Math.PI / 2), 0, (Math.PI) );
		spaceship.position.x = - 200 + ( Math.random() - 0.5 ) * 10;
		spaceship.position.y = 20 + ( Math.random() - 0.5 ) * 10;
		spaceship.position.z = ( Math.random() - 0.5 ) * 1000;
		scene.add( spaceship );
	}			 	

	// Spotlights
	for ( var i = 0; i < 20; i++ ) {
		var light = new THREE.PointLight( 0x362F6D, 8, 300 );
		light.position.x = ( Math.random() - 0.5 ) * 600;
		light.position.y = -60;
		light.position.z = ( Math.random() - 0.5 ) * 600;
		scene.add( light );
	}

	// Particles
	particles = new THREE.Geometry();
	var particleMat = new THREE.ParticleBasicMaterial( {color: 0xffffff, size: 1});
	for ( p = 0; p < 7000; p++ ) {
		particle = new THREE.Vector3( 
			( Math.random() - 0.5 ) * 1000,
			( ( Math.random() - 0.5) * 200 ) - 50,
			( Math.random() - 0.5 ) * 1000 
		);
		particles.vertices.push( particle );
	}
	particleSystem = new THREE.ParticleSystem( particles, particleMat )
	particleSystem.sortParticles = true; 
	scene.add( particleSystem );

	// Lines
	var lineGeom = new THREE.Geometry();
	var lineMat = new THREE.LineBasicMaterial( { color: 0xEA8F36 } );
	var vertArray = lineGeom.vertices;
	// Random vertices positions, forming a line with right angle breaks
	var breaks = 8;
	var startLine = [Math.random(), Math.random()];
	var endLine = [Math.random(), Math.random()];
	var lastX = startLine[0];
	var lastZ = startLine[1];
	vertArray.push( new THREE.Vector3( startLine[0], 0, startLine[1] ) );
	for( var i = 0; i < breaks -1; i++ ) {
		lastX = lastX + ( endLine[0] - startLine[0] ) / breaks + ( Math.random() * 50  - 25 );
		vertArray.push( new THREE.Vector3( lastX, 0, lastZ ) );
		lastZ = lastZ + Math.random() * 50;
		vertArray.push( new THREE.Vector3( lastX, 0, lastZ ) );
	}
	lineGeom.computeLineDistances();
	// Lines road
	for ( var i = 0; i < 36; i++) {
		var lines = new THREE.Line( lineGeom, lineMat );
		lines.position.set( 
				( Math.random() - 0.5) * 500, 
				( Math.random() - 2) * 100,
				( Math.random() - 0.5) * 500
				);
		lines.rotation.set( 0, Math.PI / Math.round( Math.random() * 2 ), 0 );
		scene.add( lines );
	}
	
	// Renderer
	renderer = new THREE.WebGLRenderer( { precision: "highp", antialias: true} );
	renderer.setClearColor( scene.fog.color, 1 );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	
	// Post processing
   	composer = new THREE.EffectComposer( renderer );
   	// Create shader passes
 	var renderPass = new THREE.RenderPass( scene, camera );
    var effectScreen = new THREE.ShaderPass( THREE.FocusShader );      
    // Add shader passes to composer
    composer.addPass( renderPass );
    composer.addPass( effectScreen );
    effectScreen.renderToScreen = true;

    // Dom
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();
}

function animate() {
	// Spaceship road 01 movements
	for ( i = 0; i < spaceshipRoad01.length; i++ )
		spaceshipRoad01[i].position.x += 1;
	for ( i = 0; i < spaceshipRoad01.length / 2; i++ )
		spaceshipRoad01[i].position.x += 2;
	// Spaceship road 01 reset positions
	for ( i = 0; i < spaceshipRoad01.length; i++ ) {
		if ( spaceshipRoad01[i].position.x >= 500 )
			spaceshipRoad01[i].position.x = -500;
	}

	// Spaceship road 02 movements
	for ( i = 0; i < spaceshipRoad02.length; i++ )
		spaceshipRoad02[i].position.z += 1;
	for ( i = 0; i < spaceshipRoad02.length / 2; i++ )
		spaceshipRoad02[i].position.z += 2;
	// Spaceship road 02 reset positions
	for ( i = 0; i < spaceshipRoad02.length; i++ ) {
		if ( spaceshipRoad02[i].position.z >= 500 )
			spaceshipRoad02[i].position.z = -500;
	}

	// Spaceship road 03 movements
	for ( i = 0; i < spaceshipRoad03.length; i++ )
		spaceshipRoad03[i].position.z -= 1;
	for ( i = 0; i < spaceshipRoad03.length / 2; i++ )
		spaceshipRoad03[i].position.z -= 2;
	// Spaceship road 03 reset positions
	for ( i = 0; i < spaceshipRoad03.length; i++ ) {
		if ( spaceshipRoad03[i].position.z <= -500 )
			spaceshipRoad03[i].position.z = 500;
	}

	// Particles movements and reset positions
	for ( i = 0; i < particles.vertices.length / 2; i++ ) {
		particles.vertices[i].y -= 0.1;
 		if ( particles.vertices[i].y <= -140 ) {
			particles.vertices[i].y = -40;
		}
	}

	// Moon rotation
	moon.rotation.z += 0.01;
	moon.rotation.x += 0.01;
	moonGlow.rotation.z += 0.01;
	moonGlow.rotation.x += 0.01;

	requestAnimationFrame( animate );
	controls.update();
}

function render() {
	// Render without shader
	// renderer.render( scene, camera );
	// Render with shader
	composer.render();

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
}