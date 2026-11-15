import type { BeforeDocumentControlsServerProps } from "payload";

import ArticleWorkflowControlsClient from "./ArticleWorkflowControlsClient";

export default function ArticleWorkflowControlsServer(props: BeforeDocumentControlsServerProps) {
  if (props.id === undefined || props.id === null) return null;
  return <ArticleWorkflowControlsClient articleId={String(props.id)} />;
}
