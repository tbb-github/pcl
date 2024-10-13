
import {UIDiv} from '../libs/ui.js'
import * as THREE from 'three';

function ThreeViews(viewsConfig, renderer, parent, cube) {
	const container = new UIDiv();
	parent.appendChild(container.dom);
	container.setId('threeViews');
	container.setClass('three-views');
	container.setInnerHTML(`
		<div id="topView">
			<svg id="topViewSvg"  xmlns="http://www.w3.org/2000/svg">
				<line class="svg-line" id="topLineLeft"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="topLineLeftHandle"/>
				<line class="svg-line"  id="topLineRight"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="topLineRightHandle"/>
				<line class="svg-line"  id="topLineTop"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="topLineTopHandle"/>
				<line class="svg-line"  id="topLineBottom"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="topLineBottomHandle"/>
				<line class="svg-line" id="topLineDirection"></line>
				<rect width="20" height="70"  class="line-handle  ew-handle" id="topDirectionHandle"/>
				<rect width="20" height="20"  class="line-handle  nw-handle" id="topLineTLHandle"/>
				<rect width="20" height="20"  class="line-handle  ne-handle" id="topLineTRHandle"/>
				<rect width="20" height="20"  class="line-handle  sw-handle" id="topLineBLHandle"/>
				<rect width="20" height="20"  class="line-handle  se-handle" id="topLineBRHandle"/>
				<rect width="40" height="40"  class="line-handle grab-handle" id="topLineMoveHandle"/>
			</svg>
			

		</div>
		<div id="rightView">
			<svg id="rightViewSvg" xmlns="http://www.w3.org/2000/svg">
				<line class="svg-line" id="rightLineLeft"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="rightLineLeftHandle"/>
				<line class="svg-line"  id="rightLineRight"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="rightLineRightHandle"/>
				<line class="svg-line"  id="rightLineTop"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="rightLineTopHandle"/>
				<line class="svg-line"  id="rightLineBottom"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="rightLineBottomHandle"/>
				<line class="svg-line" id="rightLineDirection"></line>
				<rect width="20" height="70"  class="line-handle  ew-handle" id="rightDirectionHandle"/>
				<rect width="20" height="20"  class="line-handle  nw-handle" id="rightLineTLHandle"/>
				<rect width="20" height="20"  class="line-handle  ne-handle" id="rightLineTRHandle"/>
				<rect width="20" height="20"  class="line-handle  sw-handle" id="rightLineBLHandle"/>
				<rect width="20" height="20"  class="line-handle  se-handle" id="rightLineBRHandle"/>
				<rect width="40" height="40"  class="line-handle grab-handle" id="rightLineMoveHandle"/>
			</svg>
		</div>
		<div id="frontView">
			<svg id="frontViewSvg" xmlns="http://www.w3.org/2000/svg">
			    <line class="svg-line" id="frontLineLeft"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="frontLineLeftHandle"/>
				<line class="svg-line"  id="frontLineRight"></line>
				<rect width="20" height="140" class="line-handle ew-handle" id="frontLineRightHandle"/>
				<line class="svg-line"  id="frontLineTop"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="frontLineTopHandle"/>
				<line class="svg-line"  id="frontLineBottom"></line>
				<rect width="140" height="20"  class="line-handle ns-handle" id="frontLineBottomHandle"/>
				<line class="svg-line" id="frontLineDirection"></line>
				<rect width="20" height="70"  class="line-handle  ew-handle" id="frontDirectionHandle"/>
				<rect width="20" height="20"  class="line-handle  nw-handle" id="frontLineTLHandle"/>
				<rect width="20" height="20"  class="line-handle  ne-handle" id="frontLineTRHandle"/>
				<rect width="20" height="20"  class="line-handle  sw-handle" id="frontLineBLHandle"/>
				<rect width="20" height="20"  class="line-handle  se-handle" id="frontLineBRHandle"/>
				<rect width="40" height="40"  class="line-handle grab-handle" id="frontLineMoveHandle"/>
			</svg>
		</div>
	`)
	initThreeCamera(viewsConfig);//初始化三视图的宽高
	threeCameraLookAtCube(viewsConfig, cube);//三视图相机看向cube物体
	updateThreeCameraByView(viewsConfig, cube);//改变相机宽高比保持和三视图视口一致
	initViewsEventListener(viewsConfig, cube)// 初始化三视图监听事件
	updateViewLines(viewsConfig, cube);//更新三视图线段位置
	return container;
}
/**
 * 
 * @param {*} param0 
 */
function initThreeCamera(viewsConfig) {
	for (let i = 0; i < viewsConfig.length; i++) {
		const view = viewsConfig[i];
		const viewBox = document.getElementById(view.type+'View');
		viewBox.setAttribute('style', 'width:'+view.width+"px;"+"height:"+view.height+"px");
		viewBox.setAttribute('style', 'width:'+view.width+"px;"+"height:"+view.height+"px");
		const svg = document.getElementById(view.type+'ViewSvg');
		svg.setAttribute('width', view.width);
		svg.setAttribute('height', view.height);
	}
}
/**
 * 
 * @param {*} param0 
 */
function updateThreeCameraByView(viewsConfig, {scale, rotation, position}) {
	let boxRatio;
	for (let i = 0; i < viewsConfig.length; i++) {
		const view = viewsConfig[i];
		const type = view.type;
		let cameraHeight, cameraWidth, cameraDepth;
		if (type === "top") {
			cameraWidth = scale.x *1.5 * view.zoomRatio;
			cameraHeight = scale.z *1.5 * view.zoomRatio;
			boxRatio = scale.x/scale.z; 
			cameraDepth = scale.y;
		}
		if (type === "right") {
			cameraWidth = scale.z *1.5 * view.zoomRatio;
			cameraHeight = scale.y *1.5 * view.zoomRatio;
			boxRatio = scale.z/scale.y; 
			cameraDepth = scale.x;
		}
		if (type === "front") {
			cameraWidth = scale.x *1.5 * view.zoomRatio;
			cameraHeight = scale.y *1.5 * view.zoomRatio;
			boxRatio = scale.x/scale.y; 
			cameraDepth = scale.z;
		}
		if (cameraWidth/cameraHeight > view.aspect) {
			cameraHeight = cameraWidth /view.aspect;
		} else {
			cameraWidth = cameraHeight * view.aspect;
		}
		view.camera.top = cameraHeight/2;
		view.camera.bottom = -cameraHeight/2;
		view.camera.right = cameraWidth/2;
		view.camera.left = -cameraWidth/2;
		view.camera.near = -cameraDepth/2;
		view.camera.far = cameraDepth/2;
		view.camera.updateProjectionMatrix();
		view.camera.updateMatrix(true);
	}
}

/**
 * 
 * @param {*} param0 
 */
function threeCameraLookAtCube(viewsConfig, {position, rotation, scale}) {

	const cameraTop = viewsConfig[0].camera;
	cameraTop.position.set(position.x, position.y, position.z);
	cameraTop.rotation.set(rotation.x, rotation.y, rotation.z);
	cameraTop.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/2 ) ).normalize();
	cameraTop.updateProjectionMatrix();
	cameraTop.updateMatrix(true);

	const cameraSide = viewsConfig[1].camera;
	cameraSide.position.set(position.x, position.y, position.z);
	cameraSide.rotation.set(rotation.x, rotation.y, rotation.z);
	cameraSide.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI/2 ) ).normalize();
	cameraSide.updateProjectionMatrix();
	cameraSide.updateMatrix(true);

	const cameraFront = viewsConfig[2].camera;
	cameraFront.position.set(position.x, position.y, position.z);
	cameraFront.rotation.set(rotation.x, rotation.y, rotation.z );
	cameraFront.updateProjectionMatrix();
	cameraFront.updateMatrix(true);
}

function initViewsEventListener(viewsConfig,cube) {
	for (let i = 0; i < viewsConfig.length; i++) {


		const viewConfig = viewsConfig[i];
		const type = viewConfig.type;
		initViewWheelListener(viewConfig, type, viewsConfig, cube);//初始化view鼠标缩放事件



		const lineLeft = document.getElementById(type+'LineLeft');
		const lineRight = document.getElementById(type+'LineRight');
		const lineTop = document.getElementById(type+'LineTop');
		const lineBottom = document.getElementById(type+'LineBottom');
		const lineDirection = document.getElementById(type+'LineDirection');
		const linesArr = [lineLeft, lineRight, lineTop, lineBottom, lineDirection];
	
		const handleLeft = document.getElementById(type+'LineLeftHandle');
		const handleRight = document.getElementById(type+'LineRightHandle');
		const handleTop = document.getElementById(type+'LineTopHandle');
		const handleBottom = document.getElementById(type+'LineBottomHandle');
		const handleTopLeft = document.getElementById(type+'LineTLHandle');
		const handleTopRight = document.getElementById(type+'LineTRHandle');
		const handleBottomLeft = document.getElementById(type+'LineBLHandle');
		const handleBottomRight = document.getElementById(type+'LineBRHandle');
		const handleMove = document.getElementById(type+'LineMoveHandle');
		const handleDirection = document.getElementById(type+'DirectionHandle');
	
		initHandleListener(handleLeft, linesArr, 'edge');//初始化句柄左边界（矩形）监听事件
		initHandleListener(handleRight, linesArr, 'edge');//初始化句柄右边界（矩形）监听事件
		initHandleListener(handleTop, linesArr, 'edge');//初始化句柄顶部边界（矩形）监听事件
		initHandleListener(handleBottom, linesArr, 'edge');//初始化句柄底部边界（矩形）监听事件
		initHandleListener(handleTopLeft, linesArr, 'edge');//初始化句柄顶部左边角界（矩形）监听事件
		initHandleListener(handleTopRight, linesArr, 'edge');//初始化句柄顶部右边角界（矩形）监听事件
		initHandleListener(handleBottomLeft, linesArr, 'edge');//初始化句柄底部左边角界（矩形）监听事件
		initHandleListener(handleBottomRight, linesArr, 'edge');//初始化句柄底部右边角界（矩形）监听事件
		initHandleListener(handleMove, linesArr, 'move');//初始化句柄移动中心（矩形）监听事件
		initHandleListener(handleDirection, linesArr, 'direction');//初始化句柄方向边界（矩形）监听事件
        // installHanler(handle.move, null , 'move');

		// let startPos = {};
		// let endPos = {};
		// view.addEventListener('mousedown', (event)=>{
		// 	event.stopPropagation();
		// 	startPos.x = event.clientX;
		// 	startPos.y = event.clientY;
		// 	console.log(startPos, 'startPos');
		// 	highlightLine(type, linesArr);
		// })
		// view.addEventListener('mouseup', (event)=>{
		// 	event.stopPropagation();
		// 	endPos.x = event.clientX;
		// 	endPos.y = event.clientY;
		// 	let deltaX = endPos.x - startPos.x;
		// 	let deltaY = endPos.y - startPos.y;
		// 	let angle = Math.atan2(deltaY, deltaX);
		// 	if(type === 'top') {
		// 		cube.rotation.y += angle
		// 	} else if(type === 'right') {
		// 		cube.rotation.x += angle
		// 	} else {
		// 		cube.rotation.z += angle
		// 	}
		// 	updateCamera(cube)
		// 	renderViews.forEach(v=>{
		// 		updateViewBySize(v, cube);
		// 	})
		
		// 	console.log(event, deltaY, deltaX, angle,'angle');
		// 	// hideLine(type, linesArr);
		// })
		// lineDirection.addEventListener('mousedown', (event)=>{
	
		// 	event.stopPropagation();
		// 	highlightLine(type, linesArr);
		// })

		// view.addEventListener('mouseenter', ()=>{highlightLine(type, linesArr)});
		// view.addEventListener('mouseleave', ()=>{hideLine(type, linesArr)});
		// initLineEventListener(type, 'LineDirection')
	}

}

function initViewWheelListener(viewConfig, type, viewsConfig, cube) {
	const view = document.getElementById(type+"View");
	view.onwheel = function(event) {
		let scale = event.deltaY > 0 ? 1.1 : 0.9;
		viewConfig.zoomRatio *= scale;
		updateThreeCameraByView(viewsConfig, cube);
		// updateViewLines(viewConfig, boxScale);
	}
}

function updateViewLines(viewsConfig, {scale}) {
	for (let i = 0; i < viewsConfig.length; i++) {
		let view = viewsConfig[i]
		const type = view.type;
		let boxRatio;
		if (type === 'top') {
			boxRatio = scale.x/scale.z;//x表示长 y表示宽 z表示高
		}
		if (type === 'right') {
			boxRatio = scale.z/scale.y;//x表示长 y表示宽 z表示高
		}
		if (type === 'front') {
			boxRatio = scale.x/scale.y;//x表示长 y表示宽 z表示高
		}
		let viewBoxWidth,viewBoxHeight;//view盒子中的box物体的宽高
		if(boxRatio > view.aspect)
		{
			viewBoxWidth = view.width * 2/3 / view.zoomRatio;
			viewBoxHeight = viewBoxWidth/boxRatio;
			console.log(view.width, view.zoomRatio, viewBoxWidth, viewBoxHeight, 'aaaaa');
		} else {
			viewBoxHeight = view.height * 2/3 / view.zoomRatio;
			viewBoxWidth = viewBoxHeight * boxRatio 
			console.log(scale, boxRatio, view, view.zoomRatio, view.height, viewBoxWidth, viewBoxHeight, 'bbb');
		}
		const viewCenterWidth = view.width/2;
		const viewCenterHeight = view.height/2;
		// 基于左上角顶点(0,0)
		const left = (viewCenterWidth - viewBoxWidth/2); //纯数字就是绝对值像素，或者带%的相对值
		const right = (viewCenterWidth + viewBoxWidth/2);
		const top = (viewCenterHeight - viewBoxHeight/2);
		const bottom = (viewCenterHeight + viewBoxHeight/2);
		updateLinePosition(view, left, right, top, bottom);
		updateHandlePosition(view, left, right, top, bottom);
	}

}

function updateLinePosition(view, left, right, top, bottom) {
	const lineLeft = document.getElementById(view.type+'LineLeft');
	lineLeft.setAttribute('x1', left);
	lineLeft.setAttribute('y1', '0%');//top
	lineLeft.setAttribute('x2', left);
	lineLeft.setAttribute('y2', '100%');//bottom

	const lineRight = document.getElementById(view.type+'LineRight');
	lineRight.setAttribute('x1', right);
	lineRight.setAttribute('y1', '0%');//top
	lineRight.setAttribute('x2', right);
	lineRight.setAttribute('y2', '100%');//bottom

	const lineTop = document.getElementById(view.type+'LineTop');
	lineTop.setAttribute('x1', '0%');//left
	lineTop.setAttribute('y1', top);
	lineTop.setAttribute('x2', '100%');//right
	lineTop.setAttribute('y2', top);

	const lineBottom = document.getElementById(view.type+'LineBottom');
	lineBottom.setAttribute('x1', '0%');//left
	lineBottom.setAttribute('y1', bottom );
	lineBottom.setAttribute('x2', '100%');//right
	lineBottom.setAttribute('y2', bottom);

	const lineDirection = document.getElementById(view.type+'LineDirection');
	
	lineDirection.setAttribute('x1', (left+right)/2);
	lineDirection.setAttribute('y1', (top+bottom)/2);
	lineDirection.setAttribute('x2', (left+right)/2);
	lineDirection.setAttribute('y2', '0%');
}

function updateHandlePosition(view, left, right, top, bottom) {
	const handleLeft = document.getElementById(view.type+'LineLeftHandle');
	handleLeft.setAttribute('x', left-10);
	handleLeft.setAttribute('y', "0%"); 
	handleLeft.setAttribute('height', "100%");
	handleLeft.setAttribute('width', 20);

	const handleRight = document.getElementById(view.type+'LineRightHandle');
	handleRight.setAttribute('x', right-10);
	handleRight.setAttribute('y', "0%");
	handleRight.setAttribute('height', "100%");
	handleRight.setAttribute('width', 20);
	
	const handleTop = document.getElementById(view.type+'LineTopHandle');
	handleTop.setAttribute('x', "0%");
	handleTop.setAttribute('y', top-10);
	handleTop.setAttribute('width', "100%");
	handleTop.setAttribute('height', 20);

	const handleBottom = document.getElementById(view.type+'LineBottomHandle');
	handleBottom.setAttribute('x', "0%");
	handleBottom.setAttribute('y', bottom-10);
	handleBottom.setAttribute('width', "100%");
	handleBottom.setAttribute('height', 20);


	const handleTopLeft = document.getElementById(view.type+'LineTLHandle');
	handleTopLeft.setAttribute('x', left-10);
	handleTopLeft.setAttribute('y', top-10);


	const handleTopRight = document.getElementById(view.type+'LineTRHandle');
	handleTopRight.setAttribute('x', right-10);
	handleTopRight.setAttribute('y', top-10);


	const handleBottomLeft = document.getElementById(view.type+'LineBLHandle');
	handleBottomLeft.setAttribute('x', left-10);
	handleBottomLeft.setAttribute('y', bottom-10);

	const handleBottomRight = document.getElementById(view.type+'LineBRHandle');
	handleBottomRight.setAttribute('x', right-10);
	handleBottomRight.setAttribute('y', bottom-10);

	// move handle
	const handleMove = document.getElementById(view.type+'LineMoveHandle');
	handleMove.setAttribute('x', (left+right)/2-20);
	handleMove.setAttribute('y', (top+bottom)/2-20);


	
	const handleDirection = document.getElementById(view.type+'DirectionHandle');
	handleDirection.setAttribute('x', (left+right)/2-10);
	handleDirection.setAttribute('y', "0%"); 
	handleDirection.setAttribute('height', Math.max((bottom-top)/2-10+top,0));//-10防止和移动区域重叠
}
function initHandleListener(handle, lineArr) {
	handle.onmouseenter = function(){ highlightLine(lineArr) };    
	handle.onmouseleave = function(){ hideLine(lineArr)};
	handle.onmousedown = function(event){
		event.stopPropagation();
		highlightLine(lineArr);
		handle.onmouseleave = null;
	}
}

function highlightLine(lineArr){
	for (let i = 0; i < lineArr.length; i++){
		const line = lineArr[i];
		line.style.stroke="yellow";
	}
}
function hideLine(lineArr){
	for (let i = 0; i < lineArr.length; i++){
		const line = lineArr[i];
		line.style.stroke="#00000000";
	}
}

export {ThreeViews}