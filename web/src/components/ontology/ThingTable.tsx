/**
 * ThingTable Component
 * Renders things in a table layout
 */

import { type Thing } from "@/lib/ontology/types";
import { useThingConfig } from "@/lib/ontology/hooks/useThingConfig";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Field } from "./Field";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface ThingTableProps {
  things: Thing[];
  onRowClick?: (thing: Thing) => void;
}

export function ThingTable({ things, onRowClick }: ThingTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  if (things.length === 0) return null;

  const config = useThingConfig(things[0].type);
  const tableView = config.ui.views.table;

  if (!tableView) return null;

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(fieldName);
      setSortDirection("asc");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {tableView.fields.map((fieldName) => {
              const fieldConfig = config.ui.fields[fieldName];
              return (
                <TableHead key={fieldName}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort(fieldName)}
                  >
                    {fieldConfig?.label || fieldName}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {things.map((thing) => (
            <TableRow
              key={thing._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(thing)}
            >
              {tableView.fields.map((fieldName) => (
                <TableCell key={fieldName}>
                  <Field
                    name={fieldName}
                    value={thing.properties[fieldName]}
                    config={config.ui.fields[fieldName]}
                    thing={thing}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
