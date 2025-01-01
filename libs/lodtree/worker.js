// 子线程 Worker 内部不能访问 DOM，但可以执行任何复杂的计算任务
// self是Worker内部的全局对象，它相当于主线程中的window，但没有UI相关的API(比如不能操作DOM)
// onmessage监听主线程发送的数据
// 而postMessage用于将结果返回给主线程
self.onmessage = function(event) {
	console.log(event, 'event');
	// const number = event.data;
	// 具体计算...
	// 将结果范围给主线程
	// self.postMessage('');

}