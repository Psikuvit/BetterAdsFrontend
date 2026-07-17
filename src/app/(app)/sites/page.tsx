"use client";

import { Suspense, SubmitEvent, useCallback, useEffect, useState } from "react";
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
import { useToast } from "@/context/ToastContext";
import { errorMessage } from "@/lib/errors";
import * as sitesApi from "@/lib/api/sites";
import { Site } from "@/lib/types";

function SitesContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(() => searchParams.get("new") === "1");
  const [name, setName] = useState("");
  const [allowedOrigin, setAllowedOrigin] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<Site | null>(null);

  const load = useCallback((pageToLoad: number) => {
    setLoading(true);
    sitesApi
      .listSites({ page: pageToLoad, size: 10 })
      .then((res) => {
        setSites(res.content);
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
      const site = await sitesApi.createSite({
        name,
        allowedOrigin: allowedOrigin || undefined,
        bundleId: bundleId || undefined,
      });
      setName("");
      setAllowedOrigin("");
      setBundleId("");
      setShowForm(false);
      setJustCreated(site);
      load(0);
      showToast("Site registered", "success");
    } catch (err) {
      showToast(errorMessage(err), "error");
    } finally {
      setCreating(false);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied`, "success");
    } catch {
      showToast("Couldn't copy to clipboard", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Sites</h1>
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "secondary" : "primary"}>
          {!showForm && <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "Register site"}
        </Button>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Register the web domain or mobile app bundle ID where you&apos;ll embed BetterAds. The
        site key it generates is non-secret — safe to ship in client-side code, the same trust
        model as a Stripe publishable key.
      </p>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              id="site-name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My publisher site"
              required
            />
            <Input
              id="site-origin"
              label="Web origin (optional)"
              value={allowedOrigin}
              onChange={(e) => setAllowedOrigin(e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              id="site-bundle-id"
              label="Mobile bundle ID (optional)"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              placeholder="com.example.app"
            />
            <div>
              <Button type="submit" loading={creating}>
                Register
              </Button>
            </div>
          </form>
        </Card>
      )}

      {justCreated && (
        <Card>
          <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-white">
            Site key for &ldquo;{justCreated.name}&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-neutral-100 px-3 py-2 text-xs dark:bg-neutral-800">
              {justCreated.siteKey}
            </code>
            <Button variant="secondary" onClick={() => copy(justCreated.siteKey, "Site key")}>
              Copy
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : sites.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            illustration="ads"
            title="No sites yet"
            description="Register a site or app to get a site key for the BetterAds SDK."
            action={!showForm ? { label: "Register site", onClick: () => setShowForm(true) } : undefined}
          />
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <THead>
              <Th>Name</Th>
              <Th>Site key</Th>
              <Th>Origin / bundle ID</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </THead>
            <TBody>
              {sites.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-neutral-900 dark:text-white">{s.name}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <code className="truncate rounded-md bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
                        {s.siteKey}
                      </code>
                      <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => copy(s.siteKey, "Site key")}>
                        Copy
                      </Button>
                    </div>
                  </Td>
                  <Td className="text-neutral-500">{s.allowedOrigin || s.bundleId || "—"}</Td>
                  <Td>
                    <Badge status={s.status} />
                  </Td>
                  <Td className="text-neutral-500">{new Date(s.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page === 0} onClick={() => load(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SitesPage() {
  return (
    <RequireAuth allowedRoles={["ADVERTISER", "ADMIN"]}>
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <SitesContent />
      </Suspense>
    </RequireAuth>
  );
}
