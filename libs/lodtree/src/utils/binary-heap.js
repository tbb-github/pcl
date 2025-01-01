/**
 * from: http://eloquentjavascript.net/1st_edition/appendix2.html
 *
 */

export function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },
  // 当新元素添加到堆的末尾时，它可能破坏了堆的性质。通过上浮操作，将该元素与其父元素比较并交换（如果需要），直到堆的性质恢复
  // 最大堆
  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n],
      score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) { // n 数组下标索引
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
        parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent)) break;
      // 来检查当前元素是否需要上浮。如果当前元素的分数大于或等于父元素的分数（对于最大堆），或者小于或等于父元素的分数（对于最小堆），则堆的性质已经满足，不需要继续上浮，跳出循环

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },
  // 下沉（Sink Down）：当堆的根元素被移除并用其他元素替换时，新根元素可能破坏了堆的性质。通过下沉操作，将该元素与其子元素比较并交换（如果需要），直到堆的性质恢复。
  // 最大堆，大的要再后面
  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2,
        child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
          child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N;
        // 子元素值小于当前元素值，证明当前元素的值要往后(子元素下标比当前元素大所以叫往后放)最大堆规则，也即是把两个值交换下
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score)) swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
      // 更新 n 为交换位置的索引 swap，以便在下一次循环中继续检查新的子元素
    }
    /**
        使用 while (true) 循环来不断检查当前元素是否需要与其子元素交换位置。
        在循环内部，首先计算两个子元素的索引：var child2N = (n + 1) * 2; var child1N = child2N - 1;。
        使用 var swap = null; 来存储需要交换的位置的索引。
        接下来，检查第一个子元素是否存在（即索引是否在数组范围内内），并计算其分数。如果第一个子元素的分数小于当前元素的分数，则设置 swap 为第一个子元素的索引。
        对第二个子元素进行相同的检查。如果第二个子元素存在，并且其分数小于当前元素的分数（或者如果 swap 已经被设置为第一个子元素的索引，但第二个子元素的分数更小），则更新 swap 为第二个子元素的索引。
        如果 swap 为 null，则没有需要交换的子元素，跳出循环。

        当循环结束时，当前元素已经下沉到了正确的位置，或者已经没有子元素可以交换。
     */
  },


};
