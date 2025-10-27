/**
 * css.d
 * モジュール定義
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
