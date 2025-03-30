// 子线程 Worker 内部不能访问 DOM，但可以执行任何复杂的计算任务
// self是Worker内部的全局对象，它相当于主线程中的window，但没有UI相关的API(比如不能操作DOM)
// onmessage监听主线程发送的数据
// 而postMessage用于将结果返回给主线程
const typedArrayMapping = {
	'int8':   Int8Array,
	'int16':  Int16Array,
	'int32':  Int32Array,
	'int64':  Float64Array,
	'uint8':  Uint8Array,
	'uint16': Uint16Array,
	'uint32': Uint32Array,
	'uint64': Float64Array,
	'float':  Float32Array,
	'double': Float64Array,
};
self.onmessage = function(event) {
	let {buffer, pointAttributes, scale, name, min, max, size, nodeOffset, numPoints} = event.data;
	let attributeBuffers = {};
	let bytesPerPoint = 0;//所有属性的字节大小总和
	for (let pointAttribute of pointAttributes.attributes) {
		bytesPerPoint += pointAttribute.byteSize;
	}
	/**
		gridSize 的变量，并将其值设置为 32。然后，您使用 gridSize 的三次方（即 gridSize ** 3，计算结果为 32768）作为长度，创建了一个新的 Uint32Array 类型的数组，命名为 grid。
		Uint32Array 是 JavaScript 中的一个类型化数组（TypedArray），它允许您以 32 位无符号整数的形式存储数组元素。这种类型的数组在处理大量数值数据（如图像处理、科学计算或游戏开发中的网格数据）时非常有用，因为它们提供了比普通数组更好的性能和内存使用效率。
	 */
	let gridSize = 32;
	let grid = new Uint32Array(gridSize ** 3);
	let getIndex = function(x,y,z) {
		let dx = gridSize * x/ size.x;//size 是点云数据在X、Y、Z三个维度的数据大小 x/size.x表示当前点在点云x范围的比例，依次来算x方向的下标
		let dy = gridSize * y/ size.y;//size 是点云数据在X、Y、Z三个维度的数据大小 y/size.y表示当前点在点云y范围的比例，依次来算y方向的下标
		let dz = gridSize * z/ size.z;//size 是点云数据在X、Y、Z三个维度的数据大小 z/size.z表示当前点在点云z范围的比例，依次来算z方向的下标
		let ix = Math.min(parseInt(dx), gridSize -1);
		let iy = Math.min(parseInt(dy), gridSize -1);
		let iz = Math.min(parseInt(dz), gridSize -1);
		let index = ix + iy * gridSize + iz * gridSize * gridSize;
		return index;
	}
	// 使用这个 grid 数组来表示或处理三维空间中的数据，您可能需要进一步定义如何映射这些扁平的数组索引到三维空间中的坐标。通常，这可以通过简单的数学运算来实现，例如使用三维坐标 (x, y, z) 来计算一维索引 index = x + y* gridSize  + z * gridSize * gridSize
	// 就是三维数组转一维数组坐标，arr[4][4] 下标就是x+y*4 arr[4][4][4]
	let attributeOffset = 0; //属性字节偏移量，每到下一个属性时会变化
	console.log(numPoints, 'numPoints');
	let view = new DataView(buffer);
	// 在worker.js中完成对请求来的bin文件的buffer数据解析，根据规则把对应属性的buffer生成出来
	let numOccupiedCells = 0;
	for (let i = 0; i < pointAttributes.attributes.length;i++) {
		let pointAttribute = pointAttributes.attributes[i];
		if (['POSITION_CARTESIAN', 'position'].includes(pointAttribute.name)) {
			let buff = new ArrayBuffer(numPoints * 4 * 3);//numPoints 根据hierarchy.bin解析出来的
			let positions = new Float32Array(buff);// numPoints (点数量) * 4(字节数) * 3 (元素数量)
			
			for (let j = 0; j < numPoints;j++) {
				let pointOffset = j * bytesPerPoint;
				let x = (view.getInt32(pointOffset + attributeOffset + 0, true) * scale[0]) + nodeOffset[0] - min.x;
				let y = (view.getInt32(pointOffset + attributeOffset + 4, true) * scale[1]) + nodeOffset[1] - min.y;
				let z = (view.getInt32(pointOffset + attributeOffset + 8, true) * scale[2]) + nodeOffset[2] - min.z;
				let index = getIndex(x,y,z);
				let count = grid[index]++;//先读取 grid[index] 的值，然后将该值赋给 count 变量，接着立即将 grid[index] 的值增加 1。因此，count 变量实际上存储的是增加之前的值。
				if (count === 0) {
					// 当 grid[index] 被第一次访问时，它的值默认为 0（由于 Uint32Array 的所有元素在创建时都被初始化为 0），但是紧接着 grid[index]++ 会将它的值增加到 1，所以 count 接收到的值始终是增加之前的 0，但判断时 grid[index] 已经变成了 1
					// 如果下一个循环点坐标和前一个点位置位置很接近，那么这个点下标和前一个点一致，
					// 次数因为前一个点已经++变成1了，所以不会在进入这个===0的判断条件
					numOccupiedCells++;
				}
				positions[3*j + 0] = x;
				positions[3*j + 1] = y;
				positions[3*j + 2] = z;
			}
			attributeBuffers[pointAttribute.name] = {
				buffer: buff,
				attribute: pointAttribute
			}
		} else if (['RGBA', 'rgba'].includes(pointAttribute.name)) {
			let buff = new ArrayBuffer(numPoints * 4);// numPoints (点数量) * 1(字节数) * 4 (元素数量)
			let colors = new Uint8Array(buff);
			for (let j = 0; j < numPoints; j++) {
				let pointOffset = j * bytesPerPoint;
				let r = view.getUint16(pointOffset + attributeOffset + 0, true);
				let g = view.getUint16(pointOffset + attributeOffset + 2, true);
				let b = view.getUint16(pointOffset + attributeOffset + 4, true);
	
				colors[ 4 * j + 0] = r > 255 ? r/256: r;
				colors[ 4 * j + 1] = g > 255 ? g/256: g;
				colors[ 4 * j + 2] = b > 255 ? b/256: b;
			}
			attributeBuffers[pointAttribute.name] = {buffer: buff, attribute : pointAttribute}
		
		} else {
			let buff = new ArrayBuffer(numPoints * 4);
			let f32 = new Float32Array(buff);// numPoints (点数量) * 4(字节数) * 1 (元素数量)
			let TypedArray = typedArrayMapping[pointAttribute.type.name];
			let preciseBuffer = new TypedArray(numPoints);
			let [offset, scale] = [0, 1];
			const getterMap = {
				'int8':   view.getInt8,
				'int16':  view.getInt16,
				'int32':  view.getInt32,
				// 'int64':  view.getInt64,
				'uint8':  view.getUint8,
				'uint16': view.getUint16,
				'uint32': view.getUint32,
				// 'uint64': view.getUint64,
				'float':  view.getFloat32,
				'double': view.getFloat64,
			};
			const getter = getterMap[pointAttribute.type.name].bind(view);
			if (pointAttribute.type.size > 4) { //字节数
				let[amin,amax] = pointAttribute.range;
				offset = amin;
				scale = 1 / (amax - amin);
			}
			for (let j = 0; j < numPoints; j++) {
				let pointOffset = j * bytesPerPoint;
				let value = getter(pointOffset + attributeOffset, true);
				f32[j] = (value - offset) * scale;
				preciseBuffer[j] = value;
			}
			attributeBuffers[pointAttribute.name] = {
				buffer: buff,
				preciseBuffer: preciseBuffer,
				attribute: pointAttribute,
				offset: offset,
				scale: scale
			}
		}
		attributeOffset += pointAttribute.byteSize;
	}


	// 新增 indices
	{
		let buff = new ArrayBuffer(numPoints * 4);
		let indices = new Uint32Array(buff);
		for (let i = 0; i < numPoints;i++) {
			indices[i] = i;
		}
		attributeBuffers['INDICES'] = {
			buffer: buff,
			attribute: null
		}
	}
	let occupancy = parseInt(numPoints/numOccupiedCells);
	let message = {
		buffer: buffer,
		attributeBuffers: attributeBuffers,
		density: occupancy
	}
	let transferables = [];
	for (let property in message.attributeBuffers) {
		transferables.push(message.attributeBuffers[property].buffer);
	}
	transferables.push(buffer);
	console.log(message, transferables, 'message, transferables');
	postMessage(message, transferables)
	// 具体计算...
	// 将结果范围给主线程
	// self.postMessage('');

}