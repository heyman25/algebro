declare module '@wiris/mathtype-generic' {
  interface EditorOptions {
    language?: string;
    toolbar?: {
      buttons?: string[];
    };
    handleOnChange?: (mathML: string) => void;
  }

  export class Editor {
    constructor(options?: EditorOptions);
    insertInto(element: HTMLElement): void;
    destroy(): void;
  }
} 