
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
        this.updateMatrix();
        this.minNodePixelSize = 50;
    }
    toTreePoints(node, parent) {
        // console.log(node, this.material, 'vvv');
        const points = new Points(node.geometry, this.material);
		points.name = node.name;
		points.position.copy(node.boundingBox.min);
        if (parent) {
            console.log('parent');
            parent.points.add(points);//父元素的points点集添加子元素点集
        } else {
            console.log('points');
            node.points = points;
        }
    }

}
