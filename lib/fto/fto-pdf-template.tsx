import React from "react";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * FTO-01 | Revision 1
 * React-PDF implementation based on the supplied NLETA Final Training Offer DOCX.
 *
 * Keep this file at: lib/fto/fto-pdf-template.tsx
 * Header asset: public/nleta-fto-header.png
 */

export type FtoPdfData = {
  ftoNumber: string;
  issueDate: string;
  validUntil: string;
  clientPoNumber: string | null;
  jurisdiction: string;

  client: {
    organisation: string | null;
    billingAddress: string | null;
    gstin: string | null;
    contactName: string | null;
    designation: string | null;
    email: string | null;
    phone: string | null;
    trainingLocation: string | null;
  };

  programs: {
    programCode: string;
    programTitle: string;
    audience: string | null;
    duration: string | number | null;
    deliveryMode: string | null;
    participants: number;
    batches: number;
    pricePerBatch: string;
    totalAmount: string;
    batchSize: number | null;
  }[];

  subtotal: string;
  discountPercent: string;
  discountAmount: string;
  taxableAmount: string;
  gstPercent: string;
  gstAmount: string;
  logisticsCharges: string;
  otherCharges: string;
  grandTotal: string;

  confirmedTrainingSchedule: unknown;
  dailyTrainingTiming: unknown;
  paymentMilestones: unknown;
  logisticsTreatment: unknown;
  terms: unknown;
  specialRemarks: unknown;
};

const NAVY = "#173F68";
const NAVY_DARK = "#123553";
const BLUE = "#245987";
const PALE_BLUE = "#E8EEF4";
const BORDER = "#707070";
const TEXT = "#111111";
const MUTED = "#475569";
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  page: {
    paddingTop: 153,
    paddingBottom: 92,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 8.4,
    color: TEXT,
    lineHeight: 1.28,
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595.28,
    height: 145,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 42,
    right: 42,
    borderTopWidth: 1.4,
    borderTopColor: NAVY,
    paddingTop: 7,
    fontSize: 6.8,
    lineHeight: 1.25,
    color: TEXT,
  },
  footerTop: { flexDirection: "row", borderWidth: 0.7, borderColor: BORDER },
  footerCell: {
    width: "50%",
    padding: 4,
    borderRightWidth: 0.7,
    borderRightColor: BORDER,
  },
  footerPresence: {
    textAlign: "center",
    fontSize: 6.6,
    fontWeight: "bold",
    marginTop: 4,
  },
  documentTitle: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8.8,
    fontStyle: "italic",
    marginBottom: 10,
  },
  section: { marginBottom: 9 },
  sectionTitle: {
    fontSize: 9.1,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 8.1,
    lineHeight: 1.28,
    textAlign: "justify",
    marginBottom: 4,
  },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 10 },
  bullet: { width: 10, fontSize: 8.2 },
  bulletText: { flex: 1, fontSize: 8.1, lineHeight: 1.25, textAlign: "justify" },
  table: { borderWidth: 0.7, borderColor: BORDER, marginBottom: 5 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: NAVY,
    color: WHITE,
  },
  tableRow: { flexDirection: "row" },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRightColor: BORDER,
    borderBottomColor: BORDER,
    justifyContent: "center",
  },
  cellText: { fontSize: 7.5, lineHeight: 1.15 },
  headerText: { color: WHITE, fontSize: 7.5, fontWeight: "bold" },
  keyCell: { width: "38%", backgroundColor: "#F7F9FB" },
  valueCell: { width: "62%" },
  docKey: { width: "42%" },
  docValue: { width: "58%" },
  programNo: { width: "5%" },
  programName: { width: "24%" },
  programAudience: { width: "15%" },
  programMode: { width: "14%" },
  programDuration: { width: "14%" },
  programBatch: { width: "14%" },
  programBatches: { width: "14%" },
  commercialNo: { width: "6%" },
  commercialName: { width: "34%" },
  commercialMode: { width: "13%" },
  commercialBatches: { width: "12%" },
  commercialRate: { width: "17%" },
  commercialTotal: { width: "18%" },
  scheduleKey: { width: "42%" },
  scheduleValue: { width: "58%" },
  amountLabel: { width: "76%", padding: 3, textAlign: "right" },
  amountValue: { width: "24%", padding: 3, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: PALE_BLUE,
    borderTopWidth: 0.8,
    borderTopColor: NAVY,
  },
  totalText: { fontSize: 9.2, fontWeight: "bold", color: NAVY },
  checklistItem: { width: "86%", padding: 4 },
  checklistStatus: { width: "14%", padding: 4, textAlign: "center" },
  signatureTable: { borderWidth: 0.7, borderColor: BORDER, marginTop: 7 },
  signatureHeader: { flexDirection: "row", backgroundColor: NAVY },
  signatureHeadCell: {
    width: "50%",
    color: WHITE,
    padding: 5,
    fontSize: 8.2,
    fontWeight: "bold",
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  signatureRow: { flexDirection: "row" },
  signatureCell: {
    width: "50%",
    minHeight: 26,
    padding: 5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRightColor: BORDER,
    borderBottomColor: BORDER,
    fontSize: 8,
  },
  smallNote: { fontSize: 7.4, color: MUTED, marginTop: 2 },
});

function valueText(value: unknown, fallback = "Not provided"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => valueText(item, "")).filter(Boolean).join("\n");
  try {
    return JSON.stringify(value, null, 2) ?? fallback;
  } catch {
    return String(value);
  }
}

function dateText(value: string): string {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function money(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return valueText(value);
  return `₹ ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section} wrap>
      <Text style={styles.sectionTitle}>{number}. {title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function DataTable({
  headers,
  rows,
  widths,
}: {
  headers: string[];
  rows: string[][];
  widths: string[];
}) {
  return (
    <>
      {/* Keep the header together, but let the table rows flow onto the
          current page and continue on the next page when space runs out. */}
      <View style={styles.tableHeader} wrap={false}>
        {headers.map((header, index) => (
          <View
            key={`${header}-${index}`}
            style={[
              styles.cell,
              {
                width: widths[index],
                borderTopWidth: 0.7,
                borderLeftWidth: index === 0 ? 0.7 : 0,
                borderTopColor: BORDER,
                borderLeftColor: BORDER,
              },
            ]}
          >
            <Text style={styles.headerText}>{header}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.tableRow} wrap={false}>
          {row.map((cell, cellIndex) => (
            <View
              key={`cell-${rowIndex}-${cellIndex}`}
              style={[
                styles.cell,
                {
                  width: widths[cellIndex],
                  borderLeftWidth: cellIndex === 0 ? 0.7 : 0,
                  borderLeftColor: BORDER,
                },
              ]}
            >
              <Text style={styles.cellText}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
      {/* Bottom rule for the final row; individual cell borders keep the
          table visibly separated when it continues on another page. */}
    </>
  );
}

function KeyValueTable({ rows }: { rows: [string, unknown][] }) {
  return (
    <View style={styles.table}>
      {rows.map(([label, value], index) => (
        <View key={`${label}-${index}`} style={styles.tableRow} wrap={false}>
          <View style={[styles.cell, styles.keyCell]}>
            <Text style={[styles.cellText, { fontWeight: "bold" }]}>{label}</Text>
          </View>
          <View style={[styles.cell, styles.valueCell]}>
            <Text style={styles.cellText}>{valueText(value)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TermsBlock({ value }: { value: unknown }) {
  const text = valueText(value, "");
  if (!text) return null;
  return <Paragraph>{text}</Paragraph>;
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerTop}>
        <View style={styles.footerCell}>
          <Text>WEB: www.nleta.org.in</Text>
          <Text>REGD. HEAD OFFICE: A-32, Commercial Complex, Govindpuram, Ghaziabad, Uttar Pradesh – 201013</Text>
        </View>
        <View style={[styles.footerCell, { borderRightWidth: 0 }]}>
          <Text>EMAIL: info@nleta.org.in, inspnleta@gmail.com, legalnleta@gmail.com</Text>
          <Text>TELEPHONE: +91 99900 58799 • +91 99900 29597 • +91 92116 93664</Text>
        </View>
      </View>
      <Text style={styles.footerPresence}>
        REGIONAL SERVICE PRESENCE: Uttar Pradesh • Haryana • Delhi NCR • Punjab • Himachal Pradesh • Maharashtra (Mumbai, Pune) • Telangana (Hyderabad)
      </Text>
    </View>
  );
}

export default function FtoPdfTemplate({
  data,
  headerImagePath,
}: {
  data: FtoPdfData;
  headerImagePath: string;
}) {
  const programRows = data.programs.length
    ? data.programs.map((program, index) => [
        String(index + 1),
        `${program.programCode}\n${program.programTitle}`,
        valueText(program.audience),
        valueText(program.deliveryMode),
        valueText(program.duration),
        valueText(program.batchSize),
        String(program.batches),
      ])
    : [["1", "No programme selected", "-", "-", "-", "-", "-"]];

  const commercialRows = data.programs.length
    ? data.programs.map((program, index) => [
        String(index + 1),
        `${program.programCode} - ${program.programTitle}`,
        valueText(program.deliveryMode),
        String(program.batches),
        money(program.pricePerBatch),
        money(program.totalAmount),
      ])
    : [["1", "No programme selected", "-", "-", "-", "-", ""]];

  const discountLine = data.discountAmount
    ? `- ${money(data.discountAmount)}`
    : money(0);

  const scheduleRows: [string, unknown][] = [
    ["Proposed training date(s)", data.confirmedTrainingSchedule],
    ["Daily timing and time zone", data.dailyTrainingTiming],
    ["Delivery mode", data.programs.map((p) => p.deliveryMode).filter(Boolean).join(", ") || "Not provided"],
    ["Batch plan / participant cap", data.programs.map((p) => `${p.programCode}: ${p.participants} participants; batch size ${p.batchSize ?? "Not specified"}; ${p.batches} batch(es)`).join("\n")],
    ["NLETA coordinator", "To be confirmed by NLETA"],
    ["Client coordinator", data.client.contactName],
  ];

  return (
    <Document
      title={`Final Training Offer ${data.ftoNumber}`}
      author="National Lift Escalator Testing Agency (NLETA)"
      subject="FTO-01 | Revision 1 | Corporate Training Engagement"
    >
      <Page size="A4" style={styles.page} wrap>
        <Image src={headerImagePath} style={styles.headerImage} fixed />
        <Text style={styles.documentTitle}>FINAL TRAINING OFFER</Text>
        <Text style={styles.subtitle}>Revision 1 | Corporate Training Engagement</Text>

        <Section number=" " title="Document Control and Offer Details">
          <DataTable
            headers={["Document Control", "Offer Details"]}
            widths={["42%", "58%"]}
            rows={[
              ["Document Code", "FTO-01"],
              ["Revision / Status", "Rev.1 — Approved master template for client-specific issue"],
              ["Offer Number", data.ftoNumber],
              ["Issue Date", dateText(data.issueDate)],
              ["Offer Valid Until", data.validUntil ? dateText(data.validUntil) : "30 calendar days from the issue date"],
              ["Prepared By", "National Lift Escalator Testing Agency (NLETA)"],
            ]}
          />
        </Section>

        <Section number="1" title="Client and Engagement Details">
          <DataTable
            headers={["Field", "Details"]}
            widths={["42%", "58%"]}
            rows={[
              ["Client / Organization", valueText(data.client.organisation)],
              ["Registered / Billing Address", valueText(data.client.billingAddress)],
              ["GSTIN (if applicable)", valueText(data.client.gstin, "Not applicable")],
              ["Authorized Contact", `${valueText(data.client.contactName)}, ${valueText(data.client.designation)}`],
              ["Email / Mobile", `${valueText(data.client.email)} / ${valueText(data.client.phone)}`],
              ["Training Location / Platform", valueText(data.client.trainingLocation)],
              ["Client Reference / PO No.", valueText(data.clientPoNumber, "Not applicable")],
            ]}
          />
        </Section>

        <Section number="2" title="Purpose and Commercial Status">
          <Paragraph>
            This Final Training Offer (FTO-01) confirms the client-specific training scope, delivery plan,
            commercial value and engagement conditions offered by NLETA. It is prepared against the
            client’s requirements and program(s) selections recorded in TSP-01 and the Corporate Learning
            Portfolio CLP-00. This offer becomes the commercial basis for delivery when accepted in writing
            by both parties and the applicable onboarding/activation requirements are completed. This is a
            corporate training offer. It does not constitute an offer for lift/escalator maintenance, manpower
            supply, statutory inspection, engineering certification, or a blanket declaration of legal or
            regulatory compliance.
          </Paragraph>
        </Section>

        <Section number="3" title="Selected Program(s) and Delivery Plan">
          <DataTable
            headers={["No.", "Program(s) Code / Title", "Audience / Level", "Mode", "Duration", "Batch Size", "No. of Batches"]}
            widths={["5%", "24%", "15%", "14%", "14%", "14%", "14%"]}
            rows={programRows}
          />
          <Paragraph>
            Only the program(s), durations, delivery modes, batch counts and deliverables expressly listed
            in this offer are included. Any additional program(s), repeat session, extended duration,
            additional batch or material change requires written approval and may be separately charged.
          </Paragraph>
        </Section>

        <Section number="4" title="Scope and Included Deliverables">
          <Paragraph>Unless a programme-specific line in this offer states otherwise, the fee includes:</Paragraph>
          <Bullet>Program(s) delivery by an assigned trainer/facilitator for the agreed duration and mode.</Bullet>
          <Bullet>Standard learning materials or session resources considered appropriate by NLETA for the selected program(s).</Bullet>
          <Bullet>Attendance record for the scheduled session(s), based on the attendance information available.</Bullet>
          <Bullet>Assessment or knowledge check where included in the selected program design.</Bullet>
          <Bullet>Results/assessment status where an assessment is conducted and results can reasonably be recorded.</Bullet>
          <Bullet>QR-verifiable NLETA training participation/completion certificate, subject to the program’s attendance and assessment requirements.</Bullet>
          <Bullet>A brief training closure summary for the agreed engagement.</Bullet>
          <Paragraph>
            The offer does not include external accreditation, a government-issued qualification, a statutory
            license, or third-party certification unless explicitly identified in writing with the relevant
            authorization and issuer. Certificates indicate only the participation/completion status stated on
            the certificate and do not, by themselves, establish legal compliance, job competency for every
            task, or authorization to perform regulated work.
          </Paragraph>
        </Section>

        <Section number="5" title="Commercial Summary">
          <DataTable
            headers={["No.", "Programme Code / Title", "Mode", "Batches", "Fee per Batch (₹)", "Line Total (₹)"]}
            widths={["6%", "34%", "13%", "12%", "17%", "18%"]}
            rows={commercialRows}
          />
          <View style={styles.table}>
            {[
              ["Subtotal", money(data.subtotal)],
              [`Multi-program discount (${data.discountPercent}% if applicable)`, discountLine],
              ["Taxable value after discount", money(data.taxableAmount)],
              [`GST / applicable taxes (${data.gstPercent}%)`, money(data.gstAmount)],
              ["Travel, boarding, lodging, local conveyance and other approved logistics (actuals)", data.logisticsCharges ? money(data.logisticsCharges) : "Amount / To be billed at actuals"],
              ["Other approved charges", money(data.otherCharges)],
            ].map(([label, amount], index) => (
              <View key={`amount-${index}`} style={styles.tableRow} wrap={false}>
                <View style={[styles.cell, { width: "76%" }]}>
                  <Text style={styles.cellText}>{label}</Text>
                </View>
                <View style={[styles.cell, { width: "24%" }]}>
                  <Text style={styles.cellText}>{amount}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totalRow} wrap={false}>
              <View style={[styles.cell, { width: "76%", borderBottomWidth: 0 }]}>
                <Text style={styles.totalText}>TOTAL OFFER VALUE</Text>
              </View>
              <View style={[styles.cell, { width: "24%", borderBottomWidth: 0 }]}>
                <Text style={styles.totalText}>{money(data.grandTotal)}</Text>
              </View>
            </View>
          </View>
          <Paragraph>
            The client-specific amounts entered in this table constitute the offered price for this engagement.
            Amounts must be completed before the offer is issued to the client. No amount is payable merely
            because it appears as a blank or placeholder in this template.
          </Paragraph>
        </Section>

        <Section number="6" title="Pricing Basis and Multi-Programs Discount">
          <Bullet>Pricing is determined by the selected program(s), agreed duration, delivery mode, batch size/category, number of batches, customization, assessment/certificate requirements and any expressly agreed additional services.</Bullet>
          <Bullet>The indicative reference fees in Annexure A are reference points only. The final client-specific fees are the amounts recorded in this FTO-01.</Bullet>
          <Bullet>For a single engagement, a 5% discount applies to the training-fee subtotal when two program(s) are booked together; a 10% discount applies to the training-fee subtotal when three or more program(s) are booked together.</Bullet>
          <Bullet>The multi-program discount applies to training fees only. It does not apply to taxes, travel, boarding, lodging, local conveyance, venue, third-party charges or other approved pass-through expenses.</Bullet>
          <Bullet>Only one multi-program discount tier applies to the engagement. Discounts are not cumulative with another discount unless NLETA expressly confirms otherwise in writing.</Bullet>
          <Bullet>A change in batch size, number of batches, delivery mode, duration, program content or delivery location may require a revised fee and written acceptance before the changed work begins.</Bullet>
        </Section>

        <Section number="7" title="Delivery Schedule and Confirmation">
          <DataTable
            headers={["Item", "Agreed Details"]}
            widths={["42%", "58%"]}
            rows={scheduleRows.map(([label, value]) => [label, valueText(value)])}
          />
          <Paragraph>
            Dates are treated as confirmed only after written acceptance of this offer, receipt of the advance
            payment, and completion of any applicable onboarding/activation requirements. Where a schedule
            is not yet final, the parties will confirm it in writing. NLETA will make reasonable efforts to
            accommodate agreed dates, subject to trainer availability and operational feasibility.
          </Paragraph>
        </Section>

        <Section number="8" title="Payment Terms">
          <Bullet>50% of the training-fee value, together with any agreed advance expenses, is payable upon written acceptance of this offer to secure scheduling and initiate activation.</Bullet>
          <Bullet>The remaining 50% of the training-fee value is payable before commencement of the final scheduled batch. Where the engagement consists of one batch only, the balance is payable before that batch begins.</Bullet>
          <Bullet>Approved travel, boarding, lodging, local conveyance, venue and other pass-through expenses may be invoiced separately at actual cost, supported by reasonable details or receipts where available. Where an advance for such expenses is requested, it must be stated in the commercial summary or separately agreed in writing.</Bullet>
          <Bullet>Invoices are payable within 7 calendar days of the invoice date, unless a different written payment term is expressly stated in this offer. The advance and pre-final-batch milestones above take precedence for the training-fee instalments.</Bullet>
          <Bullet>NLETA may defer commencement or suspend scheduling if a due payment remains unpaid after written notice. Any resulting schedule change will be coordinated with the client; this clause does not create an unstated penalty or interest charge.</Bullet>
          <Bullet>All payments must be made to the bank account or payment channel identified on NLETA’s official invoice. Cash payment to individual trainers or representatives is not accepted unless NLETA authorizes it in writing.</Bullet>
          <TermsBlock value={data.paymentMilestones} />
        </Section>

        <Section number="9" title="Taxes, Travel and Logistics">
          <Paragraph>
            Applicable GST and other statutory taxes will be charged in accordance with law and shown on
            the invoice. For onsite or hybrid delivery, travel, boarding, lodging and local conveyance for
            NLETA personnel, as well as venue, equipment or other client-specific logistics not expressly
            included in the training fee, are payable by the client at actuals. Such expenses will be disclosed
            in this offer where known or agreed separately in writing before being incurred. No unlisted fixed
            logistics fee is imposed by this template.
          </Paragraph>
          <TermsBlock value={data.logisticsTreatment} />
        </Section>

        <Section number="10" title="Cancellation, Postponement and Rescheduling">
          <Bullet>Either party should notify the other in writing as soon as it becomes aware that a scheduled session cannot proceed.</Bullet>
          <Bullet>The client may request rescheduling by giving at least 72 hours’ written notice before the scheduled start. NLETA will make reasonable efforts to provide an alternative date, subject to trainer availability.</Bullet>
          <Bullet>Requests made with less than 72 hours’ notice will be considered case by case. No automatic cancellation fee or penalty applies under this master offer.</Bullet>
          <Bullet>If NLETA must reschedule for reasons within its reasonable control, NLETA will offer a mutually suitable replacement date. If no reasonable replacement date can be agreed, the parties will settle any prepaid amount for undelivered training fairly, after deducting only documented, non-recoverable costs previously approved by the client.</Bullet>
          <Bullet>If the client cancels after NLETA has incurred client-approved, non-recoverable third-party expenses, the client will reimburse those documented expenses. No additional cancellation charge applies unless separately and expressly agreed in writing before the engagement.</Bullet>
          <Bullet>Where a session is interrupted by a safety issue, site-access restriction, connectivity failure, force majeure event or other circumstance beyond a party’s reasonable control, the parties will work in good faith to reschedule or agree an appropriate delivery adjustment.</Bullet>
        </Section>

        <Section number="11" title="Client Responsibilities">
          <Bullet>Nominate a coordinator and provide accurate participant names, roles and contact details needed for scheduling, attendance and certificate administration.</Bullet>
          <Bullet>Ensure participants attend on time, follow trainer instructions and comply with applicable workplace/site rules.</Bullet>
          <Bullet>For onsite delivery, provide safe and timely access to the agreed training area, basic facilities and any client-owned equipment specifically agreed as necessary for the program.</Bullet>
          <Bullet>For online delivery, ensure participants have suitable devices, internet connectivity and access to the agreed platform.</Bullet>
          <Bullet>Provide accurate information about the audience, language needs, prerequisites and any relevant site constraints before the program begins.</Bullet>
          <Bullet>Obtain all necessary internal permissions and participant notices/consents for sharing participant information with NLETA for training administration.</Bullet>
        </Section>

        <Section number="12" title="NLETA Responsibilities">
          <Bullet>Deliver the agreed program(s) with reasonable professional care and in accordance with the scope and schedule accepted by both parties.</Bullet>
          <Bullet>Assign a suitable trainer/facilitator for the agreed program, subject to availability.</Bullet>
          <Bullet>Maintain reasonable training and attendance records and issue the deliverables listed in Section 4, subject to the stated conditions.</Bullet>
          <Bullet>Inform the client promptly of any material issue likely to affect delivery and work with the client to agree a practical solution.</Bullet>
          <Bullet>Handle client and participant information for the engagement in accordance with applicable law and the confidentiality/data terms below.</Bullet>
        </Section>

        <Section number="13" title="Attendance, Assessment and Certificates">
          <Paragraph>
            Attendance and assessment criteria, if applicable, will be communicated for the selected
            program(s). A certificate may be withheld or marked accordingly where the participant does not
            meet the stated attendance or assessment requirements, where information is materially
            inaccurate, or where the participant’s identity cannot reasonably be verified. The client is
            responsible for reviewing participant names and spelling before certificates are issued.
            Corrections requested after issuance may require reasonable administrative time. Training is an
            educational service. Unless the offer expressly states otherwise, it does not guarantee
            employment, promotion, a particular examination result, operational authorization, or compliance
            with every legal, statutory, technical or management-system requirement applicable to the client.
          </Paragraph>
        </Section>

        <Section number="14" title="Learning Materials, Intellectual Property and Recording">
          <Paragraph>
            NLETA retains ownership of its pre-existing training content, methods, templates, slides and
            learning materials. The client may use supplied materials internally for the participants and
            purpose covered by this engagement. The client must not resell, publish, distribute externally,
            modify for commercial reuse, or represent NLETA materials as its own without prior written
            permission. Client-owned materials remain the client’s property. Neither party may record,
            photograph, stream or publish a session or participant without the other party’s prior written
            consent, except where required by law.
          </Paragraph>
        </Section>

        <Section number="15" title="Confidentiality and Participant Data">
          <Paragraph>
            Each party will use the other party’s confidential information only for this engagement, protect
            it with reasonable care, and disclose it only to personnel or service providers who need it for
            delivery and are subject to appropriate confidentiality obligations, or where disclosure is
            required by law. Participant data will be limited to what is reasonably necessary for coordination,
            attendance, assessment, certificate issuance, invoicing and recordkeeping. Each party will comply
            with applicable data-protection and privacy laws. The client is responsible for ensuring it has a
            lawful basis and has provided any required notice before sharing participant data with NLETA.
          </Paragraph>
        </Section>

        <Section number="16" title="Standards, Legal Boundaries and Safety">
          <Paragraph>
            Where a selected program addresses a particular law, standard or code, the relevant reference
            and its scope will be identified in the program materials or program-specific schedule where
            appropriate. References to IS 17900 or any other standard are included only where relevant to
            the selected program; they do not imply that every program is mandated by that standard. The
            training is not a substitute for legal advice, statutory inspection, equipment-specific
            authorization, employer supervision, risk assessment or site-specific safe-work procedures. For
            onsite training, each party will comply with the safety requirements applicable to its personnel
            and activities. The client retains control of its premises and is responsible for site induction,
            emergency arrangements and safe access. NLETA may pause or stop an activity it reasonably
            considers unsafe, and the parties will agree a safe way to continue or reschedule.
          </Paragraph>
        </Section>

        <Section number="17" title="Changes, Delays and Force Majeure">
          <Paragraph>
            Any change to scope, participant numbers, program content, duration, delivery mode, dates,
            location or price must be recorded in writing and accepted by both parties before the change is
            implemented. Neither party is liable for delay caused by events beyond its reasonable control,
            including natural disasters, epidemic/pandemic restrictions, government action, transport
            disruption, power or telecommunications failure, civil disturbance or other comparable events.
            The affected party will notify the other as soon as reasonably practicable, and the parties will
            seek a reasonable alternative schedule or delivery arrangement.
          </Paragraph>
        </Section>

        <Section number="18" title="Liability and Resolution of Disputes">
          <Paragraph>
            Each party remains responsible for its own acts, omissions and legal obligations. To the extent
            permitted by law, neither party is liable to the other for indirect or consequential loss, loss of
            profit, loss of opportunity or loss of anticipated savings arising from this training engagement.
            Nothing in this offer excludes or limits liability where such exclusion or limitation is prohibited
            by law, or for fraud, willful misconduct, or other liability that cannot lawfully be excluded.
            NLETA’s training service does not transfer the client’s employer, operator, owner or statutory
            responsibilities to NLETA. The parties will first attempt to resolve any dispute through good-faith
            discussion between their authorized representatives. If unresolved within 30 days after written
            notice of the dispute, either party may pursue remedies available under applicable law before a
            competent court. The governing law is the law of India. The competent court jurisdiction shall be
            {` ${data.jurisdiction || "[insert agreed city/state jurisdiction before issue]"}`}. Do not issue this
            offer with the jurisdiction field blank; it must be completed consistently with the parties’ contract
            and applicable law.
          </Paragraph>
        </Section>

        <Section number="19" title="Offer Validity, Acceptance and Document Relationship">
          <Paragraph>
            This offer is valid for 30 calendar days from the issue date unless withdrawn earlier in writing.
            After expiry, prices and availability may be reconfirmed by NLETA. Acceptance may be evidenced
            by signature, an authorized purchase order expressly accepting this offer, or another written
            acceptance from an authorized representative. Where the client’s purchase order contains
            additional or conflicting terms, those terms do not amend this offer unless NLETA accepts the
            specific amendment in writing.
          </Paragraph>
        </Section>

        <Section number="20" title="Document Relationship">
          <Paragraph>
            CLP-00 (Corporate Learning Portfolio) identifies available program(s); TSP-01 records the client’s
            requirements and selections; Annexures A, B and C provide indicative reference fees, pricing
            methodology and commercial engagement conditions; this FTO-01 records the final client-specific
            scope and price; the applicable PSGA and TAF-01/onboarding activation documents govern the
            subsequent engagement setup and activation process. If documents conflict, the parties will first
            apply the latest mutually signed client-specific agreement; for scope and price, this FTO-01 prevails
            over indicative portfolio/reference material, unless a later written amendment says otherwise.
          </Paragraph>
        </Section>

        <Section number="21" title="Final Offer Checklist — To Be Completed Before Issue">
          <DataTable
            headers={["Required item", "Completion"]}
            widths={["86%", "14%"]}
            rows={[
              ["Client legal name and billing details completed", "☐"],
              ["Program codes/titles, duration, mode, batch sizes and number of batches confirmed", "☐"],
              ["Program-wise fee, discount, taxes and total calculated", "☐"],
              ["Travel/logistics treatment stated (included, estimated or at actuals)", "☐"],
              ["Training dates or schedule confirmation process stated", "☐"],
              ["Payment account/invoice details available through official invoice", "☐"],
              ["Competent court jurisdiction completed in Section 18", "☐"],
              ["Offer number, issue date and validity date completed", "☐"],
              ["Annexures / program schedule attached where referenced", "☐"],
            ]}
          />
        </Section>

        <Section number="22" title="Acceptance">
          <Paragraph>
            By signing below, the parties confirm that they are authorized to accept this offer and agree
            to the stated scope, commercial value, payment milestones and engagement conditions.
          </Paragraph>
          <View style={styles.signatureTable}>
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureHeadCell}>For NLETA (Authorized Signatory)</Text>
              <Text style={[styles.signatureHeadCell, { borderRightWidth: 0 }]}>For the Client (Authorized Signatory)</Text>
            </View>
            {[
              ["Name / Designation:", `Name / Designation: ${valueText(data.client.contactName)} / ${valueText(data.client.designation)}`],
              ["Signature:", "Signature:"],
              ["Date:", "Date:"],
              ["Seal (if applicable):", "Seal (if applicable):"],
            ].map((row, index) => (
              <View key={`sign-${index}`} style={styles.signatureRow} wrap={false}>
                <View style={styles.signatureCell}><Text>{row[0]}</Text></View>
                <View style={[styles.signatureCell, { borderRightWidth: 0 }]}><Text>{row[1]}</Text></View>
              </View>
            ))}
          </View>
          
        </Section>

        {/* Optional client-specific information entered by the Sub Admin */}
        {data.specialRemarks ? (
          <Section number=" " title="Additional Client-Specific Remarks">
            <TermsBlock value={data.specialRemarks} />
          </Section>
        ) : null}
        {data.terms ? (
          <Section number=" " title="Additional Engagement Terms">
            <TermsBlock value={data.terms} />
          </Section>
        ) : null}
        <Footer />
      </Page>
    </Document>
  );
}
