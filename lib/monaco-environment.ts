// Monaco Editor environment configuration
// This file provides the Monaco Editor worker configuration

export const getMonacoEnvironment = () => {
  if (typeof window === 'undefined') {
    // Return a minimal config for server-side rendering
    return {
      getWorkerUrl: () => '',
    }
  }

  // Client-side configuration
  return {
    getWorkerUrl: function (moduleId: string, label: string) {
      if (label === 'json') {
        return './monaco-editor/esm/vs/language/json/json.worker.js'
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return './monaco-editor/esm/vs/language/css/css.worker.js'
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return './monaco-editor/esm/vs/language/html/html.worker.js'
      }
      if (label === 'typescript' || label === 'javascript') {
        return './monaco-editor/esm/vs/language/typescript/ts.worker.js'
      }
      return './monaco-editor/esm/vs/editor/editor.worker.js'
    },
  }
}