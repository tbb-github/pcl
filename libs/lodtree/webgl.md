
## 1.语法

### 1.1 in和out


‌WebGL中的in和out是GLSL（OpenGL Shading Language）中的特殊变量限定符，用于在着色器阶段之间传递数据‌。in用于在着色器阶段之间输入数据，而out用于输出数据。

基本概念

- ‌in‌：在顶点着色器中，in变量通常表示从CPU传入的顶点数据，如顶点位置、纹理坐标等。在片元着色器中，in变量表示从顶点着色器传递过来的插值数据‌


‌顶点着色器‌：在顶点着色器中，使用in关键字来声明输入变量，例如：

```glsl
in vec4 position;
in vec2 texCoord;
```
‌片元着色器‌：在片元着色器中，使用in关键字来接收从顶点着色器传递过来的数据，例如：

```glsl
in vec4 position;
in vec2 texCoord;
```

- ‌out‌：在顶点着色器中，out变量用于输出数据到片元着色器。这些数据通常是通过插值传递的变量，如颜色、纹理坐标等‌


### 1.2 宏定义#define

注意宏定义和着色器声明的变量不同，着色器程序执行前需要进行编译处理，着色器程序编译处理之后程序才会在GPU上执行，宏定义主要是在编译处理阶段起作用。比如宏定义#define PI 3.14,PI符号表示圆周率3.14，如果在代码return float f = PI*100.0;中使用PI符号，编译预处理的时候把自动把PI替换成浮点数3.14。

宏定义变量语法使用下划线

```glsl
#define PI 3.14//圆周率
#define RECIPROCAL_PI 0.318//圆周率倒数
float add(){
  float f = PI*100.0;//预处理的时候会把PI符号自动替换为3.14
  return f;
}

```
预处理之后代码

```glsl
float add(){
  float f = 3.14*100.0;//预处理的时候会把PI符号自动替换为3.14
  return f;
}

```

### 1.3 #ifdef


#ifdef的作用是判断一个宏定义是否存在，如果存在，在编译预处理的时候，代码vColor.xyz = color.xyz;会保留，否则就不保留。

通过#ifdef和#endif两个关键字约束作用代码范围。

```
#define USE_COLOR 1.0;
// 判断宏定义是否存在
#ifdef USE_COLOR
// 顶点颜色进行插值计算
	vColor.xyz = color.xyz;
#elif define ...
    ...
#endif

```
上面代码预处理后最终结果就是vColor.xyz = color.xyz;,在GPU着色器中执行的是下面代码，而不是上面代码。
```
vColor.xyz = color.xyz;
```

### 1.4 #if

#if主要是判断条件是否成立，如果成立，在编译预处理后会保留通过#if和#endif两个关键字之间的代码，否在不保留。

```
#if 10 > 0
    vec3 v3 = vec3(1.0,1.0,0.0);
#elif ...
    ...
#endif

```


### 2.顶点在裁剪空间的位置

顶点在裁剪空间中的位置=投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点的初始点位 


## 3.片元着色器

### 3.1 对比 gl_FragColor 和 out vec4 fragColor



在现代 OpenGL（特别是核心模式 Core Profile）中，`gl_FragColor` 已经被废弃，取而代之的是使用用户自定义的输出变量（如 `out vec4 fragColor`）。这是因为现代着色器编程更加灵活，允许开发者定义多个输出变量以支持多目标渲染（Multiple Render Targets, MRT）等高级功能。

以下是为什么使用 `out vec4 fragColor` 能够渲染出来的原因：

---

### **1. 现代 OpenGL 的片段着色器输出机制**

在现代 OpenGL 中，片段着色器的输出不再依赖固定的全局变量（如 `gl_FragColor`），而是通过 `out` 修饰符声明的用户自定义变量来指定输出。例如：

```glsl
#version 330 core
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0); // 输出红色
}
```

- **`out vec4 fragColor;`**：
  - 这是一个用户定义的输出变量。
  - 它的作用是将片段着色器计算的结果传递给 OpenGL 渲染管线的后续阶段（通常是帧缓冲区或颜色附件）。

- **绑定到默认帧缓冲区**：
  - 如果你没有显式创建帧缓冲区对象（FBO），OpenGL 会使用默认的帧缓冲区（即屏幕）。
  - 默认情况下，`fragColor` 的值会被写入到默认帧缓冲区的颜色附件中，并最终显示在屏幕上。

---

### **2. 为什么能渲染出来？**

即使没有使用 `gl_FragColor`，只要片段着色器正确设置了 `out` 变量（如 `fragColor`），并且渲染管线配置正确，就可以正常渲染。原因如下：

#### **(1) 默认帧缓冲区**
- 在未使用自定义帧缓冲区的情况下，片段着色器的输出会直接写入默认帧缓冲区的颜色附件。
- 默认帧缓冲区通常对应于窗口系统提供的屏幕缓冲区。

#### **(2) 输出变量与位置绑定**
- 在 OpenGL 中，`out` 变量可以通过 `layout(location = N)` 显式绑定到特定的颜色附件。例如：
  ```glsl
  layout(location = 0) out vec4 fragColor;
  ```
  - 这里的 `location = 0` 表示 `fragColor` 绑定到第一个颜色附件（通常是默认帧缓冲区的颜色附件）。
  - 如果没有显式指定 `layout(location)`，则默认绑定到 `location = 0`。

#### **(3) 渲染管线的自动处理**
- OpenGL 渲染管线会自动将片段着色器的输出变量传递到帧缓冲区。
- 如果片段着色器输出了一个有效的颜色值（如 `vec4`），并且深度测试、模板测试等条件通过，则该颜色值会被写入到目标缓冲区中。

---

### **3. 对比 `gl_FragColor` 和 `out vec4 fragColor`**

| 特性                     | `gl_FragColor`                        | `out vec4 fragColor`                  |
|--------------------------|---------------------------------------|---------------------------------------|
| **版本支持**             | OpenGL 2.x / GLSL 1.x                 | OpenGL 3.x+ / GLSL 3.30+              |
| **灵活性**               | 固定名称，只能有一个输出              | 用户定义名称，支持多个输出            |
| **多目标渲染支持**       | 不支持                                | 支持                                  |
| **是否需要绑定位置**     | 无需绑定                              | 需要显式绑定（或默认绑定到 `location = 0`） |

---

### **4. 示例代码**

以下是一个完整的现代 OpenGL 示例，展示如何使用 `out vec4 fragColor` 渲染一个红色三角形：

#### **顶点着色器**
```glsl
#version 330 core
layout(location = 0) in vec3 aPos;

void main() {
    gl_Position = vec4(aPos, 1.0);
}
```

#### **片段着色器**
```glsl
#version 330 core
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0); // 输出红色
}
```

### **总结**

- 在现代 OpenGL 中，`gl_FragColor` 已被废弃，取而代之的是用户自定义的 `out` 变量（如 `fragColor`）。
- 只要片段着色器正确设置了输出变量，并且渲染管线配置正确，就能正常渲染。
- 使用 `out vec4 fragColor` 提供了更大的灵活性，支持多目标渲染和更复杂的图形管线。

