import React from "react";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/** TAF-01 | Training Activation Form | React-PDF template */
export type TafPdfData = {
  tafNumber: string;
  revision?: string;
  generatedAt: string;
  documentOwner?: string;
  client: {
    legalName: string;
    billingAddress?: string | null;
    gstin?: string | null;
    contactName?: string | null;
    contactRole?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    nletaCoordinator?: string | null;
    trainingLocation?: string | null;
  };
  ptaReference?: string | null;
  ptaAcceptanceDate?: string | null;
  ftoReference?: string | null;
  ftoRevision?: string | null;
  ftoAcceptanceDate?: string | null;
  tspReference?: string | null;
  engagementId?: string | null;
  batchId?: string | null;
  programs: Array<{
    code: string;
    title: string;
    revision?: string | null;
    mode?: string | null;
    duration?: string | number | null;
    batchOrHeadcount?: string | null;
    dateAndTime?: string | null;
  }>;
  readiness: Array<{ check: string; status: string; reference?: string | null }>;
  commercial: {
    approvedTotal?: string | null;
    taxesAndTotal?: string | null;
    advanceDueReceivedDate?: string | null;
    paymentEvidence?: string | null;
    balanceMilestone?: string | null;
    logistics?: string | null;
    creditException?: string | null;
  };
  activation: {
    status?: string | null;
    effectiveDate?: string | null;
    approvedBatchIds?: string | null;
    pendingItems?: string | null;
    approverName?: string | null;
    approvalEvidence?: string | null;
  };
  changeControl?: {
    changeType?: string | null;
    reason?: string | null;
    revisedArrangement?: string | null;
    commercialImpact?: string | null;
    clientApproval?: string | null;
    reactivationRequired?: string | null;
  };
  postDelivery?: {
    deliveryDates?: string | null;
    participants?: string | null;
    tarReference?: string | null;
    atrReference?: string | null;
    ctrReference?: string | null;
    tcrReference?: string | null;
    openActions?: string | null;
  };
  signoff?: Array<{
    role: string;
    name?: string | null;
    signatureReference?: string | null;
    date?: string | null;
  }>;
  filingNotes?: string | null;
};

const NAVY = "#173F68";
const BORDER = "#707070";
const TEXT = "#111111";
const MUTED = "#475569";
const styles = StyleSheet.create({
  page: { paddingTop: 151, paddingBottom: 86, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 8, color: TEXT, lineHeight: 1.25 },
  header: { position: "absolute", top: 0, left: 0, width: 595.28, height: 145, objectFit: "contain" },
  title: { textAlign: "center", fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  subtitle: { textAlign: "center", fontSize: 8.5, fontStyle: "italic", marginBottom: 9 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  paragraph: { fontSize: 7.8, lineHeight: 1.25, textAlign: "justify", marginBottom: 4 },
  table: { borderWidth: 0.7, borderColor: BORDER, marginBottom: 5 },
  row: { flexDirection: "row" },
  cell: { paddingVertical: 3, paddingHorizontal: 4, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderRightColor: BORDER, borderBottomColor: BORDER },
  head: { backgroundColor: "#DCEAF4", fontWeight: "bold", fontSize: 7.4 },
  cellText: { fontSize: 7.2, lineHeight: 1.15 },
  footer: { position: "absolute", bottom: 14, left: 40, right: 40, borderTopWidth: 1.2, borderTopColor: NAVY, paddingTop: 5, fontSize: 6.5, color: MUTED, textAlign: "center" },
  note: { fontSize: 7.2, color: MUTED, marginTop: 2 },
});

const val = (v: unknown, fallback = "[Not provided]") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

function Table({ headers, rows, widths }: { headers: string[]; rows: string[][]; widths: string[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.row} wrap={false}>
        {headers.map((h, i) => <View key={`h-${i}`} style={[styles.cell, styles.head, { width: widths[i] }]}><Text>{h}</Text></View>)}
      </View>
      {rows.map((row, ri) => (
        <View key={`r-${ri}`} style={styles.row} wrap={false}>
          {row.map((cell, ci) => <View key={`c-${ri}-${ci}`} style={[styles.cell, { width: widths[ci] }]}><Text style={styles.cellText}>{cell}</Text></View>)}
        </View>
      ))}
    </View>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return <View style={styles.section} wrap><Text style={styles.sectionTitle}>{n}. {title}</Text>{children}</View>;
}

export default function TafPdfTemplate({ data, headerImageData }: { data: TafPdfData; headerImageData: string }) {
  const programRows = data.programs.length
    ? data.programs.map((p, i) => [String(i + 1), `${p.code} — ${p.title}`, val(p.revision), val(p.mode), val(p.duration), val(p.batchOrHeadcount), val(p.dateAndTime)])
    : [["1", "[As per accepted FTO]", "[Rev.]", "[ON/OF/HY]", "[Hours/days]", "[Batch/headcount]", "[Schedule]"]];
  const readinessRows = data.readiness.length
    ? data.readiness.map((r) => [r.check, val(r.status, "☐ Yes  ☐ No"), val(r.reference)])
    : [
        ["PTA-01 signed or formally accepted", "☐ Yes  ☐ No  ☐ N.A.", "[Reference/date]"],
        ["FTО issued, scope confirmed and accepted", "☐ Yes  ☐ No", "[FTO/revision/date]"],
        ["Client legal, billing and contact details verified", "☐ Yes  ☐ No", "[Notes]"],
        ["Program codes, specification, audience and prerequisites confirmed", "☐ Yes  ☐ No", "[Programme/spec. reference]"],
        ["Mode, venue/platform, schedule, duration, batch count and trainer confirmed", "☐ Yes  ☐ No", "[Schedule/trainer assignment]"],
        ["Participant cap, language, outcomes and assessment criteria confirmed", "☐ Yes  ☐ No", "[Approved programme spec.]"],
        ["Fee, discount, taxes and payment milestones match accepted FTO", "☐ Yes  ☐ No", "[Commercial check]"],
        ["Advance/payment milestone verified or credit terms recorded", "☐ Yes  ☐ No", "[Invoice/receipt/approval]"],
        ["Materials, platform, equipment and venue ready where applicable", "☐ Yes  ☐ No  ☐ N.A.", "[Notes]"],
        ["Site access, induction, emergency arrangements and safety confirmed", "☐ Yes  ☐ No  ☐ N.A.", "[Notes]"],
        ["Participant data sharing and notices confirmed where required", "☐ Yes  ☐ No  ☐ Pending", "[Data handling reference]"],
        ["Attendance method and TAR-01 record owner confirmed", "☐ Yes  ☐ No", "[Owner/process]"],
        ["Assessment, result reporting and certificate controls confirmed", "☐ Yes  ☐ No", "[Programme spec./criteria]"],
        ["Client deliverables and handover expectations confirmed", "☐ Yes  ☐ No", "[Deliverables schedule]"],
        ["Special conditions, deviations or change orders documented", "☐ Yes  ☐ No  ☐ N.A.", "[Approval reference]"],
      ];
  const signoffs = data.signoff?.length ? data.signoff : [
    { role: "Prepared — Training Coordinator" },
    { role: "Reviewed — Commercial / Operations" },
    { role: "Approved — Authorized NLETA Approver" },
    { role: "Client acknowledgement, if required by contract" },
  ];

  return (
    <Document title={`TAF-01 Training Activation Form ${data.tafNumber}`} author="National Lift Escalator Testing Agency (NLETA)" subject="TAF-01 | Training Activation Form">
      <Page size="A4" style={styles.page} wrap>
        <Image src={headerImageData} style={styles.header} fixed />
        <Text style={styles.title}>TAF-01</Text>
        <Text style={styles.title}>TRAINING ACTIVATION FORM</Text>
        <Text style={styles.subtitle}>Engagement &amp; Batch Readiness / Approval Record | Revision {data.revision || "1"}</Text>

        <Section n={0} title="Document Control">
          <Table headers={["Document Control", "Entry"]} widths={["42%", "58%"]} rows={[
            ["Document code / revision", `TAF-01 / Rev.${data.revision || "1"}`],
            ["Document owner", data.documentOwner || "Training Operations"],
            ["Record type", "Controlled engagement and batch activation record"],
            ["Status", "Generated record — pending completion / approval as applicable"],
            ["TAF reference number", data.tafNumber],
          ]} />
        </Section>

        <Section n={1} title="Purpose and Control Principle">
          <Text style={styles.paragraph}>TAF-01 records readiness, verification and formal activation approval for a specific training engagement or batch. It is completed only after the applicable commercial and contractual documents are accepted. TAF-01 does not create a new quotation, amend the agreed scope or override the accepted agreement. No batch may commence unless the activation status is APPROVED and all mandatory prerequisites are satisfied or expressly waived in writing by an authorised NLETA approver within their authority.</Text>
          <Text style={styles.paragraph}>Controlled workflow: CLP-00 Corporate Learning Portfolio → TSP-01 Training Selection Proposal → PTA-01 Professional Training Agreement → FTO-01 Final Training Offer → TAF-01 activation approval → delivery → TAR-01 attendance record → ATR-01 assessment and training result report → CTR-01 certificate of training result, where applicable → TCR-01 training closure report.</Text>
        </Section>

        <Section n={2} title="Client, Contract and Coordination Details">
          <Table headers={["Field", "Details"]} widths={["48%", "52%"]} rows={[
            ["Client legal entity name", val(data.client.legalName)],
            ["Registered / billing address and GSTIN", `${val(data.client.billingAddress)} | GSTIN: ${val(data.client.gstin, "N.A.")}`],
            ["PTA-01 reference and acceptance date", `${val(data.ptaReference)} / ${val(data.ptaAcceptanceDate)}`],
            ["FTO reference, revision and acceptance date", `${val(data.ftoReference)} / ${val(data.ftoRevision)} / ${val(data.ftoAcceptanceDate)}`],
            ["TSP-01 reference", val(data.tspReference)],
            ["TAF reference number", data.tafNumber],
            ["Client coordinator", `${val(data.client.contactName)} / ${val(data.client.contactRole)} / ${val(data.client.contactEmail)} / ${val(data.client.contactPhone)}`],
            ["NLETA coordinator", val(data.client.nletaCoordinator)],
            ["Internal engagement ID / batch ID", `${val(data.engagementId)} / ${val(data.batchId)}`],
            ["Training location / online platform", val(data.client.trainingLocation)],
          ]} />
        </Section>

        <Section n={3} title="Approved Program and Batch Schedule">
          <Text style={styles.paragraph}>List only programmes, participant limits, delivery modes and deliverables included in the accepted FTO. A new or expanded programme must not be added informally to this form.</Text>
          <Table headers={["No.", "Programme code / title", "Spec. rev.", "Mode", "Duration", "Batch / headcount", "Date & time"]} widths={["5%", "23%", "10%", "10%", "11%", "19%", "22%"]} rows={programRows} />
          <Text style={styles.note}>Mode key: ON = online; OF = offline/onsite; HY = hybrid. Confirm programme specification, intended audience, prerequisites, language, learning outcomes and assessment approach before activation.</Text>
        </Section>

        <Section n={4} title="Mandatory Readiness Checklist">
          <Table headers={["Control / check", "Status", "Reference / notes"]} widths={["48%", "20%", "32%"]} rows={readinessRows} />
        </Section>

        <Section n={5} title="Commercial and Payment Verification">
          <Table headers={["Commercial control", "Entry / verification"]} widths={["52%", "48%"]} rows={[
            ["FTO approved total (excluding taxes, if separately stated)", val(data.commercial.approvedTotal, "₹ [amount]")],
            ["Applicable taxes and total payable", val(data.commercial.taxesAndTotal, "₹ [amount / as per FTO]")],
            ["Advance due / received / date", val(data.commercial.advanceDueReceivedDate, "₹ [amount] / [date]")],
            ["Payment evidence / invoice reference", val(data.commercial.paymentEvidence)],
            ["Balance milestone", val(data.commercial.balanceMilestone, "[Exactly as stated in FTO]")],
            ["Travel, boarding, lodging and local conveyance", val(data.commercial.logistics, "☐ Included  ☐ At actuals  ☐ Separately approved  ☐ N.A.")],
            ["Credit/payment exception", val(data.commercial.creditException, "None / written approval reference")],
          ]} />
          <Text style={styles.paragraph}>The reviewer must not change the fee, discount, taxes, expense treatment or payment milestones through TAF-01. Any commercial change requires a revised FTO or written change order accepted by authorised representatives before the affected work proceeds.</Text>
        </Section>

        <Section n={6} title="Activation Decision">
          <Table headers={["Decision item", "Record"]} widths={["42%", "58%"]} rows={[
            ["Activation status", val(data.activation.status, "☐ APPROVED — activate as scheduled  ☐ HOLD  ☐ NOT APPROVED")],
            ["Activation effective date", val(data.activation.effectiveDate, "[Date]")],
            ["Approved programme / batch IDs", val(data.activation.approvedBatchIds, "[ID(s)]")],
            ["Mandatory pending items, owner and due date", val(data.activation.pendingItems, "None / [List each item]")],
            ["Approver name / designation", val(data.activation.approverName, "[Name / designation]")],
            ["Approval evidence", val(data.activation.approvalEvidence, "[Signature or dated email/workflow reference]")],
          ]} />
          <Text style={styles.paragraph}>APPROVED: the engagement/batch may proceed within the accepted FTO and recorded schedule. HOLD or NOT APPROVED: delivery must not commence. A batch on HOLD may proceed only after outstanding mandatory items are resolved and approval is recorded.</Text>
        </Section>

        <Section n={7} title="Change, Postponement, Cancellation or Additional Batch">
          <Table headers={["Field", "Details"]} widths={["42%", "58%"]} rows={[
            ["Change type", val(data.changeControl?.changeType, "☐ Schedule  ☐ Venue/platform  ☐ Trainer  ☐ Participant count  ☐ Scope  ☐ Fee  ☐ Deliverables  ☐ Postponement  ☐ Cancellation  ☐ Additional batch")],
            ["Reason and original batch reference", val(data.changeControl?.reason)],
            ["Proposed revised arrangement", val(data.changeControl?.revisedArrangement)],
            ["Commercial impact", val(data.changeControl?.commercialImpact, "☐ None  ☐ Revised FTO / change order required")],
            ["Client approval reference/date", val(data.changeControl?.clientApproval)],
            ["Re-activation required?", val(data.changeControl?.reactivationRequired, "☐ Yes  ☐ No — rationale: [details]")],
          ]} />
          <Text style={styles.paragraph}>Changes affecting scope, fees, delivery mode, location, participant cap, duration, assessment, deliverables or agreed dates must be approved in writing under the applicable contract terms. Where activation readiness materially changes, issue a revised TAF-01 or a new TAF-01 linked to the original record.</Text>
        </Section>

        <Section n={8} title="Post-Delivery Record Links">
          <Text style={styles.paragraph}>Complete this section after delivery or maintain the final references in the engagement file. TAF-01 authorises activation; it does not itself certify attendance, competence or successful completion.</Text>
          <Table headers={["Post-delivery control", "Reference / status"]} widths={["52%", "48%"]} rows={[
            ["Delivery date(s) and batch ID(s)", val(data.postDelivery?.deliveryDates)],
            ["Participants registered / attended", val(data.postDelivery?.participants)],
            ["TAR-01 Attendance Register reference", val(data.postDelivery?.tarReference)],
            ["ATR-01 Assessment & Training Result Report", val(data.postDelivery?.atrReference)],
            ["CTR-01 Certificate of Training Result", val(data.postDelivery?.ctrReference)],
            ["TCR-01 Training Closure Report reference/date", val(data.postDelivery?.tcrReference)],
            ["Open actions, owner and due date", val(data.postDelivery?.openActions)],
          ]} />
        </Section>

        <Section n={9} title="Roles, Review and Sign-off">
          <Table headers={["Role", "Name / designation", "Signature or written approval reference", "Date"]} widths={["27%", "23%", "32%", "18%"]} rows={signoffs.map((s) => [s.role, val(s.name), val(s.signatureReference), val(s.date)])} />
          <Text style={styles.note}>Client acknowledgement records receipt or agreement only to the extent stated in the applicable contract; it does not automatically waive rights or alter the PTA/FTO.</Text>
        </Section>

        <Section n={10} title="Filing, Confidentiality and Record Control">
          <Text style={styles.paragraph}>{val(data.filingNotes, "File the completed TAF-01 and supporting records in the controlled client engagement folder with the relevant PTA-01, accepted FTO, TSP-01, programme specification, invoice/payment evidence, trainer assignment, approved changes, TAR-01, ATR-01, CTR-01 where applicable, and TCR-01. Limit access to authorised personnel, use approved secure channels for participant data, and apply NLETA’s approved retention and disposal rules and applicable law. For commercial matters, the executed PTA-01 and accepted FTO, together with any valid signed change order, govern contractual commitments. TAF-01 records activation readiness and approval and must not be used to contradict those documents.")}</Text>
          <Text style={styles.paragraph}>NLETA’s training records and certificates evidence only the training, attendance and assessment status actually recorded. They do not by themselves constitute a statutory licence, government-issued qualification, regulated-work authorisation, third-party inspection certificate or blanket guarantee of legal/regulatory compliance.</Text>
        </Section>

        <Text style={[styles.subtitle, { marginTop: 4, fontWeight: "bold", fontStyle: "normal" }]}>ASSESS → IMPROVE → PROTECT → GOVERN → SUSTAIN</Text>
        <Text style={styles.footer} fixed>Control footer: NLETA | TAF-01 | Rev.{data.revision || "1"} | {data.tafNumber}</Text>
      </Page>
    </Document>
  );
}
