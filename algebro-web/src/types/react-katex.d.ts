declare module 'react-katex' {
  import { ReactNode } from 'react';

  interface KaTeXProps {
    children: string;
    math?: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error | TypeError) => ReactNode;
    settings?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      strict?: boolean | string | (() => void);
      maxSize?: number;
      maxExpand?: number;
      allowedProtocols?: string[];
    };
  }

  export const InlineMath: React.FC<KaTeXProps>;
  export const BlockMath: React.FC<KaTeXProps>;
} 