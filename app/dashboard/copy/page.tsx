"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";

export default function CopyPage() {
  const [mode, setMode] = useState("auto");

  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);

  const [variables, setVariables] = useState<any>({});

  const [table, setTable] = useState("");
  const [destTable, setDestTable] = useState("");

  const [sourceTables, setSourceTables] = useState<string[]>([]);
  const [destTables, setDestTables] = useState<string[]>([]);

  // NEW
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // =========================
  // LOAD QUERIES
  // =========================
  useEffect(() => {
    fetch("/api/queries")
      .then((res) => res.json())
      .then((data) => setQueries(data.data || []));
  }, []);

  // =========================
  // LOAD SOURCE TABLES
  // =========================
  useEffect(() => {
    fetch("/api/source-tables")
      .then((res) => res.json())
      .then((data) => setSourceTables(data.tables || []));
  }, []);

  // =========================
  // LOAD DEST TABLES
  // =========================
  useEffect(() => {
    fetch("/api/dest-tables")
      .then((res) => res.json())
      .then((data) => setDestTables(data.tables || []));
  }, []);

  // =========================
  // LOAD BRANCHES
  // =========================
  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data.data || []));
  }, []);

  // =========================
  // AUTO SET BRANCH CODE VARIABLE
  // =========================
  useEffect(() => {
    if (selectedBranch) {
      setVariables((prev: any) => ({
        ...prev,
        branch_code: selectedBranch.code,
      }));
    }
  }, [selectedBranch]);

  // =========================
  // EXECUTE COPY
  // =========================
  const handleExecute = async () => {
    if (!selectedBranch) {
      alert("Please select branch");
      return;
    }

    if (!table || !destTable) {
      alert("Please select tables");
      return;
    }

    if (mode === "custom" && !selectedQuery) {
      alert("Please select predefined query");
      return;
    }

    const res = await fetch("/api/copy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        table,
        destTable,

        branchCode: selectedBranch.code,

        queryId: selectedQuery?.id,

        variables: {
          ...variables,
          branch_code: selectedBranch.code,
        },
      }),
    });

    const data = await res.json();

    alert(data.message || data.error);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800">
            Data Copy Tool
          </h1>

          <p className="mt-2 text-green-700">
            Copy data securely between databases
          </p>
        </div>

        <div className="max-w-5xl rounded-2xl border border-green-200 bg-white p-8 shadow-2xl">

          {/* MODE */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-green-800">
              Copy Mode
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
            >
              <option value="auto">Auto Mode</option>
              <option value="custom">Custom Mode</option>
            </select>
          </div>

          {/* BRANCH */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-green-800">
              Select Branch
            </label>

            <select
              value={selectedBranch?.id || ""}
              onChange={(e) => {
                const branch = branches.find(
                  (b) => b.id === e.target.value
                );

                setSelectedBranch(branch);
              }}
              className="w-full rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
            >
              <option value="">Select Branch</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          {/* SOURCE + DEST */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">

            <div>
              <label className="mb-2 block text-sm font-semibold text-green-800">
                Source Table
              </label>

              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
              >
                <option value="">Select Source Table</option>

                {sourceTables.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-green-800">
                Destination Table
              </label>

              <select
                value={destTable}
                onChange={(e) => setDestTable(e.target.value)}
                className="w-full rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
              >
                <option value="">Select Destination Table</option>

                {destTables.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CUSTOM */}
          {mode === "custom" && (
            <div className="space-y-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-green-800">
                  Predefined Query
                </label>

                <select
                  onChange={(e) => {
                    const q = queries.find(
                      (x: any) => x.id == e.target.value
                    );

                    setSelectedQuery(q);

                    // AUTO VARIABLE SET
                    if (selectedBranch) {
                      setVariables({
                        branch_code: selectedBranch.code,
                      });
                    }
                  }}
                  className="w-full rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3"
                >
                  <option value="">Select Query</option>

                  {queries.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AUTO FILLED VARIABLE */}
              {selectedBranch && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-green-800">
                    Branch Code
                  </label>

                  <input
                    value={selectedBranch.code}
                    readOnly
                    className="w-full rounded-xl border-2 border-green-200 bg-gray-100 px-4 py-3"
                  />
                </div>
              )}
            </div>
          )}

          {/* EXECUTE */}
          <div className="mt-10">
            <button
              onClick={handleExecute}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:scale-[1.02]"
            >
              Execute Copy
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}