// Le esercitazioni vanno svolte in forma INDIVIDUALE.
// Le rototraslazioni vanno definite utilizzando le matrici, e NON le funzioni goniometriche.
// Ricordatevi di utilizzare CHROME e un piccolo server locale per testare il vostro progetto.
// Va consegnato un unico file .zip contenente la cartella di lavoro, con dentro codice, textures e la libreria THREE.js.
// dalila.ressi@unive.it

// Per avviare un server locale potete utilizzare da terminale:
// py -m http.server 8888         per windows
// cd "OneDrive\Documenti\Università\3 anno - 1 semestre\Linguaggi per la Rete\Esercitazioni\Sistema solare"

// bg, mars, rings

var angle = 0;

var Aster = function (){
	var baseAster = Object.defineProperties ({}, {
		radius : { value: 1, writable: true, enumerable: false, configurable: false },
		color : { value: 0xffffff, writable: true, enumerable: false, configurable: false },
		geometry : { value: undefined, writable: true, enumerable: false, configurable: true },
		material : { value: undefined, writable: true, enumerable: false, configurable: true },
		sphere : { value: undefined, writable: true, enumerable: false, configurable: true },
		set : { writable: false, enumerable: false, configurable: false, value:
			function(){
				var texture = new THREE.TextureLoader().load(this.color);
				this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
				this.material = new THREE.MeshLambertMaterial({map: texture});
				//this.material.map.minFilter = THREE.LinearFilter;
				this.sphere = new THREE.Mesh(this.geometry, this.material);
			}
		}
	});
	function A (r, c, p){
		Object.defineProperty (this, 'radius', {value: r, writable: true, enumerable: false, configurable: false});
		Object.defineProperty (this, 'color', {value: c, writable: true, enumerable: false, configurable: false});
		this.set();
		this.sphere.matrixAutoUpdate = false;
		p.add(this.sphere);
	}
	A.prototype = baseAster;
	return A;
}();

window.onload = function(){

	//WebGl renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	//Scene
  var scene = new THREE.Scene();
	renderer.autoClear = false;

	//Background
	var bgTexture = new THREE.TextureLoader().load('space.jpg');
	var bgGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
	var bgMaterial = new THREE.MeshLambertMaterial({map: bgTexture});
	var bg = new THREE.Mesh(bgGeometry, bgMaterial);
	//bg.layers.set(0);
	scene.background = bg; //non va

  //Camera
  var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 100;
	camera.isGoingDown = true;

	//Lighting
	var globalLight   =  new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2);
	var sunLight      =  new THREE.PointLight( 0xfceea7, 1.5, 0, 2 );
	var sunGlowLight  =  new THREE.HemisphereLight( 0xffffff, 0xffffff, 1);
	globalLight.layers.set(2);
	sunLight.layers.set(2);
	sunGlowLight.layers.set(1);
	scene.add( globalLight );
	scene.add( sunLight );
	scene.add( sunGlowLight );

	//Objects
	var obj = new THREE.Object3D();
	scene.add(obj);
	var sun      =  new Aster(10, "sun.jpg", scene);
	var earth    =  new Aster(3.5, "earth.jpg", sun.sphere);
	var jupiter  =  new Aster(4.3, "jupiter.jpg", sun.sphere);
	var moon     =  new Aster(0.9, "moon.jpg", earth.sphere);
	var ganymede =  new Aster(1.2, "ganymede.jpg", jupiter.sphere);
	sun.sphere.layers.set(1);
	earth.sphere.layers.set(2);
	jupiter.sphere.layers.set(2);
	moon.sphere.layers.set(2);
	ganymede.sphere.layers.set(2);

  //Animations
  var render_scene= function(){

    var now = Date.now();
    var dt = now - (render_scene.time||now);
    render_scene.time = now;

		//Camera animation
		camera.lookAt(0, 0, 0);
		if (angle < 1.5){
			camera.position.z = 100 * Math.sin( angle );
		}
		camera.position.y = 50 * Math.sin( angle/2 );
		angle += 0.01;
		camera.updateProjectionMatrix();

		//Objects
			//Self rotation
		var earthSRotY    =  new THREE.Matrix4().makeRotationY(0.002*render_scene.time);
		var earthSRotX    =  new THREE.Matrix4().makeRotationX(0.3);
		var jupiterSRotY  =  new THREE.Matrix4().makeRotationY(0.0009*render_scene.time);
		var jupiterSRotX  =  new THREE.Matrix4().makeRotationX(0.6);
		var moonSRot      =  new THREE.Matrix4().makeRotationY(0.1*render_scene.time);
		var ganymedeSRot  =  new THREE.Matrix4().makeRotationY(0.09*render_scene.time);
			//Rotation
		var earthRot      =  new THREE.Matrix4().makeRotationY(0.0003*render_scene.time);
		var jupiterRot    =  new THREE.Matrix4().makeRotationY(0.0001*render_scene.time);
		var moonRotY      =  new THREE.Matrix4().makeRotationY(0.002*render_scene.time);
		var ganymedeRotY  =  new THREE.Matrix4().makeRotationY(0.002*render_scene.time);
			//Translation
    var earthTras     =  new THREE.Matrix4().makeTranslation(30, 0, 0);
		var jupiterTras   =  new THREE.Matrix4().makeTranslation(50, 0, 0);
		var moonTras      =  new THREE.Matrix4().makeTranslation(5, 2*Math.sin(angle*2.5), 0);
		var ganymedeTras  =  new THREE.Matrix4().makeTranslation(6.5, 3*Math.sin(angle*3.5), 0);
			//Transformation
		earth.sphere.matrix = earthRot.multiply(earthTras.multiply(earthSRotY)).multiply(earthSRotX);
		jupiter.sphere.matrix = jupiterRot.multiply(jupiterTras.multiply(jupiterSRotY)).multiply(jupiterSRotX);
		moon.sphere.matrix = moonRotY.multiply(moonTras.multiply(moonSRot));
		ganymede.sphere.matrix = ganymedeRotY.multiply(ganymedeTras.multiply(ganymedeSRot));

		// Render
		//camera.layers.set(0);
		//renderer.render(scene, camera);
		camera.layers.set(1);
		renderer.render(scene, camera);
		camera.layers.set(2);
	  renderer.render(scene, camera);

    requestAnimationFrame(render_scene);
  }

  render_scene();
}
