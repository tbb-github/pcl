
import { Octree } from './Octree.js';
import {OctreeLoader} from './Octree.Loader.js'
import {BinaryHeap} from './utils/binary-heap.js'
import * as THREE from '../library/three.module.js'
export class QueueItem 
{
	constructor(pointCloudIndex, weight, node, parent) {
        this.pointCloudIndex = pointCloudIndex;
        this.weight = weight
        this.node = node;
        this.parent = parent;

    }
}
const cameraMatrix = new THREE.Matrix4();
const cameraPosition = new THREE.Vector3();
const inverseWorldMatrix = new THREE.Matrix4();
const MAX_LOADS_TO_GPU = 2;
export class LodTree {
    constructor() {
        this.maxNumNodesLoading = 4;
        this._rendererSize = new THREE.Vector2();
        this.minNodePixelSize = 50;
    }
    async loadPointCloud(url, getUrl) {
        if (url === 'metadata.json') {
            const loader = new OctreeLoader();
            const trueUrl = getUrl(url);
            const {geometry} = await loader.load(trueUrl);
            return new Octree(geometry);
        }
    }

    updateVisibility(pointClouds, camera, renderer) {
        const {frustums, priorityQueue} = this.updateVisibilityStructures(
			pointClouds,
			camera,
		);
        // 从此循环都从r根节点开始

        // console.log(priorityQueue.pop(), 'priorityQueue');
        let queueItem;
        let nodesToLoad = [];
		let loadedToGPUThisFrame = 0;
        while((queueItem = priorityQueue.pop()) !== undefined) 
        {
      
    
            let node = queueItem.node;
            console.log(node.name, 'nodenodenodenodenodenodenodenodenodenodenodenodenodenode');
            const parentNode = queueItem.parent;
 
			const pointCloudIndex = queueItem.pointCloudIndex;
			const pointCloud = pointClouds[pointCloudIndex];
            if (node.isGeometryNode && (!parentNode || parentNode.isTreePoints)) {
                if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU ) {
                    loadedToGPUThisFrame++;
                    pointCloud.toTreePoints(node, parentNode);
                    console.log(node.name +'>>>loaded----');
                    
                } else if (!node.failed) 
                {
                    nodesToLoad.push(node);
                    console.log(node.name +'>>>ToLoad----');
                }
            }

            // getSize ( target : Vector2 ) : Vector2  
            // target — the result will be copied into this Vector2.
			const halfHeight = 0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio();
            // renderer.getPixelRatio(): 这个方法调用获取渲染器的像素比例。像素比例是用来处理高分辨率（Retina）显示设备的，确保在高DPI屏幕上渲染的图像看起来不会模糊或像素化。例如，在Retina屏幕上，像素比例可能是2，这意味着每个逻辑像素实际上由屏幕上的4个物理像素表示（2x2）。
            pointCloud.updateMatrixWorld(true);
            camera.updateMatrixWorld(true);
            // 相机的位置（相对于物体的局部空间）
            const worldMatrix = pointCloud.matrixWorld;
            inverseWorldMatrix.copy(worldMatrix).invert();
            cameraMatrix
                .identity()
                .multiply(inverseWorldMatrix)
                .multiply(camera.matrixWorld);
            cameraPosition.setFromMatrixPosition(cameraMatrix)
            // console.log(priorityQueue, 'priorityQueue');
            // 从根节点开始，找子节点
            this.updateChildVisibility(
                node,
                camera,
				queueItem,
				priorityQueue,
                halfHeight,
                cameraPosition
			);
        
            
        }
        // console.log(nodesToLoad, 'nodesToLoad');
        const numNodesToLoad = Math.min(this.maxNumNodesLoading, nodesToLoad.length);
		for (let i = 0; i < numNodesToLoad; i++) 
		{
            console.log(nodesToLoad[i].name +'>>>发起加载请求');
			nodesToLoad[i].load();
		}

    }

    updateChildVisibility(node, camera, queueItem, priorityQueue, halfHeight, cameraPosition) {
        const children = node.children;
		for (let i = 0; i < children.length; i++) 
		{
			const child = children[i];
			if (child == null) 
			{
				continue;
			}
            const sphere = child.boundingSphere;
            
			const distance = sphere.center.distanceTo(cameraPosition);
            // boundingBox min max 都减了min 所以cameraPosition要乘pointCloud.matrixWorld(min)
            // 物体（例如球体 sphere）的属性（如中心点 sphere.center）通常是在物体的局部坐标系中定义的。
            // 如果直接使用原生相机位置（世界空间中的位置），你需要先将物体的局部坐标转换到世界空间，或者将相机的世界坐标转换到物体的局部空间。
			const radius = sphere.radius;//点云半径


            let projectionFactor = 0.0;
            /*
            //视线长度：相机视点到目标点的距离
            const sightLen = position.clone().sub(target).length()
            //视椎体垂直夹角的一半(弧度)
            const halfFov = fov * Math.PI / 360
            //目标平面的高度
            const targetHeight = sightLen * Math.tan(halfFov) * 2
            //目标平面与画布的高度比
            const ratio = targetHeight / clientHeight
            */
			if (camera.type === 'PerspectiveCamera') 
			{
				const perspective = camera;
				const fov = perspective.fov * Math.PI / 180.0;
				const slope = Math.tan(fov / 2.0);
                // 3D世界中的实际高度 h/distance = slope(Math.tan(fov / 2.0) => h = slope*distance
				projectionFactor = halfHeight / (slope * distance);
                // 使用视口的一半高度、斜率和距离来计算投影因子
                // 物体在屏幕上占据的像素高度(视口的一半高度)与其3D世界中的实际高度(半个点云高度， 视线内能看完整点云)之间的比例。
			}
			else 
			{
                // 对于正交相机，由于投影是平行的，物体的大小在屏幕上不随距离变化。因此，projectionFactor 的计算相对简单。
				const orthographic = camera;
				projectionFactor = 2 * halfHeight / (orthographic.top - orthographic.bottom);
                // 使用视口的一半高度和相机的垂直尺寸（orthographic.top - orthographic.bottom）来计算投影因子。这个因子表示了物体在屏幕上占据的像素高度与其3D世界中的实际高度之间的固定比例。
			}

            // projectionFactor = 物体在屏幕上占据的像素高度(视口的一半高度)/点云半个高度(点云半径)
            const screenPixelRadius = radius * projectionFactor;

            // 判断是否渲染该节点：
			// 如果球体的屏幕像素半径小于预设的最小节点像素大小（pointCloud.minNodePixelSize），则不添加该节点进行渲染，以节省资源。
			if (screenPixelRadius < this.minNodePixelSize) 
			{
				continue;
			}
            // 确定渲染优先级：
            // 对于大于最小像素大小的节点，根据它们的屏幕像素半径和距离来确定渲染的优先级。
            // 如果目标(node节点)距离相机小于其半径（即目标部分或全部在相机视锥体内），则给其一个非常高的优先级（Number.MAX_VALUE），可能意味着这些目标(node节点)会优先被加载或渲染。
            // 对于其他节点，使用屏幕像素半径加上距离的倒数作为权重，屏幕像素 半径越大 或 距离越近 ，权重越大，从而有更高的渲染优先级。

			// Nodes which are larger will have priority in loading/displaying.
			const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;

            
            priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
            console.log(weight, child.name, 'childchildchild');
        }
    }

    updateTreeNodeVisibility(node) {
        const sceneNode = node.sceneNode;
		sceneNode.visible = true;
		sceneNode.material = pointCloud.material;
		sceneNode.updateMatrix();
		sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);

		visibleNodes.push(node);
		pointCloud.visibleNodes.push(node);
    }

    updateVisibilityStructures(pointClouds, camera) {
        // 因为pop是返回最低得分，所以这里的用1/weight
        const priorityQueue = new BinaryHeap((x) => {return 1 / x.weight;});
        const frustums = [];
        for (let i = 0; i < pointClouds.length; i++) {
            let pointCloud = pointClouds[i];
            let frustum = new THREE.Frustum();
            let pvMatrix = new THREE.Matrix4();
            // 更新相机的世界矩阵
            camera.updateMatrixWorld(true);
            // 更新投影矩阵
            camera.updateProjectionMatrix();
            pvMatrix.multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
            )//将相机的投影矩阵和相机的世界坐标系的逆矩阵合一下，合一个投影视图矩阵
            frustum.setFromProjectionMatrix(pvMatrix);
            
            if (pointCloud.visible && pointCloud.root !== null) 
            {
                const weight = Number.MAX_VALUE;
                priorityQueue.push(new QueueItem(i, weight, pointCloud.geometry.root));
            }
        }
        return {frustums: frustums, priorityQueue: priorityQueue};

    }
    updatePointClouds(pointClouds, camera, renderer) {
        this.updateVisibility(pointClouds, camera, renderer);
    }
}