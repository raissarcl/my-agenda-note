export function noteEditorDocumentCss(
  surface: string,
  text: string,
  textMuted: string,
  link: string
): string {
  return `
html, body, #root, #root > div {
  background-color: ${surface} !important;
}
.ProseMirror {
  background-color: ${surface} !important;
  color: ${text} !important;
  caret-color: ${text} !important;
}
.ProseMirror p,
.ProseMirror li,
.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror blockquote {
  color: inherit !important;
}
.ProseMirror a {
  color: ${link} !important;
}
.is-editor-empty:first-child::before {
  color: ${textMuted} !important;
}
`;
}
