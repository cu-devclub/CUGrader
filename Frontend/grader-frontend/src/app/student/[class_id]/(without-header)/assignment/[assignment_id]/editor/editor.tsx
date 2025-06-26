import Editor, { useMonaco } from '@monaco-editor/react';
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon } from 'lucide-react';
import { CodeSpaceTabs } from './shared';
import { useEffect } from 'react';

export interface EditorPanelProps {

}

// TODO: if we want lsp then we need to run it somewhere else probably same server as the backend 💀💀💀
// we CAN use wasm but only clangd has a VERY EXPERIMENTAL support  
export function EditorPanel({ }: EditorPanelProps) {

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      console.log({ monaco });
    }
  }, [monaco]);

  return (
    <CodeSpaceTabs
      className='h-full'
      tabs={[
        {
          id: "main.ts",
          icon: CodeIcon,
          name: "main.ts"
        }
      ]}
      selected='main.ts'
      onSelect={() => { }}
    >
      <Tabs.Content value="main.ts" className="flex-1">
        <Editor
          defaultLanguage="javascript"
          defaultValue="// some comment"
        // theme=''
        />
      </Tabs.Content>
    </CodeSpaceTabs>
  );
}
