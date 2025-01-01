
import { Octree } from './Octree.js';
import {OctreeLoader} from './Octree.Loader.js'
import {BinaryHeap} from './utils/binary-heap.js'
export class QueueItem 
{
	constructor(pointCloudIndex, weight, node, parent) {
        this.pointCloudIndex = pointCloudIndex;
        this.weight = weight
        this.node = node;
        this.parent = parent;
    }
}

export class LodTree {
    async loadPointCloud(url, getUrl) {
        if (url === 'metadata.json') {
            const loader = new OctreeLoader();
            const trueUrl = getUrl(url);
            console.log(url, trueUrl, 'trueUrltrueUrl');
            const {geometry} = await loader.load(trueUrl);
            return new Octree(geometry);
        }
    }

    updateVisibility(pointClouds, camera) {
        const {frustums, cameraPositions, priorityQueue} = this.updateVisibilityStructures(
			pointClouds,
			camera,
		);
        let queueItem;
        while((queueItem = priorityQueue.pop()) !== undefined) 
        {
            if (!frustums[pointCloudIndex].intersectsBox(node.boundingBox))
            {
                continue;
            }
            let node = queueItem.node;
			const pointCloudIndex = queueItem.pointCloudIndex;
			const pointCloud = pointClouds[pointCloudIndex];
        }
    }

    updateVisibilityStructures(pointClouds, camera) {
        const priorityQueue = new BinaryHeap((x) => {return 1 / x.weight;});
        const frustums = [];
        for (let i = 0; i < pointClouds.length; i++) {
            let pointCloud = pointClouds[i];
            let frustum = new THREE.Frustum();
            let pvMatrix = new Matrix4();
            // 更新相机的世界矩阵
            camera.updateMatrixWorld(true);
            // 更新投影矩阵
            camera.updateProjectionMatrix();
            pvMatrix.multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
            )//将相机的投影矩阵和相机的世界坐标系的逆矩阵合一下，合一个投影视图矩阵
            frustum.setFromMatrix(pvMatrix);
            if (pointCloud.visible && pointCloud.root !== null) 
            {
                const weight = Number.MAX_VALUE;
                priorityQueue.push(new QueueItem(i, weight, pointCloud.root));
            }
        }
        return {frustums: frustums, priorityQueue: priorityQueue};

    }
}