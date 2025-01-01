
import {OctreeMaterial} from './Octree.Material.js'
/**
 * OctreeMesh对象
 * 有个OctreeGeometry几何体
 * 有个OctreeMaterial对象
 */

export class Octree {
    constructor(octreeGeometry, material){
        this.geometry = octreeGeometry;
        this.material = material || new OctreeMaterial()
    }
}
