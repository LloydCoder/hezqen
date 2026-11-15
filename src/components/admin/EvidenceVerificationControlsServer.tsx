import type { BeforeDocumentControlsServerProps } from "payload";

import EvidenceVerificationControlsClient from "./EvidenceVerificationControlsClient";

export default function EvidenceVerificationControlsServer(props: BeforeDocumentControlsServerProps) {
  if (props.id === undefined || props.id === null) return null;
  return <EvidenceVerificationControlsClient evidenceId={String(props.id)} />;
}
