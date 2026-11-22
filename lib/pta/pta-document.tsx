
import React from "react";
import {
  Document,
  Page,
  Image,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export type PtaDocumentData = {
  ptaNumber: string;
  effectiveDate: Date;
  generatedAt: Date;
  client: {
    organisation: string;
    billingAddress: string;
    gstin: string | null;
    contactName: string;
    designation: string | null;
    email: string;
    phone: string;
  };
};

const NAVY = "#173F68";
const BORDER = "#7B8794";

// React-PDF needs an absolute URL when it loads an image while generating a PDF.
// Set NEXT_PUBLIC_APP_URL in .env.local and in your production environment.
const PTA_HEADER_SRC = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(
      "/nleta-fto-header.png",
      process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "") + "/"
    ).toString()
  : "/nleta-fto-header.png";

const styles = StyleSheet.create({
  page: {
    paddingTop: 151,
    paddingBottom: 112,
    paddingHorizontal: 43,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.22,
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 598.28,
    height: 145,
    objectFit: "contain",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111111",
    textDecoration: "underline",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 10,
    color: "#334155",
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 9.3,
    fontWeight: "bold",
    color: "#111111",
    marginBottom: 2,
    lineHeight: 1.2,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.2,
    textAlign: "justify",
    color: "#111111",
  },
  field: {
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#111111",
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableLabel: {
    width: "40%",
    padding: 5,
    backgroundColor: "#E8EEF4",
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    fontSize: 8.5,
  },
  tableValue: {
    width: "60%",
    padding: 5,
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    bottom: 17,
    left: 43,
    right: 43,
    paddingTop: 5,
    fontSize: 7.2,
    color: "#111111",
  },
  footerRule: {
    borderTopWidth: 1.5,
    borderTopColor: NAVY,
    marginBottom: 7,
  },
  footerRow: {
    flexDirection: "row",
    borderLeftWidth: 0.8,
    borderTopWidth: 0.8,
    borderColor: "#777777",
  },
  footerCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: "#777777",
    lineHeight: 1.15,
  },
  footerLabel: {
    fontWeight: "bold",
  },
  footerPresence: {
    textAlign: "center",
    fontSize: 7,
    fontWeight: "bold",
    marginTop: 3,
  },
  signatureRow: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
  },
  signatureBox: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    minHeight: 125,
  },
  signatureHeading: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: NAVY,
    padding: 5,
    marginBottom: 0,
  },
  signatureLine: {
    fontSize: 8.5,
    padding: 5,
    minHeight: 24,
    borderBottomWidth: 0.7,
    borderBottomColor: BORDER,
  },
});

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        {number}. {title}
      </Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text style={{ width: 12 }}>•</Text>
      <Text style={[styles.paragraph, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.paragraph}>
        <Text style={styles.label}>{label}: </Text>
        {value || "Not provided"}
      </Text>
    </View>
  );
}

export default function PtaDocument({
  data,
}: {
  data: PtaDocumentData;
}) {
  const { client } = data;

  const date = (value: Date) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Document
      title={`Professional Training Agreement ${data.ptaNumber}`}
      author="National Lift Escalator Testing Agency"
      subject="PTA-01 Professional Training Agreement"
    >
      <Page size="A4" style={styles.page} wrap>
        <Image src={PTA_HEADER_SRC} style={styles.headerImage} fixed />
        <Text style={styles.title}>
          PROFESSIONAL TRAINING AGREEMENT - PTA-01
        </Text>

        <Section number={1} title="Parties and Purpose">
          <Paragraph>
            This Professional Training Agreement (PTA) establishes the
            general terms under which NLETA may provide corporate,
            technical, professional, safety-awareness, operational and
            related training. Program-specific content, learning outcomes,
            duration and assessment criteria remain governed by controlled
            program specifications and the client-specific final form.
          </Paragraph>
        </Section>

        <Section number={2} title="Document Architecture and Hierarchy">
          <Paragraph>
            The controlled process is: CLP-00 Corporate Learning Portfolio
            → TSP-01 Training Selection Proposal → PTA-01 Professional
            Training Agreement → FTF / Final Training Form (client-specific
            scope and commercial commitment) → TAF-01 Training Activation
            Form (activation approval) → delivery and closure records.
            CLP-00 maintains the common programs listing and codes for
            management-system/document-control purposes. TSP-01 records
            requirements and selections only. PTA sets continuing terms.
            The FTF confirms final scope, price, tax, dates, logistics and
            deliverables. TAF records readiness and authorizes the specific
            engagement/batch; it does not independently alter price or scope.
          </Paragraph>
          <Paragraph>
            Where documents conflict, the latest written amendment accepted
            by both parties prevails; otherwise the FTF controls client-specific
            scope, price, schedule and deliverables; PTA controls general
            terms; TAF controls activation status; TSP-01 and CLP-00 are
            selection/reference documents. Indicative annexures and marketing
            materials do not override the FTF.
          </Paragraph>
        </Section>

        <Section number={3} title="Parties">
          <Field
            label="NLETA"
            value="National Lift Escalator Testing Agency (NLETA)"
          />
          <Field
            label="NLETA Registered Address"
            value="A-32, Commercial Complex, Govindpuram, Ghaziabad, Uttar Pradesh – 201013"
          />
          <Field label="NLETA Email" value="info@nleta.org.in" />
          <Field
            label="Client Legal Name"
            value={client.organisation}
          />
          <Field
            label="Client Registered/Billing Address"
            value={client.billingAddress}
          />
          <Field label="Client GSTIN" value={client.gstin || "Not applicable"} />
          <Field
            label="Authorized Representative"
            value={`${client.contactName}${client.designation ? `, ${client.designation}` : ""}`}
          />
          <Field label="Client Email" value={client.email} />
          <Field label="Client Phone" value={client.phone} />
          <Field
            label="Agreement Number"
            value={data.ptaNumber}
          />
          <Field
            label="Effective Date"
            value={date(data.effectiveDate)}
          />
        </Section>

        <Section number={4} title="Services and Exclusions">
          <Paragraph>
            NLETA shall deliver only the programs and deliverables stated
            in the accepted FTF. Services may include instructor-led online,
            onsite or hybrid training, standard learning materials,
            attendance records, assessment where specified, results/status
            where applicable, certificates where specified and a closure
            summary.
          </Paragraph>
          <Paragraph>
            Unless separately contracted in a distinct written agreement,
            this PTA does not engage NLETA for engineering inspection,
            maintenance/AMC, manpower supply, statutory approval, equipment
            operation or engineering certification. Extra programs, batches,
            repeats, customization, venues, equipment and third-party
            services are excluded unless expressly priced and included.
          </Paragraph>
        </Section>

        <Section number={5} title="Program Listing, Standards and Controlled Information">
          <Paragraph>
            CLP-00 program codes and titles remain the common reference
            across the organization, subject to controlled revision.
            Individual program specifications may state target audience,
            prerequisites, delivery mode, duration, learning outcomes,
            assessment and relevant references. A reference to IS 17900
            or any other standard/law applies only where relevant to the
            selected program; it does not imply that every program is
            mandated by that standard. Training does not replace legal
            advice, statutory inspection, employer supervision, task-specific
            authorization, risk assessment or site safety procedures.
          </Paragraph>
        </Section>

        <Section number={6} title="Scope and Change Control">
          <Bullet>
            The FTF shall confirm program code/title, audience, prerequisites,
            language, duration, mode, batch size/count, location/platform,
            dates, assessment and deliverables.
          </Bullet>
          <Bullet>
            Any material change to scope, duration, mode, dates, location,
            participant count, assessment, deliverables or fee requires
            written approval by authorized representatives before the
            changed work begins.
          </Bullet>
          <Bullet>
            Additional work shall be priced in a revised FTF or written
            change order. Oral requests and unapproved scope changes do
            not create a fee commitment.
          </Bullet>
        </Section>

        <Section number={7} title="Fees, Taxes and Payment">
          <Bullet>
            The FTF states actual fees, discount, taxes, payment milestones
            and expenses. Client-specific FTF amounts prevail over
            indicative reference fees.
          </Bullet>
          <Bullet>
            Unless the FTF expressly provides a different agreed schedule,
            50% of training fees is payable on written acceptance and the
            remaining 50% before the final scheduled batch. For a single-batch
            engagement, the balance is payable before that batch begins.
          </Bullet>
          <Bullet>
            Invoices are payable within 7 calendar days unless the FTF states
            otherwise. Applicable GST/statutory taxes are charged as required
            by law.
          </Bullet>
          <Bullet>
            Travel, boarding, lodging, local conveyance, venue, special
            equipment and other agreed out-of-scope logistics are charged
            at actuals where stated in the FTF or separately approved in writing.
          </Bullet>
          <Bullet>
            No unlisted penalty, interest, cancellation charge or fixed
            expense applies under this PTA. NLETA may defer commencement
            if a due amount remains unpaid after written notice, with
            reasonable coordination of scheduling.
          </Bullet>
        </Section>

        <Section number={8} title="Scheduling, Cancellation and Rescheduling">
          <Bullet>
            Dates are confirmed after FTF acceptance, required advance
            payment and TAF activation.
          </Bullet>
          <Bullet>
            The Client should give at least 72 hours’ written notice for
            rescheduling. NLETA will make reasonable efforts to offer another
            date, subject to trainer availability.
          </Bullet>
          <Bullet>
            Requests with less than 72 hours’ notice are considered case
            by case. No automatic cancellation penalty applies.
          </Bullet>
          <Bullet>
            If NLETA reschedules for reasons within its reasonable control,
            it will offer a replacement date. If none can reasonably be
            agreed, prepaid amounts for undelivered training will be fairly
            settled, deducting only documented, non-recoverable costs
            previously approved by the Client.
          </Bullet>
          <Bullet>
            If the Client cancels after NLETA has incurred client-approved
            non-recoverable third-party expenses, those documented expenses
            are reimbursable. No additional cancellation fee applies unless
            agreed in writing beforehand.
          </Bullet>
          <Bullet>
            For unsafe site conditions, access restrictions, connectivity
            failure or force majeure, the parties will work in good faith
            to reschedule or agree a reasonable adjustment.
          </Bullet>
        </Section>

        <Section number={9} title="Client Responsibilities">
          <Bullet>
            Provide accurate participant and organizational details,
            nominate coordinators and communicate prerequisites/language
            needs in advance.
          </Bullet>
          <Bullet>
            Ensure participants attend on time, follow trainer instructions
            and comply with workplace/site rules.
          </Bullet>
          <Bullet>
            For onsite sessions, provide safe access, site induction,
            emergency information, agreed training space and client-owned
            equipment expressly agreed as necessary.
          </Bullet>
          <Bullet>
            For online sessions, provide suitable devices, connectivity
            and platform access unless otherwise stated in the FTF.
          </Bullet>
          <Bullet>
            Ensure a lawful basis and any required notices/permissions
            for sharing participant data with NLETA.
          </Bullet>
        </Section>

        <Section number={10} title="NLETA Responsibilities">
          <Bullet>
            Deliver agreed training with reasonable professional care and
            within the accepted scope.
          </Bullet>
          <Bullet>
            Assign a suitable trainer/facilitator subject to availability
            and notify the Client of material delivery issues promptly.
          </Bullet>
          <Bullet>
            Maintain reasonable attendance/assessment records and issue
            the deliverables listed in the FTF.
          </Bullet>
          <Bullet>
            Protect confidential information and handle participant data
            under applicable law.
          </Bullet>
          <Bullet>
            Pause an activity reasonably considered unsafe and coordinate
            a safe alternative.
          </Bullet>
        </Section>

        <Section number={11} title="Attendance, Assessment and Certificates">
          <Paragraph>
            Attendance thresholds, assessment methods, pass criteria and
            certificate type shall be stated in the program specification
            or FTF where relevant. NLETA may withhold/defer or appropriately
            mark a certificate if requirements are not met, identity cannot
            reasonably be verified or information is materially inaccurate.
            Client must check participant names before issue. A certificate
            describes only the participation, completion or assessment
            status supported by records. Unless expressly identified and
            lawfully authorized, it is not a government-issued qualification,
            statutory license or third-party accreditation. Training alone
            does not guarantee legal compliance, employment, promotion or
            competence for every task.
          </Paragraph>
        </Section>

        <Section number={12} title="Intellectual Property, Confidentiality and Data">
          <Paragraph>
            NLETA retains ownership of its pre-existing training content,
            slides, methods, templates and materials. Client receives a
            limited right to use supplied materials internally for the
            covered participants. No resale, public distribution,
            republication or commercial reuse without prior written permission.
            Neither party may record or publish sessions/participants without
            prior written consent, except where required by law.
          </Paragraph>
          <Paragraph>
            Each party shall use the other party’s confidential information
            only for this engagement and protect it with reasonable care.
            Participant data shall be limited to what is reasonably necessary
            for coordination, attendance, assessment, certificates, invoicing
            and recordkeeping. Both parties shall comply with applicable
            privacy/data-protection laws.
          </Paragraph>
        </Section>

        <Section number={13} title="Safety and Conduct">
          <Paragraph>
            Each party complies with safety requirements applicable to its
            own personnel and activities. Client remains responsible for
            its premises, site induction, emergency arrangements and safe
            access. NLETA may stop an activity it reasonably considers
            unsafe; the parties shall agree how to resume or reschedule safely.
          </Paragraph>
        </Section>

        <Section number={14} title="Liability">
          <Paragraph>
            Each party remains responsible for its own acts, omissions and
            legal obligations. To the extent permitted by law, neither party
            is liable for indirect or consequential loss, loss of profit,
            opportunity or anticipated savings arising from this engagement.
            Nothing excludes liability where prohibited by law, or for fraud,
            willful misconduct or liability that cannot lawfully be excluded.
            Client’s employer, owner, operator and statutory responsibilities
            are not transferred to NLETA.
          </Paragraph>
        </Section>

        <Section number={15} title="Force Majeure">
          <Paragraph>
            Neither party is in breach for delay caused by events beyond
            reasonable control, including natural disaster, epidemic/pandemic
            restrictions, government action, transport disruption, civil
            disturbance or power/telecommunications failure. The affected
            party shall notify the other promptly and the parties shall seek
            a reasonable alternative schedule or delivery arrangement.
          </Paragraph>
        </Section>

        <Section number={16} title="Notices and Authorized Communication">
          <Paragraph>
            Formal notices shall be sent to the email/postal addresses
            stated in the party details or updated in writing. Coordinators
            may manage routine delivery but cannot amend price, liability,
            scope or other contractual terms unless authorized in writing.
          </Paragraph>
        </Section>

        <Section number={17} title="Dispute Resolution, Law and Jurisdiction">
          <Paragraph>
            Parties shall first attempt good-faith resolution through
            authorized representatives. If unresolved within 30 days
            after written notice, either party may pursue remedies before
            a competent court. Governing law: India. Competent court
            jurisdiction: Ghaziabad, Uttar Pradesh, India, subject to
            applicable law.
          </Paragraph>
        </Section>

        <Section number={18} title="Term, Termination and General">
          <Paragraph>
            This PTA takes effect on its effective date and continues until
            either party terminates it on 30 days’ written notice. Accepted
            FTF engagements are not automatically cancelled; the parties
            shall complete or settle them by written agreement unless
            material breach, safety concern or legal impediment exists.
            A material breach may be terminated if not remedied within
            15 days after written notice where capable of remedy. Delivered
            training and approved non-recoverable expenses remain payable.
            Amendments/waivers must be written and accepted by authorized
            representatives. If one provision is unenforceable, the remainder
            continues to the extent permitted by law. Nothing creates
            employment, partnership, joint venture or agency. Electronic
            signatures/written acceptance may be used to the extent recognized
            by law. Confidentiality, IP, data, accrued payments, liability
            and dispute clauses survive as necessary.
          </Paragraph>
        </Section>

        <Section number={19} title="Signatures">
          <Paragraph>
            The signatories confirm they are authorized to bind their
            organizations and accept this PTA.
          </Paragraph>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeading}>For NLETA</Text>
              <Text style={styles.signatureLine}>Name:</Text>
              <Text style={styles.signatureLine}>Designation:</Text>
              <Text style={styles.signatureLine}>Signature:</Text>
              <Text style={styles.signatureLine}>Date:</Text>
              <Text style={styles.signatureLine}>Seal (if applicable):</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeading}>For Client</Text>
              <Text style={styles.signatureLine}>Name: {client.contactName}</Text>
              <Text style={styles.signatureLine}>Designation: {client.designation || " "}</Text>
              <Text style={styles.signatureLine}>Signature:</Text>
              <Text style={styles.signatureLine}>Date:</Text>
              <Text style={styles.signatureLine}>Seal (if applicable):</Text>
            </View>
          </View>
        </Section>

        <View style={styles.footer} fixed>
          <View style={styles.footerRule} />
          <View style={styles.footerRow}>
            <View style={styles.footerCell}>
              <Text><Text style={styles.footerLabel}>WEB: </Text>www.nleta.org.in</Text>
            </View>
            <View style={styles.footerCell}>
              <Text><Text style={styles.footerLabel}>EMAIL: </Text>info@nleta.org.in, inspnleta@gmail.com, legalnleta@gmail.com</Text>
            </View>
          </View>
          <View style={styles.footerRow}>
            <View style={styles.footerCell}>
              <Text><Text style={styles.footerLabel}>REGD. HEAD OFFICE: </Text>A-32, Commercial Complex, Govindpuram, Ghaziabad, Uttar Pradesh – 201013</Text>
            </View>
            <View style={styles.footerCell}>
              <Text><Text style={styles.footerLabel}>TELEPHONE: </Text>+91 99900 58799 • +91 99900 29597 • +91 92116 93664</Text>
            </View>
          </View>
          <Text style={styles.footerPresence}>
            REGIONAL SERVICE PRESENCE: Uttar Pradesh • Haryana • Delhi NCR • Punjab • Himachal Pradesh •
            Maharashtra • Telangana • Karnataka
          </Text>
        </View>
      </Page>
    </Document>
  );
}
