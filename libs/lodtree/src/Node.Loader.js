/**
 * 0x12 0x34 0x56 0x78
   这里数字字节的高-低位是从左到右，最高位是 12，最低位是 78；而内存中存储时从左到右是低地址——高地址。

   所以在大端序中高位字节的 12 在内存最左边的低地址位，而低字节位 78 则在内存最右边的高地址位；
     大端内存中存储时：0x12 0x34 0x56 0x78
   而小端序则正好相反。
     小段端内存中存储时：0x78  0x56 0x34 0x12 

  从视觉习惯上，大端存储似乎更顺眼，但无论哪种方式，计算的结果都是一样的，只是在计算的时候需要处理这个排序方式，下文会涉及到。
 
    false 表示使用大端字节序写入，true 表示使用小端字节序写入，默认是大端字节写入
    // 在第1个字节，以大端字节序写入值为25的32位整数
    dv.setInt32(0, 25, false)

    // 从第1个字节读取一个8位无符号整数
    var v1 = dv.getUint8(0);

    // 小端字节序
    var v1 = dv.getUint16(1, true)
  */
import {OctreeGeometryNode} from './Octree.Geometry.Node.js';
import * as THREE from '../library/three.module.js'
let set = new Set();
export class NodeLoader {
    constructor(url) {
        this.url = url;
    }
    async load(node) {
        if (node.loaded || node.loading)
		{
			return;
		}

		node.loading = true;
		// TODO: Need to put the numNodesLoading to the pco
		node.octreeGeometry.numNodesLoading++;
        try {
            // 加载 hierarchy
            if (node.nodeType === 2) {
                await this.loadHierarchy(node);
            }
       
            // 加载octree.bin
            let {byteOffset, byteSize} = node;
            if (byteOffset === undefined || byteSize === undefined) {
                throw new Error('byteOffset and byteSize are required');
            }
            let urlOctree = this.url.replace('metadata.json', 'octree.bin');
            let first = byteOffset;
            let last = byteOffset + byteSize - BigInt(1);
            let buffer; 
            if (byteSize === BigInt(0)) {
                buffer = new ArrayBuffer(0);
            } else {
                let response = await fetch(urlOctree, {
                    headers:{
                        'content-type': 'multipart/byteranges',
                        'Range': `bytes=${first}-${last}`
                    }
                })
                buffer = await response.arrayBuffer();
            }
            let pointAttributes = node.octreeGeometry.pointAttributes;
            let scale = node.octreeGeometry.scale;
            let box = node.boundingBox;
            let min = node.octreeGeometry.offset.clone().add(box.min);//算出原始没有减去offset(最小值)的最小值,也即metadata的min
            let size = box.max.clone().sub(box.min);//因为传过来的box都减去了offset(min) 所以size还是用box.max-box.min 得到size既可
            let max = min.clone().add(size);//原始最大值就是用原始最小值加上size
            let numPoints = node.numPoints;
            let nodeOffset = node.octreeGeometry.nodeOffset;                                
            // worker
            /**
             * 创建 Web Worker
             你需要创建一个单独的 JavaScript 文件作为 Worker 的入口点，
            然后在主线程中启动 Worker。假设我们有一个需要在 Worker 中运行的文件 worker.js，
            并且有一个主线程脚本 ***.js
            * 
            */
            let worker = new Worker('./worker.js');// 创建一个新的 Worker 实例，指向 worker.js 文件，也即开启一个后台线程

            // 主线程向 Worker 发送消息
            let message = {
                name: node.name,
                buffer: buffer,
                pointAttributes: pointAttributes,
                scale: scale,
                min:min,
                max:max,
                size:size,
                nodeOffset:nodeOffset,
                numPoints: numPoints
            }
            // worker.postMessage(message, transfer)
            // transfer可转移对象是如ArrayBuffer，MessagePort或ImageBitmap等二进制数据。JavaScript 允许主线程把二进制数据直接转移给子线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做Transferable Objects。这使得主线程可以快速把数据交给 Worker，对于影像处理、声音处理、3D 运算等就非常方便了，不会产生性能负担。
        //    ‌数据所有权转移‌：一旦数据被转移，主线程将失去对这些数据的控制权。如果需要再次使用这些数据，必须重新在主线程中创建新的数据。
            worker.postMessage(message, [message.buffer]); // 发送数字 10，Worker 将计算 10 的平方

            // 监听 Worker 返回的消息
            worker.onmessage = function(event) {
                console.log('从 Worker 接收到的数据:', event.data); //
                let data = event.data;
                let buffers = data.attributeBuffers;
                let geometry = new THREE.BufferGeometry();
                console.log(buffers, 'buffers');
                for (let property in buffers) {
                    let buffer = buffers[property].buffer;
                    if (property === 'position') {
                        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer), 3));
                    } else if (property === 'rgba') {
                        geometry.setAttribute('rgba', new THREE.BufferAttribute(new Uint8Array(buffer), 4, true));//且normalized的值为true，则队列中的值将会从其最大值映射到0到1之间
                        // 如果array是Uint16Array类型，其值范围是0到65535，则映射后的值范围是0.0到1.0；如果array是Int16Array类型，其值范围是-32768到32767，则映射后的值范围是-1.0到1.0‌
                        // ‌Uint8Array的值范围是0到255
                    } else if (property === 'INDICES') {
                        let bufferAttribute = new THREE.BufferAttribute(new Uint8Array(buffer), 4);
                        bufferAttribute.normalized = true;
                        geometry.setAttribute('indices', bufferAttribute)
                        
                    } else {
                        let bufferAttribute = new THREE.BufferAttribute(new Float32Array(buffer), 1);
                        let batchAttribute = buffers[property].attribute;

                        bufferAttribute.potree = {
                            offset: buffers[property].offset,
                            scale: buffers[property].scale,
                            preciseBuffer: buffers[property].preciseBuffer,
                            range: batchAttribute.range,
                        }
                        geometry.setAttribute(property, bufferAttribute)
                    }
                    node.density = data.density;
                    node.geometry = geometry;
                    node.loaded = true;
                    set.add(node.name);
                    let myArray = Array.from(set);
                    myArray = myArray.sort(); 
                    console.log(myArray, node.name + '<<<请求返回完成');
                    
                    node.loading = false;
                }
            };

            // 错误处理
            worker.onerror = function(error) {
                node.loaded = false;
                node.loading = false;
                console.error('Worker 出现错误:', error.message);
            };
        } catch(e) {
            node.loaded = false;
            node.loading = false;
        }



    }
    // 加载层级
    async loadHierarchy(node) {
        let {hierarchyByteOffset, hierarchyByteSize} = node;
		if (hierarchyByteOffset === undefined || hierarchyByteSize === undefined) 
		{
			throw new Error(`hierarchyByteOffset and hierarchyByteSize are undefined for node ${node.name}`);
		}
        let first = hierarchyByteOffset;
        let last = first + hierarchyByteSize - BigInt(1)
        let url = this.url.replace('metadata.json', 'hierarchy.bin');
      
        
        let respose = await fetch(url, {
            headers: {
                'content-type': 'multipart/byteranges',
                'Range': `bytes=${first}-${last}`
            }
        });
        let buffer = await respose.arrayBuffer();//arraybuffer
        this.buildOctree(node, buffer);

	
    }
    buildOctree(node, buffer) {
        // 
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
                // console.log(current, 'current');
                let childBox = this.createChildAABB(current.boundingBox, childIndex);
                // console.log(childBox, 'childBox');
                let childOctreeNode = new OctreeGeometryNode(childName, octree, childBox);
                childOctreeNode.spacing = current.spacing / 2;
                childOctreeNode.level = current.level + 1;
                childOctreeNode.parent = current;
                current.children[childIndex] = childOctreeNode;
                // console.log(childOctreeNode, 'childOctreeNode');
                nodes[nodePos] = childOctreeNode;
                nodePos++;
            }
           
        }
        // console.log(nodes, 'nodes');
    }
    createChildAABB(aabb, index) {
        let min = aabb.min.clone();
        let max = aabb.max.clone();
        let size = new THREE.Vector3().subVectors(max, min);

        // let minX = i === 0 ? box3.min.x : (box3.min.x+box3.max.x)/2;
        // let maxX = i === 0 ? (box3.min.x+box3.max.x)/2 : box3.max.x;
        // let minY = j === 0 ? box3.min.y : (box3.min.y+box3.max.y)/2;
        // let maxY = j === 0 ? (box3.min.y+box3.max.y)/2 : box3.max.y;
        // let minZ = z === 0 ? box3.min.z : (box3.min.z+box3.max.z)/2;
        // let maxZ = z === 0 ? (box3.min.z+box3.max.z)/2 : box3.max.z;
        
    
        if ((index & 0b0001) > 0) {
           // new THREE.Vector(*,*,1);
           min.z += size.z/2; // === (min.z+max.z)/2
           //max.z 不变
        } else {
            // new THREE.Vector(*,*,0); 
            //min.z 不变
           max.z -= size.z/2;// === (min.z+max.z)/2
         
        }

        if ((index & 0b0010) > 0) {
            // new THREE.Vector(*,1,*);
            min.y += size.y/2; // === (min.y+max.y)/2
            //max.y 不变
         } else {
             // new THREE.Vector(*,0,*); 
             //min.y 不变
            max.y -= size.y/2;// === (min.y+max.y)/2
         }

         if ((index & 0b0100) > 0) {
            // new THREE.Vector(1,*,*);
            min.x += size.x/2; //=== (min.x+max.x)/2
            //max.y 不变 
         } else {
             // new THREE.Vector(0,*,*); 
             //min.x 不变
            max.x -= size.x/2;// === (min.x+max.x)/2
         }

         return new THREE.Box3(min, max);
    }

}