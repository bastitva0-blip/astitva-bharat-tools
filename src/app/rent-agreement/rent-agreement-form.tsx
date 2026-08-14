"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

type MaintenancePayer = "Tenant" | "Landlord" | "Shared";

interface LandlordInfo {
  name: string;
  fatherName: string;
  address: string;
  aadhaar: string;
  pan: string;
}

interface TenantInfo {
  name: string;
  fatherName: string;
  permanentAddress: string;
  aadhaar: string;
  occupation: string;
}

interface PropertyInfo {
  address: string;
  type: "Residential" | "Commercial";
  floorUnit: string;
}

interface AgreementTerms {
  monthlyRent: string;
  securityDeposit: string;
  lockInPeriod: string;
  startDate: string;
  duration: string;
  noticePeriod: string;
}

interface MaintenanceTerms {
  electricity: MaintenancePayer;
  water: MaintenancePayer;
  maintenance: MaintenancePayer;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "___________";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function addMonths(iso: string, months: number): string {
  if (!iso) return "___________";
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  // one day before
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function numberToWords(n: number): string {
  if (isNaN(n) || n === 0) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function below1000(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + below1000(num % 100) : "");
  }

  let result = "";
  if (n >= 10000000) { result += below1000(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
  if (n >= 100000) { result += below1000(Math.floor(n / 100000)) + " Lakh "; n %= 100000; }
  if (n >= 1000) { result += below1000(Math.floor(n / 1000)) + " Thousand "; n %= 1000; }
  if (n > 0) result += below1000(n);
  return result.trim();
}

function rupees(val: string): string {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "₹___________";
  const words = numberToWords(n);
  return `₹${n.toLocaleString("en-IN")}${words ? ` (${words} Rupees Only)` : ""}`;
}

// ── Field components ───────────────────────────────────────────────────────

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  optional,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 text-muted-foreground text-xs">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Agreement Preview ──────────────────────────────────────────────────────

function AgreementPreview({
  landlord,
  tenant,
  property,
  terms,
  maintenance,
  additionalClauses,
  placeOfExecution,
  executionDate,
}: {
  landlord: LandlordInfo;
  tenant: TenantInfo;
  property: PropertyInfo;
  terms: AgreementTerms;
  maintenance: MaintenanceTerms;
  additionalClauses: string;
  placeOfExecution: string;
  executionDate: string;
}) {
  const duration = parseInt(terms.duration) || 11;
  const endDate = addMonths(terms.startDate, duration);
  const lockIn = parseInt(terms.lockInPeriod) || 0;
  const noticePeriod = parseInt(terms.noticePeriod) || 1;

  const blank = (v: string, fallback = "___________") => v.trim() || fallback;

  return (
    <div className="agreement-preview font-serif text-[13px] leading-relaxed text-black print:text-black">
      {/* Stamp note */}
      <p className="text-center text-xs italic mb-4 print:mb-4">
        Executed on Stamp Paper of appropriate value as required under applicable State Stamp Act
      </p>

      {/* Title */}
      <h1 className="text-center text-[16px] font-bold uppercase tracking-widest mb-1">
        Leave and Licence Agreement
      </h1>
      <p className="text-center text-xs mb-6">(11-Month Renewable)</p>

      {/* Preamble */}
      <p className="mb-4 text-justify">
        This Leave and Licence Agreement (&quot;<strong>Agreement</strong>&quot;) is made and executed at{" "}
        <strong>{blank(placeOfExecution)}</strong> on{" "}
        <strong>{formatDate(executionDate) || "___________"}</strong>, by and between:
      </p>

      {/* Licensor */}
      <div className="mb-4 pl-4 border-l-2 border-gray-400">
        <p>
          <strong>
            {blank(landlord.name, "________________________")}
          </strong>
          {landlord.fatherName && (
            <>, S/o / D/o <strong>{landlord.fatherName}</strong></>
          )}
          , residing at {blank(landlord.address, "________________________, ________________________")}
          {landlord.aadhaar && <>, Aadhaar No.: <strong>{landlord.aadhaar}</strong></>}
          {landlord.pan && <>, PAN: <strong>{landlord.pan}</strong></>}
          {" "}(hereinafter referred to as the{" "}
          <strong>&quot;Licensor&quot;</strong>, which expression shall, unless repugnant to the context, include
          his/her heirs, legal representatives, successors and assigns) of the{" "}
          <strong>FIRST PART</strong>;
        </p>
      </div>

      <p className="text-center font-bold my-2">AND</p>

      {/* Licensee */}
      <div className="mb-4 pl-4 border-l-2 border-gray-400">
        <p>
          <strong>
            {blank(tenant.name, "________________________")}
          </strong>
          {tenant.fatherName && (
            <>, S/o / D/o <strong>{tenant.fatherName}</strong></>
          )}
          , permanently residing at{" "}
          {blank(tenant.permanentAddress, "________________________, ________________________")}
          {tenant.aadhaar && <>, Aadhaar No.: <strong>{tenant.aadhaar}</strong></>}
          {tenant.occupation && (
            <>, Occupation: <strong>{tenant.occupation}</strong></>
          )}
          {" "}(hereinafter referred to as the{" "}
          <strong>&quot;Licensee&quot;</strong>, which expression shall, unless repugnant to the context,
          include his/her heirs, legal representatives and permitted assigns) of the{" "}
          <strong>SECOND PART</strong>.
        </p>
      </div>

      <p className="mb-4">
        The Licensor and the Licensee are hereinafter collectively referred to as the
        &quot;<strong>Parties</strong>&quot; and individually as a &quot;<strong>Party</strong>&quot;.
      </p>

      <p className="mb-4">
        <strong>WHEREAS</strong>, the Licensor is the lawful owner of the{" "}
        {property.type.toLowerCase()} premises described in the Schedule hereunder written
        (&quot;<strong>Licensed Premises</strong>&quot;);
      </p>

      <p className="mb-6">
        <strong>WHEREAS</strong>, the Licensee has approached the Licensor and the Licensor has
        agreed to grant leave and licence of the Licensed Premises to the Licensee on the terms
        and conditions set forth herein;
      </p>

      <p className="mb-4 font-bold">NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, the Parties agree as follows:</p>

      {/* Numbered Clauses */}
      <ol className="list-none space-y-4 mb-6">
        <li>
          <p>
            <strong>1. LICENCE AND TERM</strong>
          </p>
          <p className="mt-1 pl-4">
            The Licensor hereby grants Leave and Licence to the Licensee to use and occupy the
            Licensed Premises for a period of <strong>{duration} (
              {numberToWords(duration)}) months</strong> commencing from{" "}
            <strong>{formatDate(terms.startDate) || "___________"}</strong> and ending on{" "}
            <strong>{endDate}</strong> (&quot;<strong>Licence Period</strong>&quot;), unless sooner
            terminated as provided herein. This Agreement shall not create any tenancy or
            sub-tenancy rights in favour of the Licensee.
          </p>
        </li>

        <li>
          <p>
            <strong>2. LICENCE FEE (RENT)</strong>
          </p>
          <p className="mt-1 pl-4">
            The Licensee shall pay a monthly licence fee of{" "}
            <strong>{rupees(terms.monthlyRent)}</strong> to the Licensor on or before the{" "}
            <strong>5th day</strong> of each English calendar month. The licence fee shall be
            paid by bank transfer / cheque / UPI, as mutually agreed. Delay beyond 10 days
            shall attract a simple interest of <strong>12% per annum</strong> on the overdue
            amount.
          </p>
        </li>

        <li>
          <p>
            <strong>3. SECURITY DEPOSIT</strong>
          </p>
          <p className="mt-1 pl-4">
            The Licensee has paid / agrees to pay the Licensor an interest-free refundable
            security deposit of <strong>{rupees(terms.securityDeposit)}</strong> at the time
            of execution of this Agreement. The said deposit shall be refunded to the Licensee
            within <strong>30 days</strong> of vacating the Licensed Premises after deducting
            any dues, damages beyond normal wear and tear, or unpaid utility bills.
          </p>
        </li>

        {lockIn > 0 && (
          <li>
            <p>
              <strong>4. LOCK-IN PERIOD</strong>
            </p>
            <p className="mt-1 pl-4">
              The Parties agree to a lock-in period of{" "}
              <strong>{lockIn} ({numberToWords(lockIn)}) month{lockIn > 1 ? "s" : ""}</strong>{" "}
              from the commencement date. During the lock-in period, neither Party shall terminate
              this Agreement. In the event of premature termination by either Party, the defaulting
              Party shall compensate the other Party with an amount equivalent to the licence fee
              for the remaining lock-in period.
            </p>
          </li>
        )}

        <li>
          <p>
            <strong>{lockIn > 0 ? "5" : "4"}. MAINTENANCE AND UTILITIES</strong>
          </p>
          <p className="mt-1 pl-4">
            The following charges shall be borne as stated:
          </p>
          <ul className="list-disc pl-8 mt-1 space-y-1">
            <li>
              <strong>Electricity charges:</strong> {maintenance.electricity}
            </li>
            <li>
              <strong>Water charges:</strong> {maintenance.water}
            </li>
            <li>
              <strong>Society / building maintenance:</strong> {maintenance.maintenance}
            </li>
          </ul>
          <p className="mt-1 pl-4">
            Where &quot;Shared&quot; is indicated, both Parties shall share equally unless
            otherwise agreed in writing.
          </p>
        </li>

        <li>
          <p>
            <strong>{lockIn > 0 ? "6" : "5"}. TERMINATION AND NOTICE</strong>
          </p>
          <p className="mt-1 pl-4">
            Either Party may terminate this Agreement by giving a prior written notice of{" "}
            <strong>{noticePeriod} ({numberToWords(noticePeriod)}) month{noticePeriod > 1 ? "s" : ""}</strong>{" "}
            to the other Party, subject to expiry of any applicable lock-in period. In the
            event of breach of any material term hereof by the Licensee, the Licensor shall
            be entitled to terminate this Agreement forthwith and the Licensee shall vacate
            the Licensed Premises immediately.
          </p>
        </li>

        <li>
          <p>
            <strong>{lockIn > 0 ? "7" : "6"}. USE OF PREMISES</strong>
          </p>
          <p className="mt-1 pl-4">
            The Licensee shall use the Licensed Premises solely for{" "}
            <strong>{property.type.toLowerCase()}</strong> purpose and shall not sub-licence,
            assign or part with possession of the Licensed Premises or any part thereof without
            the prior written consent of the Licensor. The Licensee shall not carry out any
            structural alterations or additions to the Licensed Premises without prior written
            permission.
          </p>
        </li>

        <li>
          <p>
            <strong>{lockIn > 0 ? "8" : "7"}. CONDITION OF PREMISES</strong>
          </p>
          <p className="mt-1 pl-4">
            The Licensee shall maintain the Licensed Premises in good and tenantable condition
            and shall hand over vacant possession of the Licensed Premises to the Licensor on
            the expiry or earlier termination of this Agreement in the same condition as received,
            subject to normal wear and tear. The Licensor shall be entitled to carry out
            inspection of the Licensed Premises with prior notice of 24 hours.
          </p>
        </li>

        <li>
          <p>
            <strong>{lockIn > 0 ? "9" : "8"}. RENEWAL</strong>
          </p>
          <p className="mt-1 pl-4">
            This Agreement may be renewed for a further period by mutual written consent of both
            Parties. Renewal shall not be implied or deemed from mere continued occupation of the
            Licensed Premises after the expiry of the Licence Period.
          </p>
        </li>

        <li>
          <p>
            <strong>{lockIn > 0 ? "10" : "9"}. DISPUTE RESOLUTION AND GOVERNING LAW</strong>
          </p>
          <p className="mt-1 pl-4">
            This Agreement shall be governed by the laws of India. Any dispute arising out of or
            in connection with this Agreement shall be subject to the exclusive jurisdiction of
            the courts at <strong>{blank(placeOfExecution)}</strong>. The Parties shall endeavour
            to resolve disputes amicably before approaching the courts.
          </p>
        </li>

        {additionalClauses.trim() && (
          <li>
            <p>
              <strong>{lockIn > 0 ? "11" : "10"}. ADDITIONAL TERMS AND CONDITIONS</strong>
            </p>
            <div className="mt-1 pl-4 whitespace-pre-wrap">{additionalClauses.trim()}</div>
          </li>
        )}
      </ol>

      {/* Schedule */}
      <div className="mb-6">
        <h2 className="text-center font-bold uppercase text-[13px] mb-2">Schedule — Description of Licensed Premises</h2>
        <table className="w-full border-collapse border border-gray-400 text-[12px]">
          <tbody>
            <tr>
              <td className="border border-gray-400 px-2 py-1 font-semibold w-40">Full Address</td>
              <td className="border border-gray-400 px-2 py-1">{blank(property.address)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 font-semibold">Type</td>
              <td className="border border-gray-400 px-2 py-1">{property.type}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1 font-semibold">Floor / Unit</td>
              <td className="border border-gray-400 px-2 py-1">{blank(property.floorUnit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mb-6">
        <h2 className="text-center font-bold uppercase text-[13px] mb-4">
          In Witness Whereof
        </h2>
        <p className="mb-6">
          The Parties have signed this Agreement on the date and at the place first written
          above in the presence of the witnesses named below.
        </p>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="font-semibold mb-12">Licensor (Landlord)</p>
            <p className="border-t border-gray-500 pt-1">{blank(landlord.name, "Name: _____________________")}</p>
            <p className="text-xs text-gray-600">Signature &amp; Date</p>
          </div>
          <div>
            <p className="font-semibold mb-12">Licensee (Tenant)</p>
            <p className="border-t border-gray-500 pt-1">{blank(tenant.name, "Name: _____________________")}</p>
            <p className="text-xs text-gray-600">Signature &amp; Date</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-semibold mb-1">Witness 1</p>
            <p className="text-xs mb-8">Name, Address &amp; Signature</p>
            <div className="border-t border-gray-500 h-12" />
          </div>
          <div>
            <p className="font-semibold mb-1">Witness 2</p>
            <p className="text-xs mb-8">Name, Address &amp; Signature</p>
            <div className="border-t border-gray-500 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function RentAgreementForm() {
  const [landlord, setLandlord] = useState<LandlordInfo>({
    name: "",
    fatherName: "",
    address: "",
    aadhaar: "",
    pan: "",
  });

  const [tenant, setTenant] = useState<TenantInfo>({
    name: "",
    fatherName: "",
    permanentAddress: "",
    aadhaar: "",
    occupation: "",
  });

  const [property, setProperty] = useState<PropertyInfo>({
    address: "",
    type: "Residential",
    floorUnit: "",
  });

  const [terms, setTerms] = useState<AgreementTerms>({
    monthlyRent: "",
    securityDeposit: "",
    lockInPeriod: "0",
    startDate: "",
    duration: "11",
    noticePeriod: "1",
  });

  const [maintenance, setMaintenance] = useState<MaintenanceTerms>({
    electricity: "Tenant",
    water: "Tenant",
    maintenance: "Tenant",
  });

  const [additionalClauses, setAdditionalClauses] = useState("");
  const [placeOfExecution, setPlaceOfExecution] = useState("");
  const [executionDate, setExecutionDate] = useState("");

  // Auto-fill security deposit as 2× rent when rent changes
  function handleRentChange(v: string) {
    const n = parseFloat(v);
    setTerms((t) => ({
      ...t,
      monthlyRent: v,
      securityDeposit: !isNaN(n) && n > 0 ? String(n * 2) : t.securityDeposit,
    }));
  }

  const maintenanceOptions = [
    { label: "Tenant", value: "Tenant" },
    { label: "Landlord", value: "Landlord" },
    { label: "Shared", value: "Shared" },
  ] as const;

  return (
    <>
      {/* ── Print styles ─────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .agreement-preview { font-size: 12pt; }
        }
        .print-only { display: none; }
        @page { size: A4; margin: 20mm; }
      `}</style>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* ── Form panel ─────────────────────────────────────────────── */}
        <div className="no-print flex-1 flex flex-col gap-6">
          {/* Landlord */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Licensor (Landlord) Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name" id="ll-name" value={landlord.name} onChange={(v) => setLandlord((l) => ({ ...l, name: v }))} placeholder="As on Aadhaar / PAN" />
              <Field label="Father's Name" id="ll-father" value={landlord.fatherName} onChange={(v) => setLandlord((l) => ({ ...l, fatherName: v }))} placeholder="S/o or D/o" />
              <div className="sm:col-span-2">
                <Field label="Address" id="ll-address" value={landlord.address} onChange={(v) => setLandlord((l) => ({ ...l, address: v }))} placeholder="House No., Street, City, State, PIN" />
              </div>
              <Field label="Aadhaar No." id="ll-aadhaar" value={landlord.aadhaar} onChange={(v) => setLandlord((l) => ({ ...l, aadhaar: v }))} placeholder="XXXX XXXX XXXX" optional />
              <Field label="PAN" id="ll-pan" value={landlord.pan} onChange={(v) => setLandlord((l) => ({ ...l, pan: v.toUpperCase() }))} placeholder="ABCDE1234F" optional />
            </div>
          </section>

          {/* Tenant */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Licensee (Tenant) Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name" id="t-name" value={tenant.name} onChange={(v) => setTenant((t) => ({ ...t, name: v }))} placeholder="As on Aadhaar" />
              <Field label="Father's Name" id="t-father" value={tenant.fatherName} onChange={(v) => setTenant((t) => ({ ...t, fatherName: v }))} placeholder="S/o or D/o" />
              <div className="sm:col-span-2">
                <Field label="Permanent Address" id="t-address" value={tenant.permanentAddress} onChange={(v) => setTenant((t) => ({ ...t, permanentAddress: v }))} placeholder="Permanent home address" />
              </div>
              <Field label="Aadhaar No." id="t-aadhaar" value={tenant.aadhaar} onChange={(v) => setTenant((t) => ({ ...t, aadhaar: v }))} placeholder="XXXX XXXX XXXX" optional />
              <Field label="Occupation" id="t-occ" value={tenant.occupation} onChange={(v) => setTenant((t) => ({ ...t, occupation: v }))} placeholder="e.g. Software Engineer, Student" />
            </div>
          </section>

          {/* Property */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Property Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full Address" id="p-addr" value={property.address} onChange={(v) => setProperty((p) => ({ ...p, address: v }))} placeholder="Flat No., Building, Street, City, PIN" />
              </div>
              <SelectField
                label="Type"
                id="p-type"
                value={property.type}
                onChange={(v) => setProperty((p) => ({ ...p, type: v as "Residential" | "Commercial" }))}
                options={[
                  { label: "Residential", value: "Residential" },
                  { label: "Commercial", value: "Commercial" },
                ]}
              />
              <Field label="Floor / Unit" id="p-floor" value={property.floorUnit} onChange={(v) => setProperty((p) => ({ ...p, floorUnit: v }))} placeholder="e.g. 3rd Floor, Flat 301" />
            </div>
          </section>

          {/* Agreement Terms */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Agreement Terms
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Monthly Rent (₹)" id="rent" value={terms.monthlyRent} onChange={handleRentChange} placeholder="e.g. 15000" type="number" />
              <Field label="Security Deposit (₹)" id="deposit" value={terms.securityDeposit} onChange={(v) => setTerms((t) => ({ ...t, securityDeposit: v }))} placeholder="Default: 2× rent" type="number" />
              <Field label="Lock-in Period (months)" id="lockin" value={terms.lockInPeriod} onChange={(v) => setTerms((t) => ({ ...t, lockInPeriod: v }))} placeholder="0 for no lock-in" type="number" />
              <Field label="Agreement Start Date" id="start-date" value={terms.startDate} onChange={(v) => setTerms((t) => ({ ...t, startDate: v }))} type="date" />
              <Field label="Duration (months)" id="duration" value={terms.duration} onChange={(v) => setTerms((t) => ({ ...t, duration: v }))} placeholder="Default: 11" type="number" />
              <Field label="Notice Period (months)" id="notice" value={terms.noticePeriod} onChange={(v) => setTerms((t) => ({ ...t, noticePeriod: v }))} placeholder="Default: 1" type="number" />
            </div>
          </section>

          {/* Maintenance */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Maintenance &amp; Utilities
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectField label="Electricity" id="elec" value={maintenance.electricity} onChange={(v) => setMaintenance((m) => ({ ...m, electricity: v as MaintenancePayer }))} options={[...maintenanceOptions]} />
              <SelectField label="Water" id="water" value={maintenance.water} onChange={(v) => setMaintenance((m) => ({ ...m, water: v as MaintenancePayer }))} options={[...maintenanceOptions]} />
              <SelectField label="Society / Maintenance" id="maint" value={maintenance.maintenance} onChange={(v) => setMaintenance((m) => ({ ...m, maintenance: v as MaintenancePayer }))} options={[...maintenanceOptions]} />
            </div>
          </section>

          {/* Additional Clauses */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Additional Clauses
            </h2>
            <textarea
              id="additional"
              value={additionalClauses}
              onChange={(e) => setAdditionalClauses(e.target.value)}
              placeholder="Enter any additional terms, e.g. parking, pet policy, furnishing details..."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </section>

          {/* Execution Details */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <FileText className="size-4 text-primary" />
              Execution Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Place of Execution" id="place" value={placeOfExecution} onChange={setPlaceOfExecution} placeholder="City where agreement is signed" />
              <Field label="Date of Execution" id="exec-date" value={executionDate} onChange={setExecutionDate} type="date" />
            </div>
          </section>

          {/* Print Button */}
          <div className="pt-2">
            <Button
              onClick={() => window.print()}
              className="flex items-center gap-2"
              size="lg"
            >
              <Printer className="size-4" />
              Print / Save as PDF
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              In the print dialog, select &quot;Save as PDF&quot; to get a digital copy. Use A4 paper.
            </p>
          </div>
        </div>

        {/* ── Live Preview panel ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="no-print mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5">
              <Printer className="size-3.5" />
              Print
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm print:border-0 print:shadow-none print:p-0">
            <AgreementPreview
              landlord={landlord}
              tenant={tenant}
              property={property}
              terms={terms}
              maintenance={maintenance}
              additionalClauses={additionalClauses}
              placeOfExecution={placeOfExecution}
              executionDate={executionDate}
            />
          </div>
        </div>
      </div>
    </>
  );
}
