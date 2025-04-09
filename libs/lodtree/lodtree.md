## 1.按需加载实现原理

> 开始
```
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
```
### 1.1 loadPointCloud

请求hierarchy.bin文件，构建八叉树，为后面加载根据八叉树关系加载点云octree.bin准备
```
buildOctree(node, buffer) {
    let dataView = new DataView(buffer);
    let bytesPerNode = 22;//每个节点上的字节数;
    let nodesNum = buffer.byteLength/ bytesPerNode;//节点数量
    let nodes = new Array(nodesNum);
    nodes[0] = node;//第一个根节点
    let nodePos = 1;//从1开始，因为ndoes从索引为1开始的地方存根节点的子节点
    let octree = node.octreeGeometry;
    for (let i = 0; i < nodesNum; i++) {
        let current = nodes[i];
        let type = dataView.getUint8(i*bytesPerNode + 0);//1字节 8位
        let childMask = dataView.getUint8(i*bytesPerNode + 1);//1字节
        let numPoints = dataView.getUint32(i*bytesPerNode + 2, true);//4字节
        let byteOffset = dataView.getBigInt64(i*bytesPerNode + 6, true);//8字节
        let byteSize = dataView.getBigInt64(i*bytesPerNode + 14, true);//8字节
        if (current.nodeType === 2) {
            // 表示是从外面传入的根节点，对根节点的byteOffset,byteSize赋值
            current.byteOffset = byteOffset;
            current.byteSize = byteSize;
            current.numPoints = numPoints;
        } else if (type === 2) {
            // 表示buffer里面的这个节点是 hierarchy层级节点
            current.hierarchyByteOffset = byteOffset;
            current.hierarchyByteSize = byteSize;
            current.numPoints =numPoints;
        } else {
            current.byteOffset = byteOffset;
            current.byteSize = byteSize;
            current.numPoints = numPoints;
        }
        current.nodeType = type;//每一个节点(包括穿进来的node)的nodeType 等于buff中的每一个节点里的type
        if (type === 2) {
            continue;// 如果节点是2，不需要下面的步骤，跳到buffer里面的下一个node
        }
        for (let childIndex = 0; childIndex < 8; childIndex++) {
            let indexMask = 1 << childIndex;//这个操作的含义是将数字1的二进制表示向左移动childIndex位。
            // 如果childIndex是0，那么1 << childIndex的结果是0001（十进制中的1）。
            // 如果childIndex是1，结果是0000 0010（十进制中的2）。
            // 如果childIndex是2，结果是0000 0100（十进制中的4）。
            // 如果childIndex是3，结果是0000 1000（十进制中的8）。
            let childExists = (childMask & indexMask) !== 0;
            // 检查childMask的第childIndex位是否为1，如果是，则返回false，表示该子节点不存在；如果不是，则返回true，表示该子节点存在。
            if (!childExists) {
                continue;
            }
            // 对当前节点生成子节点
            // 根据r根节点, 生成0后的8个子节点(r0,r1,---r7)(也不一定有8个取决于r的子网掩码),push到nodes中
            // 取nodes第1个元素节点，即r根节点的第一个子节点r0, 生成r0等后的8个子节点r0*(也不一定有8个取决于r的子网掩码),push到nodes中
            // 取nodes第2个元素节点，即r根节点的第一个子节点r1, 生成r1等后的8个子节点r1*(也不一定有8个取决于r的子网掩码),push到nodes中                          
            // 取nodes第3个元素节点，即r根节点的第一个子节点r2, 生成r2等后的8个子节点r2*(也不一定有8个取决于r的子网掩码),push到nodes中 
            //  ...
            // 取nodes第8个元素节点，即r根节点的第一个子节点r7, 生成r7等后的8个子节点r7*(也不一定有8个取决于r的子网掩码),push到nodes中                            
            // 取nodes第9个元素节点， 即r根节点的第一个子节点r0的子节点的第一个r01,生成r0等后的8个子节点r01*(也不一定有8个取决于r的子网掩码),push到nodes中                              
            // ...
            let childName = current.name + childIndex;
            let childBox = this.createChildAABB(current.boundingBox, childIndex);
            let childOctreeNode = new OctreeGeometryNode(childName, octree, childBox);
            childOctreeNode.spacing = current.spacing / 2;
            childOctreeNode.level = current.level + 1;
            childOctreeNode.parent = current;
            current.children[childIndex] = childOctreeNode;
            nodes[nodePos] = childOctreeNode;
            nodePos++;
        }
        
    }
```


### 1.2 updatePointClouds
```
updatePointClouds(pointClouds, camera, renderer) {
    this.updateVisibility(pointClouds, camera, renderer);
}
```



‌二叉堆是一种特殊的二叉树结构，主要用于实现高效的优先队列‌。二叉堆可以分为大根堆和小根堆，其中大根堆的父节点的值总是大于或等于其子节点的值，而小根堆则相反。二叉堆的主要作用包括：

‌实现优先队列‌：二叉堆可以高效地支持插入和删除操作，这使得它成为实现优先队列的理想数据结构。插入操作的时间复杂度为O(log n)，删除操作（取出根节点并重新调整堆）的时间复杂度也为O(log n)，从而保证了优先队列的高效性‌


‌排序‌：二叉堆可以用于排序算法中，特别是堆排序。堆排序是一种利用堆结构进行排序的算法，其时间复杂度为O(n log n)，且不需要额外的存储空间，适合大规模数据的排序‌

```
    updateVisibilityStructures(pointClouds, camera) {
        // 因为pop是返回最低得分，所以这里的用1/weight
        const priorityQueue = new BinaryHeap((x) => {return 1 / x.weight;});
        const frustums = [];
        //pointClouds 一般来说也不会超过300个，搞二叉堆排序是不是小题大做了
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
```


每次requestAnimationFrame,都会从根节点开始遍历子节点构建二叉堆
如果一个while内遍历了所有节点以及子节点，某些节点还没有请求加载完，就会等待下一帧的while,已经请求完成并toTreePoints的不会在被添加到nodesToLoad中

```
   updateVisibility(pointClouds, camera, renderer) {
        const {frustums, priorityQueue} = this.updateVisibilityStructures(
			pointClouds,
			camera,
		);
        // 每次循环都从r根节点开始
        let queueItem;
        let nodesToLoad = [];
		let loadedToGPUThisFrame = 0;
        //如果一个while内遍历了所有节点以及子节点，某些节点还没有请求加载完，就会等待下一帧的while,已经请求完成并toTreePoints的不会在被添加到nodesToLoad中
        // priorityQueue.pop() 从二叉堆取出要节点并删除掉，防止重复处理
        while((queueItem = priorityQueue.pop()) !== undefined) 
        {
            let node = queueItem.node;
            const parentNode = queueItem.parent;
			const pointCloudIndex = queueItem.pointCloudIndex;
			const pointCloud = pointClouds[pointCloudIndex];
            // isGeometryNode判断当前node是否还是node类型，true表示还没有toTreePoints，已经toTreePoints的,不会进入if，所以不会在nodesToLoad
            // 并且如果parentNode不存在或者当前节点的父节点已经toTreePoints了就如此
            if (node.isGeometryNode && (!parentNode || !parentNode.isGeometryNode)) {
                // MAX_LOADS_TO_GPU怕GPU处理toTreePoints不过来加入限制
                if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU ) {
                    loadedToGPUThisFrame++;
                    pointCloud.toTreePoints(node, parentNode);//将当前节点转为Points
                } else if (!node.failed) 
                {
                    nodesToLoad.push(node);//node没有加载，被添加到待加载队列中
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
        const numNodesToLoad = Math.min(this.maxNumNodesLoading, nodesToLoad.length);
		for (let i = 0; i < numNodesToLoad; i++) 
		{
			nodesToLoad[i].load();
		}

    }
```
将node子节点，根据权重如下，添加到二叉堆中
屏幕像素 半径越大 或 距离越近 ，权重越大，从而有更高的渲染优先级


```
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
                // 3D世界中的实际高度 h/distance = slope(Math.tan(fov / 2.0)) => h = slope*distance
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
            const screenPixelRadius = radius * projectionFactor;（物体在屏幕上占据的像素高度）

            // 判断是否渲染该节点：
			// 如果球体的屏幕像素半径小于预设的最小节点像素大小（pointCloud.minNodePixelSize），则不添加该节点进行渲染，以节省资源。
			if (screenPixelRadius < this.minNodePixelSize) 
			{
				continue;
			}
            // 确定渲染优先级：
            // 对于大于最小像素大小的节点，根据它们的屏幕像素半径和距离来确定渲染的优先级。
            // 如果目标(node节点)距离相机小于其半径（即目标部分或全部在相机视锥体内），则给其一个非常高的优先级（Number.MAX_VALUE），可能意味着这些目标(node节点)会优先被加载或渲染。
            // 对于其他节点，使用屏幕像素半径加上距离的倒数作为权重，屏幕像素 半径越大 或 距离越近(点云中心离相机位置的距离) ，权重越大，从而有更高的渲染优先级。

			// Nodes which are larger will have priority in loading/displaying.
			const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;
            priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
        }
    }

```
### 1.3