
import {PointsMaterial} from './Points.Material.js';
import {Object3D,Points} from '../library/three.module.js';
/**
 * OctreeMesh对象
 * 有个OctreeGeometry几何体
 * 有个OctreeMaterial对象
 */

export class Octree extends Object3D {
    constructor(octreeGeometry, material){
        super();
        this.geometry = octreeGeometry;
        this.material = material || new PointsMaterial();
        this.position.copy(octreeGeometry.offset);;//offset min值
		this.updateMatrix();
    }
    toTreePoints(node, parent) {
        // console.log(node, this.material, 'vvv');
        const points = new Points(node.geometry, this.material);
		points.name = node.name;
		points.position.copy(node.boundingBox.min);
		node.points = points;
		node.isGeometryNode = false;
        if (parent) {
            console.log('parent');
            parent.points.add(points);//父元素的points点集添加子元素点集
			parent.children[node.index] = node;
        } else {
			this.root = node;
			this.add(points);
        }
    }
    updateMatrixWorld(force) 
	{
		if (this.matrixAutoUpdate === true) 
		{
			this.updateMatrix();
		}

		if (this.matrixWorldNeedsUpdate === true || force === true) 
		{
			if (!this.parent) 
			{
				this.matrixWorld.copy(this.matrix);
			}
			else 
			{
				this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
			}

			this.matrixWorldNeedsUpdate = false;

			force = true;
		}
	}

}
