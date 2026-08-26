"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RequireAbility } from "@/components/require-ability";
import { useGetAuditLogs } from "@/features/auditLogs/hooks/useAuditLogQueries";
import { AuditLogFilter } from "@/features/auditLogs/types";
import { ChevronDown, ChevronRight } from "lucide-react";

const PAGE_LIMIT = 20;

export default function AuditLogPage() {
  const [subject, setSubject] = useState("");
  const [actorId, setActorId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filter: AuditLogFilter = {
    subject: subject || undefined,
    actorId: actorId ? Number(actorId) : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit: PAGE_LIMIT,
  };

  const { data: entries = [], isLoading } = useGetAuditLogs(filter);

  const handleApplyFilters = () => setPage(1);

  return (
    <RequireAbility action="read" subject="audit-logs">
    <div className="flex flex-col gap-8">
      <div className="px-2 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <div className="text-sm font-medium text-muted-foreground">
          Role, permission, and permission-grant changes.
        </div>
      </div>

      <div className="flex flex-row gap-2 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <Label>Subject</Label>
          <Input
            placeholder="Role"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Actor ID</Label>
          <Input
            placeholder="1"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={handleApplyFilters}>Apply filters</Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No audit log entries.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <Fragment key={entry.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                  >
                    <TableCell>
                      {expandedId === entry.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>User #{entry.actorId}</TableCell>
                    <TableCell>
                      {entry.action}:{entry.subject} (#{entry.entityId})
                    </TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {expandedId === entry.id && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="font-medium mb-1">Before</div>
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(entry.before, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="font-medium mb-1">After</div>
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(entry.after, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < PAGE_LIMIT}
        >
          Next
        </Button>
      </div>
    </div>
    </RequireAbility>
  );
}
