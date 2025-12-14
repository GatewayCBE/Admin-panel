// src/components/reports/ReportLayout.tsx
import React from "react";

type ReportLayoutProps = {
  title: string;
  subtitle?: string;

  /** Filters like DatePicker, Dropdowns */
  filters?: React.ReactNode;

  /** KPI cards row */
  kpis?: React.ReactNode;

  /** Main chart (line / bar / pie) */
  primaryChart?: React.ReactNode;

  /** Optional second chart */
  secondaryChart?: React.ReactNode;

  /** Insights / summary text */
  insight?: React.ReactNode;

  /** Detailed table */
  table?: React.ReactNode;

  /** Loading state */
  loading?: boolean;
};

const ReportLayout: React.FC<ReportLayoutProps> = ({
  title,
  subtitle,
  filters,
  kpis,
  primaryChart,
  secondaryChart,
  insight,
  table,
  loading = false,
}) => {
  return (
    <div className="container-fluid py-4">
      {/* ───────────────── HEADER ───────────────── */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">{title}</h3>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>

      {/* ───────────────── FILTER BAR ───────────────── */}
      {filters && (
        <div className="card shadow-sm mb-4">
          <div className="card-body d-flex flex-wrap gap-3 align-items-center">
            {filters}
          </div>
        </div>
      )}

      {/* ───────────────── LOADING STATE ───────────────── */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="mt-3 text-muted">Loading report...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ───────────────── KPI ROW ───────────────── */}
          {kpis && (
            <div className="row g-3 mb-4">
              {kpis}
            </div>
          )}

          {/* ───────────────── CHART SECTION ───────────────── */}
          {(primaryChart || secondaryChart) && (
            <div className="row g-4 mb-4">
              {primaryChart && (
                <div className={secondaryChart ? "col-lg-8" : "col-12"}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body">{primaryChart}</div>
                  </div>
                </div>
              )}

              {secondaryChart && (
                <div className="col-lg-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">{secondaryChart}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────────── INSIGHTS ───────────────── */}
          {insight && (
            <div className="card border-start border-success border-4 shadow-sm mb-4">
              <div className="card-body">{insight}</div>
            </div>
          )}

          {/* ───────────────── TABLE ───────────────── */}
          {table && (
            <div className="card shadow-sm">
              <div className="card-body">{table}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportLayout;
