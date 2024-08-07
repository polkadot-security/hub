import React, { useState, useEffect, useMemo } from "react";
import { Badge, Button, Flex, Title, Stack, Textarea } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_EditActionButtons,
} from "mantine-react-table";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export const streaming = true;

export default function OSVTable() {
  const {
    siteConfig: { customFields: { serverUrl }},
  } = useDocusaurusContext();
  const [osv, setOsv] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resp = await fetch(`${serverUrl}/osv/data`);
        const body = await resp.json();
        console.log(body);
        if (
          !resp.ok ||
          body.data === null ||
          body.data === undefined ||
          typeof body.data !== "object"
        ) {
          throw new Error(body.message);
        }
        setOsv(body.data);
        setIsLoading(false);
      } catch (error) {
        console.error(`Error trying to fetch data: ${error}`);
      }
    };
    if (serverUrl && serverUrl.length > 0) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "database_specific.title",
        id: "title",
        Cell({ cell }) {
          return <b>{cell.getValue()}</b>;
        },
        Edit: () => null,
      },
      {
        header: "ID",
        accessorKey: "id",
        id: "osv_id",
      },
      {
        header: "Severity",
        id: "severity",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.severity &&
            dataRow.affected[0]?.severity[0]?.scope) ||
          "",
      },
      {
        header: "Affected System",
        accessorKey: "database_specific.affected_system",
        id: "affected_system",
      },
      {
        header: "Type",
        accessorKey: "database_specific.type",
        id: "osv_type",
      },
      {
        header: "Discovery Date",
        accessorKey: "database_specific.discovery_method",
        id: "discovery_method",
      },
      {
        header: "Discovery Date",
        accessorKey: "database_specific.discovery_date",
        id: "discovery_date",
      },
      {
        header: "Fixed",
        id: "affected",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.ranges &&
            dataRow.affected[0]?.ranges[0]?.events.find((event) => event.fixed)
              ?.fixed) ||
          false,
        Cell({ cell }) {
          return cell.getValue() ? (
            <Badge color="blue">Fix Available</Badge>
          ) : (
            <Badge color="red">Fix Not Available</Badge>
          );
        },
      },
      {
        header: "Affected Versions",
        id: "affected_versions",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.versions &&
            dataRow.affected[0]?.versions.join("\n")) ||
          "",
        Edit: ({ cell }) => (
          <Textarea
            autosize
            label="Affected Versions"
            value={cell.getValue()}
          />
        ),
      },
      {
        header: "Summary",
        accessorKey: "summary",
        id: "summary",
        Edit: ({ cell }) => <Textarea autosize>{cell.getValue()}</Textarea>,
      },
      {
        header: "Details",
        accessorKey: "details",
        id: "details",
        Edit: ({ cell }) => <Textarea autosize>{cell.getValue()}</Textarea>,
      },
      {
        header: "Modified",
        accessorKey: "modified",
        id: "modified",
      },
      {
        header: "Published",
        accessorKey: "published",
        id: "published",
      },
      {
        header: "Actions",
        id: "actions",
        Cell({ row }) {
          return (
            <Button onClick={() => table.setEditingRow(row)}>Details</Button>
          );
        },
        Edit: () => null,
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: osv,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableEditing: true,
    state: { isLoading },
    renderEmptyRowsFallback: () => (
      <Stack align="center" justify="center" style={{ height: "100%" }}>
        <Title order={5}>No disclosures available yet! Check again soon...</Title>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>{row.original.database_specific.title}</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    initialState: {
      columnVisibility: {
        severity: false,
        osv_id: false,
        osv_type: false,
        discovery_method: false,
        discovery_date: false,
        affected_versions: false,
        summary: false,
        details: false,
        modified: false,
        published: false,
        "mrt-row-actions": false,
        "mrt-row-expand": false,
      },
    },
  });

  return <MantineReactTable table={table}></MantineReactTable>;
}
