// MELANIA GOTTARDO 874240 - Sistema solare
//Nota: mi sono presa la libertà di utilizzare OrbitsControl.js all'html per poter
// usare il mouse per muovere la camera. Andando a commentare le righe che vi
// fanno riferimento, il codice comunque funziona normalmente.

var Aster = function (){
	var baseAster = Object.defineProperties ({}, {
		radius   : { value: 1, writable: true, enumerable: false, configurable: false },
		color    : { value: 0xffffff, writable: true, enumerable: false, configurable: false },
		geometry : { value: undefined, writable: true, enumerable: false, configurable: true },
		material : { value: undefined, writable: true, enumerable: false, configurable: true },
		sphere   : { value: undefined, writable: true, enumerable: false, configurable: true },
		set      : { writable: false, enumerable: false, configurable: false, value:
			function(){
				var texture    =  new THREE.TextureLoader().load(this.color);
				this.geometry  =  new THREE.SphereGeometry(this.radius, 32, 32);
				this.material  =  new THREE.MeshLambertMaterial({map: texture});
				this.sphere    =  new THREE.Mesh(this.geometry, this.material);
			}
		}
	});
	function A (r, c, p, l){
		Object.defineProperty (this, 'radius', {value: r, writable: true, enumerable: false, configurable: false});
		Object.defineProperty (this, 'color', {value: c, writable: true, enumerable: false, configurable: false});
		this.set();
		this.sphere.matrixAutoUpdate = false;
		this.sphere.layers.set(l);
		p.add(this.sphere);
	}
	A.prototype = baseAster;
	return A;
}();

var Ring = function(){
	var baseRing = Object.defineProperties ({}, {
		innerRadius : { value: 1, writable: true, enumerable: false, configurable: false },
		outerRadius : { value: 1, writable: true, enumerable: false, configurable: false },
		shape       : { value: undefined, writable: true, enumerable: false, configurable: false },
		path        : { value: undefined, writable: true, enumerable: false, configurable: false },
		geometry    : { value: undefined, writable: true, enumerable: false, configurable: true },
		material    : { value: undefined, writable: true, enumerable: false, configurable: true },
		ring        : { value: undefined, writable: true, enumerable: false, configurable: true },
		set         : { writable: false, enumerable: false, configurable: false, value:
			function(i, o){
				this.shape     =  new THREE.Shape().absarc(0, 0, this.outerRadius, 0, Math.PI * 2, false);
				this.path      =  new THREE.Path().absarc(0, 0, this.innerRadius, 0, Math.PI * 2, true);
				this.shape.holes.push(this.path);
				var extrudeSettings = { steps: 2,	depth: 0.1,	bevelEnabled: true,	bevelThickness: 0, bevelSize: 0, bevelOffset: 0, bevelSegments: 0	};
				this.geometry  =  new THREE.ExtrudeGeometry(this.shape, extrudeSettings);
				this.material  =  new THREE.MeshLambertMaterial({ color: 0xf0e691, transparent: true, opacity: 0.5 });
				this.ring      =  new THREE.Mesh(this.geometry, this.material);
				this.ring.rotateX(Math.PI/2);
			}
		}
	});
	function R (i, o, p, l){
		Object.defineProperty (this, 'innerRadius', {value: i, writable: true, enumerable: false, configurable: false});
		Object.defineProperty (this, 'outerRadius', {value: o, writable: true, enumerable: false, configurable: false});
		this.set();
		p.add(this.ring);
		this.ring.layers.set(l);
	}
	R.prototype = baseRing;
	return R;
}();

var angle = 0;

window.onload = function(){

	//WebGl renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.autoClear = false;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	//Scene
  var scene    =  new THREE.Scene();
	var bgScene  =  new THREE.Scene();

	//Background
	var bgTexture   =  new THREE.TextureLoader().load("space.jpg");
	bgScene.background = bgTexture;

  //Camera
  var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.z = 100;
	camera.position.y = 10;

	//Lighting
	var globalLight   =  new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
	var sunLight      =  new THREE.PointLight(0xfceea7, 1.5, 0, 2);
	var sunGlowLight  =  new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
	globalLight.layers.set(2);
	sunLight.layers.set(2);
	sunGlowLight.layers.set(1);
	scene.add(globalLight);
	scene.add(sunLight);
	scene.add(sunGlowLight);

	//Objects
	var sun      =  new Aster(10, "sun.jpg", scene, 1);
	var earth    =  new Aster(3.5, "earth.jpg", sun.sphere, 2);
	var mars     =  new Aster(2.6, "mars.jpg", sun.sphere, 2);
	var jupiter  =  new Aster(4.3, "jupiter.jpg", sun.sphere, 2);
	var moon     =  new Aster(0.9, "moon.jpg", earth.sphere, 2);
	var ganymede =  new Aster(1.2, "ganymede.jpg", jupiter.sphere, 2);
		//Jupiter's Rings
	var ring1    =  new Ring(4.8, 5.8, jupiter.sphere, 2);
	var ring2    =  new Ring(6, 6.5, jupiter.sphere, 2);

  //Animations
  var render_scene= function(){

    var now = Date.now();
    var dt = now - (render_scene.time||now);
    render_scene.time = now;

		//Camera animation
		camera.lookAt(0, 0, 0);
		//per disabilitare il movimento automatico sull'asse delle y e passare al movimento
		//manuale col mouse anche su quell'asse, commentare la riga 129
		if (angle < 1.5){
			camera.position.z = 100 * Math.sin(angle);
		}
		camera.position.y = 30 * Math.sin(angle/2);
		angle += 0.01;
		camera.updateProjectionMatrix();

		//Objects
			//Self rotation
		var earthSRotY    =  new THREE.Matrix4().makeRotationY(-0.001*render_scene.time);
		var earthSRotX    =  new THREE.Matrix4().makeRotationX(0.3);
		var marsSRotY     =  new THREE.Matrix4().makeRotationY(-0.002*render_scene.time);
		var marsSRotX     =  new THREE.Matrix4().makeRotationX(0.2);
		var jupiterSRotY  =  new THREE.Matrix4().makeRotationY(-0.0009*render_scene.time);
		var jupiterSRotX  =  new THREE.Matrix4().makeRotationX(0.6);
		var moonSRot      =  new THREE.Matrix4().makeRotationY(0.003*render_scene.time);
		var ganymedeSRot  =  new THREE.Matrix4().makeRotationY(0.001*render_scene.time);
			//Rotation
		var earthRot      =  new THREE.Matrix4().makeRotationY(0.0003*render_scene.time);
		var marsRot       =  new THREE.Matrix4().makeRotationY(0.0002*render_scene.time);
		var jupiterRot    =  new THREE.Matrix4().makeRotationY(0.0001*render_scene.time);
		var moonRotY      =  new THREE.Matrix4().makeRotationY(0.002*render_scene.time);
		var ganymedeRotY  =  new THREE.Matrix4().makeRotationY(0.002*render_scene.time);
			//Translation
    var earthTras     =  new THREE.Matrix4().makeTranslation(25, 0, 0);
		var marsTras      =  new THREE.Matrix4().makeTranslation(36, 0, 0);
		var jupiterTras   =  new THREE.Matrix4().makeTranslation(52, 0, 0);
		var moonTras      =  new THREE.Matrix4().makeTranslation(5, 3*Math.sin(angle*3), 0);
		var ganymedeTras  =  new THREE.Matrix4().makeTranslation(8, 3*Math.sin(angle*3.5), 0);
			//Transformation
		earth.sphere.matrix     =  earthRot.multiply(earthTras.multiply(earthSRotY)).multiply(earthSRotX);
		mars.sphere.matrix      =  marsRot.multiply(marsTras.multiply(marsSRotY)).multiply(marsSRotX);
		jupiter.sphere.matrix   =  jupiterRot.multiply(jupiterTras.multiply(jupiterSRotY)).multiply(jupiterSRotX);
		moon.sphere.matrix      =  moonRotY.multiply(moonTras.multiply(moonSRot));
		ganymede.sphere.matrix  =  ganymedeRotY.multiply(ganymedeTras.multiply(ganymedeSRot));

		// Render
		controls.update();
    requestAnimationFrame(render_scene);
		renderer.render(bgScene, camera);
		camera.layers.set(1);
		renderer.render(scene, camera);
		camera.layers.set(2);
	  renderer.render(scene, camera);
  }

  render_scene();
}
