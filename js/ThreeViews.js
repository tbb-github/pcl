
import {UIDiv} from '../libs/ui.js'
import * as THREE from 'three';

function ThreeViews(viewsConfig, parent, cube) {
	const container = new UIDiv();
	parent.appendChild(container.dom);
	container.setId('threeViews');
	container.setClass('three-views');
	container.setInnerHTML(`
		<div id="topView" tabindex="-1" class="view-manipulator">
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
		<div id="rightView" tabindex="-1" class="view-manipulator" >
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
		<div id="frontView" tabindex="-1" class="view-manipulator">
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
function updateThreeCameraByView(viewsConfig, {scale}) {
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
function threeCameraLookAtCube(viewsConfig, {position, rotation}) {
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
		initKeydonwListener(type, cube, viewsConfig);//初始化view键盘事件
		initMouseListener(type);//初始化鼠标移入移出事件

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
	

		const svg = document.getElementById(type+"ViewSvg");


		initHandleListener(svg, handleLeft, linesArr, 'edge', {x:-1,y:0}, viewConfig, cube, viewsConfig);//初始化句柄左边界（矩形）监听事件
		initHandleListener(svg, handleRight, linesArr, 'edge', {x:1,y:0}, viewConfig, cube, viewsConfig);//初始化句柄右边界（矩形）监听事件
		initHandleListener(svg, handleTop, linesArr, 'edge', {x:0,y:1}, viewConfig, cube, viewsConfig);//初始化句柄顶部边界（矩形）监听事件
		initHandleListener(svg, handleBottom, linesArr, 'edge', {x:0,y:-1}, viewConfig, cube, viewsConfig);//初始化句柄底部边界（矩形）监听事件
		initHandleListener(svg, handleTopLeft, linesArr, 'edge', {x:-1,y:1}, viewConfig, cube, viewsConfig);//初始化句柄顶部左边角界（矩形）监听事件
		initHandleListener(svg, handleTopRight, linesArr, 'edge', {x:1,y:1}, viewConfig, cube, viewsConfig);//初始化句柄顶部右边角界（矩形）监听事件
		initHandleListener(svg, handleBottomLeft, linesArr, 'edge', {x:1,y:-1}, viewConfig, cube, viewsConfig);//初始化句柄底部左边角界（矩形）监听事件
		initHandleListener(svg, handleBottomRight, linesArr, 'edge', {x:-1,y:-1}, viewConfig, cube, viewsConfig);//初始化句柄底部右边角界（矩形）监听事件
		initHandleListener(svg, handleMove, linesArr, 'move',null, viewConfig, cube, viewsConfig);//初始化句柄移动中心（矩形）监听事件
		initHandleListener(svg, handleDirection, linesArr, 'direction', null, viewConfig, cube, viewsConfig);//初始化句柄方向边界（矩形）监听事件
	
		
	}

}

function initKeydonwListener(type, cube,viewsConfig) {
	const view = document.getElementById(type+"View");
	view.addEventListener('keydown', function(event) {
		onKeyDown(event, type, cube,viewsConfig);
	  });
}
function initMouseListener(type) {
	const view = document.getElementById(type+"View");
	view.onmouseenter = function(){
		view.focus();
	};
	view.onmouseleave = function(){
		view.blur();
	};
}

function initViewWheelListener(viewConfig, type, viewsConfig, cube) {
	const view = document.getElementById(type+"View");
	view.onwheel = function(event) {
		let scale = event.deltaY > 0 ? 1.1 : 0.9;
		viewConfig.zoomRatio *= scale;
		updateThreeCameraByView(viewsConfig, cube);
		updateViewLines(viewsConfig, cube);//更新三视图线段位置
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
		} else {
			viewBoxHeight = view.height * 2/3 / view.zoomRatio;
			viewBoxWidth = viewBoxHeight * boxRatio 
		}
		const viewCenterWidth = view.width/2;
		const viewCenterHeight = view.height/2;
		view.viewBoxWidth = viewBoxWidth;
		view.viewBoxHeight = viewBoxHeight;
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
	handleDirection.setAttribute('x', (left+right)/2-10);//矩阵的左顶点
	handleDirection.setAttribute('y', "0%"); 
	handleDirection.setAttribute('height', Math.max((bottom-top)/2-10+top,0));//-10防止和移动区域重叠
}
function initHandleListener(svg, handle, linesArr, type, direction, viewConfig, cube, viewsConfig) {
	handle.onmouseenter = function(){ highlightLine(linesArr) };    
	handle.onmouseleave = function(){ hideLine(linesArr)};

	handle.onmousedown = function(){
		highlightLine(linesArr);
		handle.onmouseleave = null;
		let startPos = {};
		let endPos = {}
		let viewCenterX = viewConfig.width / 2;
		let viewCenterY = viewConfig.height / 2;
		let theta = 0;
		let ratio = {x:0, y:0};
		svg.onmousedown = function(event) {
			event.stopPropagation();
			startPos.x = event.clientX - (viewCenterX + viewConfig.leftDistance);// - (viewCenterX + viewConfig.leftDistance)
			startPos.y = event.clientY - (viewCenterY + viewConfig.topDistance);
		}
		svg.onmouseup = function(event) {
			// event.stopPropagation();
			svg.onmousemove = null;
			svg.onmouseup=null;
			hideLine(linesArr);
			handle.onmouseenter = function(){ highlightLine(linesArr) };
			handle.onmouseleave = function(){ hideLine(linesArr) } ;
			if (type === 'direction') {
				if (theta !== 0) {
					directionChanged(viewConfig.type, theta,cube);
				}
			} else if (type === 'move') {
				moveChanged(viewConfig.type, ratio, cube);
			} else if (type === 'edge') {
				edgeChanged(viewConfig.type, ratio, cube, direction);
			}
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);//更新三视图线段位置
		}
		svg.onmousemove = function(event) {
			endPos.x = event.clientX  - (viewCenterX + viewConfig.leftDistance);
			endPos.y = event.clientY  - (viewCenterY + viewConfig.topDistance);
			if(type === 'direction') {
				theta = Math.atan2(endPos.y,  endPos.x) - Math.atan2(startPos.y,  startPos.x);
				rotateLines(viewConfig, theta, linesArr);
			} else {
				ratio.x = (endPos.x - startPos.x) / viewConfig.width;// 移动的距离像素/当前视口的宽度像素
				ratio.y = - (endPos.y - startPos.y) / viewConfig.height;// 移动的距离像素/当前视口的高度像素
				moveLines(viewConfig, {
					x:(endPos.x - startPos.x),
					y:(endPos.y - startPos.y)
				},direction);
			}
	
		}
	}
	handle.onmouseup = function() {
		hideLine(linesArr);
		handle.onmouseleave = hideLine;
	};

	
}
function directionChanged(type, theat, cube) {
	console.log(type, cube, 'cube');
	if (type === 'top') {
		cube.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), theat ) ).normalize();
	} else if (type === 'right') {
		cube.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), theat ) ).normalize();
	} else {
		cube.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), -theat ) ).normalize();
	}
	
}
function moveChanged(type, ratio, cube) {
	if (type === 'top') {
		let distanceX = ratio.x* cube.scale.x;
		let distanceY = ratio.y* cube.scale.z;
		translatePosition(distanceX, 'x', cube, type);
		translatePosition(distanceY, 'z', cube, type);
	} else if (type === 'right') {
		let distanceX = ratio.x* cube.scale.z;
		let distanceY = ratio.y* cube.scale.y;
		translatePosition(distanceX, 'z', cube, type);
		translatePosition(distanceY, 'y', cube, type);

	} else if (type === 'front') {
		let distanceX = ratio.x* cube.scale.x;
		let distanceY = ratio.y* cube.scale.y;
		translatePosition(distanceX, 'x', cube, type);
		translatePosition(distanceY, 'y', cube, type);
	}
}
function edgeChanged(type, ratio, cube, direction) {
	if (type === 'top') {
		let distanceX = cube.scale.x*ratio.x*direction.x;
		let distanceY = cube.scale.z*ratio.y*direction.y;
		translatePosition(distanceX/2, 'x', cube, type);
		translatePosition(distanceY/2, 'z', cube, type);
		cube.scale.x += distanceX;
		cube.scale.z += distanceY;
	} else if (type === 'right') {
		let distanceX = cube.scale.z*ratio.x*direction.x;
		let distanceY = cube.scale.y*ratio.y*direction.y;
		translatePosition(distanceX/2, 'z', cube, type);
		translatePosition(distanceY/2, 'y', cube, type);
		cube.scale.z += distanceX;
		cube.scale.y += distanceY;
	} else {
		let distanceX = cube.scale.x*ratio.x*direction.x;
		let distanceY = cube.scale.y*ratio.y*direction.y;
		translatePosition(distanceX/2, 'x', cube, type);
		translatePosition(distanceY/2, 'y', cube, type);
		cube.scale.x += distanceX;
		cube.scale.y += distanceY;
	}
}
function translatePosition(distance, axis, cube) {

	const {quaternion} = cube;
	let direction;
	if(axis === 'z') {
		direction = new THREE.Vector3(0,0,1).applyQuaternion(quaternion).normalize();
	} else if(axis === 'y') {
		direction = new THREE.Vector3(0,1,0).applyQuaternion(quaternion).normalize();
	} else if(axis === 'x') {
		direction = new THREE.Vector3(1,0,0).applyQuaternion(quaternion).normalize();
	}
	cube.position.addScaledVector(direction, distance)
}


// 线段顶点绕视图中心点旋转后的坐标
function rotateLines(viewConfig, angle, linesArr) {
	let viewCenterX = viewConfig.width / 2;
	let viewCenterY = viewConfig.height / 2;
	const rm = new THREE.Matrix4().set(
		Math.cos(angle), -Math.sin(angle), 0, 0,
		Math.sin(angle),  Math.cos(angle), 0, 0,
		0,  0, 1, 0,
		0,  0, 0, 1
	);
	rm.setPosition(viewCenterX,viewCenterY,0);
	handleAfterRotateLinePosition(viewConfig, linesArr, rm);

}
function moveLines(viewConfig,delta, direction) {
	const viewCenterWidth = viewConfig.width/2;
	const viewCenterHeight = viewConfig.height/2;
	let left = (viewCenterWidth - viewConfig.viewBoxWidth/2); 
	let right = (viewCenterWidth + viewConfig.viewBoxWidth/2);
	let top = (viewCenterHeight - viewConfig.viewBoxHeight/2);
	let bottom = (viewCenterHeight + viewConfig.viewBoxHeight/2);
	if (direction) {
		if (direction.x === 1){ //right
			right += delta.x;
		} else if (direction.x === -1){ //left
			left += delta.x;
		}
		if (direction.y === -1){ //bottom
			bottom += delta.y;
		} else if (direction.y === 1){ //top
			top += delta.y;
		}
	} else {
		left += delta.x;
		top += delta.y;
		right += delta.x;
		bottom += delta.y;  
	}
	updateLinePosition(viewConfig, left, right, top, bottom);

}

function handleAfterRotateLinePosition(viewConfig, linesArr, rm) {
	
		// 1. 基于视图原点，物体左边线的两个顶点
		let line = linesArr[0];
		let point1 = new THREE.Vector3(-viewConfig.viewBoxWidth/2, -viewConfig.height/2, 1);
		let point2 = new THREE.Vector3(-viewConfig.viewBoxWidth/2,  viewConfig.height/2, 1);
		setLinePositionByRotate(point1, point2,rm, line,viewConfig);

		// 2. 基于视图原点，物体右边线的两个顶点
		line = linesArr[1];
		point1 = new THREE.Vector3(viewConfig.viewBoxWidth/2, -viewConfig.height/2, 1);
		point2 = new THREE.Vector3(viewConfig.viewBoxWidth/2,  viewConfig.height/2, 1);
		setLinePositionByRotate(point1, point2,rm, line);

		// 3. 基于视图原点，物体顶边线的两个顶点
		line = linesArr[2];
		point1 = new THREE.Vector3(-viewConfig.width/2,  viewConfig.viewBoxHeight/2, 1);
		point2 = new THREE.Vector3(viewConfig.width/2,  viewConfig.viewBoxHeight/2, 1);
		setLinePositionByRotate(point1, point2,rm, line);

		// 4. 基于视图原点，物体底边线的两个顶点
		line = linesArr[3];
		point1 = new THREE.Vector3(-viewConfig.width/2,  -viewConfig.viewBoxHeight/2, 1);
		point2 = new THREE.Vector3(viewConfig.width/2,  -viewConfig.viewBoxHeight/2, 1);
		setLinePositionByRotate(point1, point2,rm, line);

	    // 5. 基于视图原点，物体方向的第二个顶点
		line = linesArr[4];
		point2 = new THREE.Vector3(0,  -viewConfig.height/2, 1);
		let newPoint2 = new THREE.Vector3().copy(point2).applyMatrix4(rm);
		line.setAttribute("x2", newPoint2.x);
		line.setAttribute("y2", newPoint2.y);
	
	
}

function setLinePositionByRotate(point1, point2,rm, line) {
	let newPoint1 = new THREE.Vector3().copy(point1).applyMatrix4(rm);
	let newPoint2 = new THREE.Vector3().copy(point2).applyMatrix4(rm);
	line.setAttribute("x1", newPoint1.x);
	line.setAttribute("y1", newPoint1.y);
	line.setAttribute("x2", newPoint2.x);
	line.setAttribute("y2", newPoint2.y);
}

function highlightLine(linesArr){
	for (let i = 0; i < linesArr.length; i++){
		const line = linesArr[i];
		line.style.stroke="yellow";
	}
}
function hideLine(linesArr){
	for (let i = 0; i < linesArr.length; i++){
		const line = linesArr[i];
		line.style.stroke="#00000000";
	}
}
function onKeyDown(event,type, cube,viewsConfig){

	switch(event.key){
		case 'e':
			event.preventDefault();
			event.stopPropagation();
			directionChanged(type, -0.005, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
		case 'q':
			event.preventDefault();
			event.stopPropagation();
			directionChanged(type, 0.005, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
		case 'w':
		case 'ArrowUp':
			event.preventDefault();
			event.stopPropagation();
			moveChanged(type, {x:0, y:0.01}, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
		case 's':
		case 'ArrowDown':
			event.preventDefault();
			event.stopPropagation();
			moveChanged(type, {x:0, y:-0.01}, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
		case 'a':
		case 'ArrowLeft':
			moveChanged(type, {x:-0.01, y:0}, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
		case 'd':
		case 'ArrowRight':
			event.preventDefault();
			event.stopPropagation();
			moveChanged(type, {x:0.01, y:0}, cube);
			threeCameraLookAtCube(viewsConfig, cube);
			updateThreeCameraByView(viewsConfig, cube);
			updateViewLines(viewsConfig, cube);
			break;
	}
}
export {ThreeViews}