import {OctreeGeometryNode} from './Octree.Geometry.Node.js';
import {OctreeGeometry} from './Octree.Geometry.js';
import * as THREE from '../library/three.module.js'
import {NodeLoader} from './Node.Loader.js'
import {Octree} from './Octree.js'
import {PointAttributes, PointAttributeTypes, PointAttribute} from './PointAttributes.js';
/**
 * 在网络传输中，特别是在使用HTTP协议进行分块下载时，‌firstChunkSize‌可能指的是第一个数据块的大小。
 * 例如，在HTTP分块下载中，可以将文件分成多个块进行传输，每个块的大小可以根据需要设定。
 * 第一个数据块的大小即为‌firstChunkSize‌。通过这种方式，可以有效地管理下载过程，
 * 尤其是在断点续传场景中，能够记住每个块的下载状态，从而在中断后继续下载‌
    ByteOffset
        ‌ByteOffset‌是指在一个ArrayBuffer对象中，从一个特定的字节位置开始读取数据的偏移量。它表示从数组缓冲区的起始位置到读取位置的字节数。例如，如果你有一个100字节的ArrayBuffer，并且你想从第20个字节开始读取数据，那么ByteOffset就是20。

    ByteSize
        ‌ByteSize‌是指在一个TypedArray或DataView对象中，表示数据所占用的字节大小。例如，如果你有一个32位的整数存储在一个TypedArray中，每个整数占用4个字节，那么ByteSize就是4。
 
    multipart/byteranges 分块传输
    headers: {
        'content-type': 'multipart/byteranges',
        'Range': `bytes=${first}-${last}`
    }

    响应标头  Content-Range: bytes 0-9701/17204

        bytes 表示这是一个字节范围。
        0-9701 表示起始字节是0，结束字节是9701。也就是说，这部分内容包含从第0个字节到第9701个字节的数据。
        17204 是整个内容的总字节数。
*/
export class OctreeLoader {

    async load(url) {
        console.log(url, 'urlurl');
		let response = await fetch(url);
		let metadata = await response.json();
        /**
         * boundingBox的min属性：
                min属性通常表示点云数据在三维空间中的最小边界框的坐标。
                它定义了点云数据在X、Y、Z三个维度上的最小坐标值。
                这个信息对于Potree Viewer来说很重要，因为它可以用来确定点云数据的空间范围，从而进行正确的加载和渲染。
         * offset属性：
                offset属性在metadata.json文件中可能不是直接用于定义boundingBox的，但它通常与点云数据的空间位置有关。
                在某些情况下，offset可能用于表示点云数据相对于某个参考点或参考坐标系的偏移量。
         * scale通常是一个包含三个元素的数组（例如[sx, sy, sz]），分别代表在X、Y、Z三个方向上对点云数据进行缩放的因子。这些缩放因子允许用户根据需要调整点云数据的整体尺寸，以便更好地适应可视化需求或分析目的。
         */
        console.log(metadata, 'metadata');
        // 1.根据metadata数据，构建八叉树，八叉树对象 - material geometry
        // 我们这里只构建几何体
        // 1.1 几何体，存放当前八叉树空间大小box
        let octreeGeometry = new OctreeGeometry();
        octreeGeometry.pointAttributes = OctreeLoader.parseAttributes(metadata.attributes);
        let min = new THREE.Vector3(...metadata.boundingBox.min);
        let max = new THREE.Vector3(...metadata.boundingBox.max);
        let boundingBox = new THREE.Box3(min, max);
        octreeGeometry.boundingBox = boundingBox.clone();
        octreeGeometry.spacing = metadata.spacing;// 点云间隔
        octreeGeometry.scale = metadata.scale;// scale 还不知作用
        octreeGeometry.projection = metadata.projection;// scale 还不知作用
        let offset = min.clone();
        octreeGeometry.offset = offset;//min值
        boundingBox.min.sub(offset);
        boundingBox.max.sub(offset);
        octreeGeometry.boundingBox = boundingBox;
        octreeGeometry.nodeOffset = metadata.offset;
        // 1.1.1 创建OctreeGeometryNode具体的八叉树节点，第一个首节点
        let root = new OctreeGeometryNode('r', octreeGeometry, boundingBox);//
        root.level = 0;
        // metadata.hierarchy 层级结构
		root.hierarchyByteOffset = BigInt(0);//字节偏移量 
		root.hierarchyByteSize = BigInt(metadata.hierarchy.firstChunkSize);//字节大小
        // 在网络通信中，ByteOffset和ByteSize用于确定数据包的起始位置和数据长度。这有助于确保数据的完整性和顺序
		root.byteOffset = BigInt(0); // Originally 0
        root.spacing = metadata.spacing;// 点云点间隔
        root.offset = 
        console.log(root, 'root');
        octreeGeometry.root = root;
        let loader = new NodeLoader(url);
        loader.load(root);//
        let octree = new Octree(octreeGeometry);
     

        return octree;
    }
    static parseAttributes(jsonAttributes) {
        let attributes = new PointAttributes();
        let replacements = {'rgb': 'rgba'};
        for (let i = 0; i < jsonAttributes.length; i++) {
            let jsonAttribute = jsonAttributes[i];
            // console.log(jsonAttribute, 'jsonAttribute');
            let { name, numElements, min, max} = jsonAttribute;
            // attribute属性数据(如position int32类型4个字节)  
            //                   elementSize = 4 这种数据类型字节大小
            //                   numElements = 3 数据个数(x,y,z)
            //                   size = numElements*elementSize
            // this.byteSize = this.numElements * this.type.size;
            let type = typeMap[jsonAttribute.type];
            console.log(type,'type');
            let potreeAttributeName = replacements[name] ? replacements[name]: name;
            // console.log(potreeAttributeName, type, numElements, 'potreeAttributeName, type, numElements');
            let attribute = new PointAttribute(potreeAttributeName, type, numElements);
            if (numElements === 1) {
                attribute.range = [min[0], max[0]]
            } else {
                attribute.range = [min, max]
            }
            attribute.initialRange = attribute.range;
            // console.log(attribute, 'attribute');
			attributes.add(attribute);
       
        }
        return attributes
    }

}
let typeMap = {
    'double': PointAttributeTypes.DATA_TYPE_DOUBLE,
	'float': PointAttributeTypes.DATA_TYPE_FLOAT,
	'int8': PointAttributeTypes.DATA_TYPE_INT8,
	'uint8': PointAttributeTypes.DATA_TYPE_UINT8,
	'int16': PointAttributeTypes.DATA_TYPE_INT16,
	'uint16': PointAttributeTypes.DATA_TYPE_UINT16,
	'int32': PointAttributeTypes.DATA_TYPE_INT32,
	'uint32': PointAttributeTypes.DATA_TYPE_UINT32,
	'int64': PointAttributeTypes.DATA_TYPE_INT64,
	'uint64': PointAttributeTypes.DATA_TYPE_UINT64
}
