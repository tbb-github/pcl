class Octree {
    constructor(potree, pcoGeometry,material) {
        this.potree = potree;
        this.root = pcoGeometry.root;
        this.pcoGeometry = pcoGeometry;
		this.boundingBox = pcoGeometry.boundingBox;
        this.material = material;
    }
}