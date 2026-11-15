import type { BeforeDocumentControlsServerProps } from "payload";

import ClaimVerificationControlsClient from "./ClaimVerificationControlsClient";

export default function ClaimVerificationControlsServer(props: BeforeDocumentControlsServerProps) {
  if (props.id === undefined || props.id === null) return null;
  return <ClaimVerificationControlsClient claimId={String(props.id)} />;
}
