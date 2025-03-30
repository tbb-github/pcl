
/**
 * 具体的八叉树节点
 * 该节点所代表的空间区域中的点云数据（对于叶子节点）或子节点的指针
 */
import * as THREE from '../library/three.module.js'
export class OctreeGeometryNode {
    constructor(name, octreeGeometry, boundingBox) {
        this.name = name;
        this.index = parseInt(name.charAt(name.length - 1));
        this.octreeGeometry = octreeGeometry;
		this.boundingBox = boundingBox;
        this.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
        this.isLeafNode = true;
        this.children = [		
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ];
        this.parent = null;
        this.loaded = false;
        this.loading = false;
        this.geometry = null;
        this.isGeometryNode = true;
    }
    addChild(child) 
	{
		this.children[child.index] = child;
		this.isLeafNode = false;
		child.parent = this;
	}
    /**
        !(P && Q) 等价于 !P || !Q
        !(P || Q) 等价于 !P && !Q
     */
    load() {
        // console.log(this.name, this.loading, this.loaded, '------------');
        
        // if (this.loading || this.loaded ) {
        //     return;
        // }
        // try {
        //     this.loading = true;
        //     this.octreeGeometry.numNodesLoading++;
        //     this.octreeGeometry.needsUpdate = true;
        //     return this.octreeGeometry.loader.load(this);
        // } catch(e) {
        //     this.loading = false;
		// 	this.failed = true;
		// 	this.octreeGeometry.numNodesLoading--;
        // }
        this.octreeGeometry.loader.load(this);
       
    }




}