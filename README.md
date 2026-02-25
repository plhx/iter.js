# iter.js

JavaScriptの[Iterator](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Iterator)クラスのPolyfillおよび拡張をするライブラリです。

## 使い方

```js
[1, 2, 3].values().cycle().take(9).toArray()  // [1, 2, 3, 1, 2, 3, 1, 2, 3]
```

## 追加メソッド

- chain(other): Chain\<T, U\>
- clone(): Iterator\<T\>
- compareBy(other, callbackFn): number
- count(): number
- cycle(): Iterator\<T\>
- dropWhile(callbackFn): DropWhile\<T\>
- enumerate(): Enumerate\<T\>
- equalsBy(other, callbackFn): boolean
- filterMap(callbackFn): FilterMap\<T\>
- findIndex(callbackFn): number
- findLast(callbackFn): T?
- findLastIndex(callbackFn): number
- last(): T?
- maxBy(callbackFn): T
- minBy(callbackFn): T
- nth(n): T?
- nthLast(n): T?
- reverse(): Reverse\<T\>
- stepBy(n): StepBy\<T\>
- sum(): T
- takeWhile(callbackFn): TakeWhile\<T\>
- zip(other): Zip\<T, U\>

## CDNからの利用

```html
<script src="https://js.plasticheart.info/iter/latest/iter.min.js"></script>
```
