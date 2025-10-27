/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: string;
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
