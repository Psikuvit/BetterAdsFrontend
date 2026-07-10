"use client";

import { SubmitEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Campaign } from "@/lib/types";

function CampaignsContent() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback((pageToLoad: number) => {
    setLoading(true);
    campaignsApi
      .listCampaigns({ page: pageToLoad, size: 10, sort: "createdAt,desc" })
      .then((res) => {
        setCampaigns(res.content);
        setTotalPages(res.totalPages);
        setPage(res.number);
        setError("");
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  async function handleCreate(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    try {
      await campaignsApi.createCampaign({
        name: name || undefined,
        budget: budget || undefined,
      });
      setName("");
      setBudget("");
      setShowForm(false);
      load(0);
      showToast("Campaign created", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Campaigns</h1>
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "secondary" : "primary"}>
          {showForm ? "Cancel" : "New campaign"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer promo"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Loading campaigns...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : campaigns.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">No campaigns yet. Create your first one above.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Spent</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${c.id}`} className="font-medium hover:underline">
                      {c.name || "Untitled campaign"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-4 py-3">${c.budget.toFixed(2)}</td>
                  <td className="px-4 py-3">${c.spent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => load(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <CampaignsContent />
    </RequireAuth>
  );
}
