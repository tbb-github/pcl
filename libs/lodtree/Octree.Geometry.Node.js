class OctreeGeometryNode {
    constructor(name, pcoGeometry, boundingBox) {
        this.name = name;
		this.pcoGeometry = pcoGeometry;
		this.boundingBox = boundingBox;
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
    }
    addChild(child) 
	{
		this.children[child.index] = child;
		this.isLeafNode = false;
		child.parent = this;
	}
}