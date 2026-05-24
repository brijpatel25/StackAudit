"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AuditResultsClient from "./AuditResultsClient"

export default function AuditPage() {
  const params = useParams()
  const auditId = params?.id as string
  return <AuditResultsClient auditId={auditId} />
}
