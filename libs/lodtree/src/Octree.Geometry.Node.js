
/**
 * 具体的八叉树节点
 * 该节点所代表的空间区域中的点云数据（对于叶子节点）或子节点的指针
 */
export class OctreeGeometryNode {
    constructor(name, octreeGeometry, boundingBox) {
        this.name = name;
        this.octreeGeometry = octreeGeometry;
		this.boundingBox = boundingBox;
        this.isLeafNode = true;
        this.children = [];
        this.parent = null;
        this.loaded = false;
        this.loading = false;
        this.geometry = null;
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
        if (this.loading || this.loaded ) {
            return;
        }
        try {
            this.loading = true;
            this.pcoGeometry.numNodesLoading++;
            this.pcoGeometry.needsUpdate = true;
            return this.octreeGeometry.loader.load(this);
        } catch(e) {
            this.loading = false;
			this.failed = true;
			this.pcoGeometry.numNodesLoading--;
        }
       
    }




}