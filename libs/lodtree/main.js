import {LodTree} from './src/LodTree.js';
import * as THREE from './library/three.module.js'
import { OrbitControls } from './library/OrbitControls.js';
document.body.onload = async function () {

    const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

	const canvas = document.createElement('canvas');
	canvas.style.position = 'absolute';
	canvas.style.top = '0px';
	canvas.style.left = '0px';
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	document.body.appendChild(canvas);
	const controls = new OrbitControls(camera, canvas);
	camera.position.z = 10;
	const renderer = new THREE.WebGLRenderer(
		{
			canvas: canvas,
			alpha: true,
			logarithmicDepthBuffer: false,
			precision: 'highp',
			premultipliedAlpha: true,
			antialias: true,
			preserveDrawingBuffer: false,
			powerPreference: 'high-performance'
	});
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    const loadTree = new LodTree();
    let pointClouds = [];
    let baseUrl = '../public/pump';
    let url = 'metadata.json';
    let pco = await loadTree.loadPointCloud(url, ()=>{return `${baseUrl}/${url}`});
    pointClouds.push(pco);
    function loop()
	{
		loadTree.updatePointClouds(pointClouds, camera, renderer);
		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(loop);
	}
	loop();
}
