"use client";

import { Suspense, SubmitEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as campaignsApi from "@/lib/api/campaigns";
import { Campaign } from "@/lib/types";

function CampaignsContent() {
  const { showToast } = useToast();
  const { role } = useAuth();
  const canCreate = role === "ADVERTISER";
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(() => searchParams.get("new") === "1");
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
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Campaigns</h1>
        {canCreate && (
          <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "secondary" : "primary"}>
            {!showForm && <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Cancel" : "New campaign"}
          </Button>
        )}
      </div>

      {showForm && canCreate && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                id="campaign-name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer promo"
              />
            </div>
            <div className="flex-1">
              <Input
                id="campaign-budget"
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
        <TableSkeleton rows={5} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : campaigns.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            illustration="campaigns"
            title={canCreate ? "No campaigns yet" : "No campaigns to show"}
            description={canCreate ? "Create your first campaign to start advertising." : undefined}
            action={canCreate && !showForm ? { label: "Create campaign", onClick: () => setShowForm(true) } : undefined}
          />
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <THead>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Budget</Th>
              <Th>Spent</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </THead>
            <TBody>
              {campaigns.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">
                      {c.name || "Untitled campaign"}
                    </Link>
                  </Td>
                  <Td>
                    <Badge status={c.status} />
                  </Td>
                  <Td className="text-neutral-700 dark:text-neutral-100">${c.budget.toFixed(2)}</Td>
                  <Td className="text-neutral-700 dark:text-neutral-100">${c.spent.toFixed(2)}</Td>
                  <Td className="text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${c.id}`}>
                        <Button variant="secondary" className="px-2.5 py-1 text-xs">
                          View
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${c.id}/upload`}>
                        <Button variant="secondary" className="px-2.5 py-1 text-xs">
                          Upload ad
                        </Button>
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
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
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <CampaignsContent />
      </Suspense>
    </RequireAuth>
  );
}
