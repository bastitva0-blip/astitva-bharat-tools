"use client";

import { useState, useCallback } from "react";
import { fire } from "@/lib/analytics/events";

function calcEmi(principal: number, annualRate: number, months: number) {
  if (months <= 0 || annualRate < 0 || principal <= 0) return null;
  if (annualRate === 0) {
    const emi = principal / months;
    return { emi, totalPayment: principal, totalInterest: 0 };
  }
  const r = annualRate / 12 / 100;
  const pow = Math.pow(1 + r, months);
  const emi = (principal * r * pow) / (pow - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

function buildAmortization(
  principal: number,
  annualRate: number,
  months: number,
  emi: number,
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  const r = annualRate / 12 / 100;
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = annualRate === 0 ? 0 : balance * r;
    const principalPart = emi - interest;
    const closing = Math.max(0, balance - principalPart);
    rows.push({
      month: m,
      openingBalance: balance,
      emi,
      principal: principalPart,
      interest,
      closingBalance: closing,
    });
    balance = closing;
  }
  return rows;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtDec(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// SVG donut chart for principal vs interest
function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total <= 0) return null;
  const principalFrac = principal / total;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  const principalArc = principalFrac * circumference;
  const interestArc = circumference - principalArc;

  return (
    <svg viewBox="0 0 140 140" width="160" height="160" aria-label="Principal vs interest breakdown">
      {/* Interest arc (background) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-warning-400, #f59e0b)"
        strokeWidth="20"
        strokeDasharray={`${interestArc} ${principalArc}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Principal arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-primary-500, #2563eb)"
        strokeWidth="20"
        strokeDasharray={`${principalArc} ${interestArc}`}
        strokeDashoffset={0}
        transform={`rotate(${(1 - principalFrac) * 360 - 90} ${cx} ${cy})`}
      />
      <circle cx={cx} cy={cy} r={34} fill="var(--color-surface-1, #fff)" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="10" fill="var(--color-surface-fg, #111)">
        Principal
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="var(--color-surface-fg-muted, #666)">
        {Math.round(principalFrac * 100)}%
      </text>
    </svg>
  );
}

export function EmiCalculatorForm() {
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenure, setTenure] = useState("240");
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("months");
  const [result, setResult] = useState<null | {
    emi: number;
    totalPayment: number;
    totalInterest: number;
    principal: number;
    rows: AmortizationRow[];
  }>(null);
  const [showAll, setShowAll] = useState(false);
  const [fired, setFired] = useState(false);

  const calculate = useCallback(() => {
    const p = parseFloat(loanAmount.replace(/,/g, ""));
    const rate = parseFloat(interestRate);
    const rawTenure = parseFloat(tenure);
    if (!p || isNaN(rate) || !rawTenure) return;
    const months = tenureUnit === "years" ? Math.round(rawTenure * 12) : Math.round(rawTenure);
    const calc = calcEmi(p, rate, months);
    if (!calc) return;
    const rows = buildAmortization(p, rate, months, calc.emi);
    if (!fired) {
      fire("process_start", { tool_id: "emi-calculator" });
      setFired(true);
    }
    setResult({ ...calc, principal: p, rows });
    setShowAll(false);
  }, [loanAmount, interestRate, tenure, tenureUnit, fired]);

  const displayedRows = result
    ? showAll
      ? result.rows
      : result.rows.slice(0, 12)
    : [];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-surface-border bg-surface-1 p-6 space-y-5">
        <h2 className="text-heading-sm font-semibold text-surface-fg">Loan Details</h2>

        <div>
          <label htmlFor="loan-amount" className="block mb-1.5 text-body-sm font-medium text-surface-fg">
            Loan Amount (₹)
          </label>
          <input
            id="loan-amount"
            type="number"
            min="0"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 5000000"
          />
        </div>

        <div>
          <label htmlFor="interest-rate" className="block mb-1.5 text-body-sm font-medium text-surface-fg">
            Annual Interest Rate (%)
          </label>
          <input
            id="interest-rate"
            type="number"
            min="0"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. 8.5"
          />
        </div>

        <div>
          <label htmlFor="tenure" className="block mb-1.5 text-body-sm font-medium text-surface-fg">
            Tenure
          </label>
          <div className="flex gap-2">
            <input
              id="tenure"
              type="number"
              min="1"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="block w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 240"
            />
            <div className="flex rounded-md border border-surface-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setTenureUnit("months")}
                className={`px-3 py-2 text-body-sm font-medium transition-colors ${
                  tenureUnit === "months"
                    ? "bg-primary-500 text-white"
                    : "bg-surface-1 text-surface-fg hover:bg-surface-2"
                }`}
              >
                Months
              </button>
              <button
                type="button"
                onClick={() => setTenureUnit("years")}
                className={`px-3 py-2 text-body-sm font-medium transition-colors ${
                  tenureUnit === "years"
                    ? "bg-primary-500 text-white"
                    : "bg-surface-1 text-surface-fg hover:bg-surface-2"
                }`}
              >
                Years
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={calculate}
          className="w-full rounded-md bg-primary-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          Calculate EMI
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h2 className="text-heading-sm font-semibold text-surface-fg mb-5">Results</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <DonutChart principal={result.principal} interest={result.totalInterest} />
              <div className="flex-1 w-full space-y-4">
                <div className="rounded-lg bg-primary-50 border border-primary-200 px-4 py-3">
                  <p className="text-body-xs text-primary-700 font-medium uppercase tracking-wide">Monthly EMI</p>
                  <p className="text-display-sm font-bold text-primary-700 mt-0.5">₹ {fmtDec(result.emi)}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                    <p className="text-body-xs text-surface-fg-muted">Principal</p>
                    <p className="text-body-sm font-semibold text-surface-fg mt-0.5">₹ {fmt(result.principal)}</p>
                  </div>
                  <div className="rounded-lg bg-warning-50 border border-warning-200 px-3 py-2.5">
                    <p className="text-body-xs text-warning-700">Total Interest</p>
                    <p className="text-body-sm font-semibold text-warning-700 mt-0.5">₹ {fmt(result.totalInterest)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                    <p className="text-body-xs text-surface-fg-muted">Total Payable</p>
                    <p className="text-body-sm font-semibold text-surface-fg mt-0.5">₹ {fmt(result.totalPayment)}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-body-xs text-surface-fg-muted">
                    <span className="inline-block w-3 h-3 rounded-full bg-primary-500" />
                    Principal ({Math.round((result.principal / result.totalPayment) * 100)}%)
                  </div>
                  <div className="flex items-center gap-1.5 text-body-xs text-surface-fg-muted">
                    <span className="inline-block w-3 h-3 rounded-full bg-warning-400" />
                    Interest ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amortization table */}
          <div className="rounded-xl border border-surface-border bg-surface-1 p-6">
            <h2 className="text-heading-sm font-semibold text-surface-fg mb-4">Amortization Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="py-2 px-3 text-left font-semibold text-surface-fg-muted">Month</th>
                    <th className="py-2 px-3 text-right font-semibold text-surface-fg-muted">Opening Balance</th>
                    <th className="py-2 px-3 text-right font-semibold text-surface-fg-muted">EMI</th>
                    <th className="py-2 px-3 text-right font-semibold text-primary-600">Principal</th>
                    <th className="py-2 px-3 text-right font-semibold text-warning-600">Interest</th>
                    <th className="py-2 px-3 text-right font-semibold text-surface-fg-muted">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, i) => (
                    <tr
                      key={row.month}
                      className={`border-b border-surface-border/50 ${i % 2 === 1 ? "bg-surface-2/40" : ""}`}
                    >
                      <td className="py-1.5 px-3 text-surface-fg-muted">{row.month}</td>
                      <td className="py-1.5 px-3 text-right text-surface-fg">₹ {fmt(row.openingBalance)}</td>
                      <td className="py-1.5 px-3 text-right text-surface-fg">₹ {fmtDec(row.emi)}</td>
                      <td className="py-1.5 px-3 text-right text-primary-600 font-medium">₹ {fmtDec(row.principal)}</td>
                      <td className="py-1.5 px-3 text-right text-warning-600 font-medium">₹ {fmtDec(row.interest)}</td>
                      <td className="py-1.5 px-3 text-right text-surface-fg">₹ {fmt(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.rows.length > 12 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-4 text-body-sm text-primary-600 hover:text-primary-700 font-medium focus:outline-none"
              >
                {showAll
                  ? "Show first 12 months"
                  : `Show all ${result.rows.length} months`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
