import { SetStateAction, useMemo, useState } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_Icons,
} from 'mantine-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Box, Button, Flex, Menu, Modal } from '@mantine/core';
import { IconGraph } from '@tabler/icons-react';
import classes from './style/Navbar.module.css';
import cx from 'clsx';
import 'mantine-react-table/styles.css';
import { Download } from './Download';


export type Metrics = {
  id: string;
  githubRepo: string;
  numTasks: number;
  numFiles: number;
  totalBytesRead: number;
  totalBytesWritten: number;
  work: number;
  depth: number;
  minWidth: number;
  maxWidth: number;
};

type WfInstance = {
  id?: string
  name: string,
  description: string,
  createdAt: string,
  schemaVersion: string,
  wms: {
    name: string,
    version: string,
    url: string
  },
  author: {
    name: string,
    email: string,
    institution: string,
    country: string
  }
  workflow: {
    makespanInSeconds: number,
    executedAt: string,
    machines: {
      system: string,
      architecture: string,
      nodeName: string,
      release: string,
      memoryInBytes: number,
      cpu: {
        count: number,
        speed: number,
        vendor: string
      }
    }[],
    tasks: {
      name: string,
      id: string,
      category: string,
      type: string,
      command: {
        program: string,
        arguments: string[]
      },
      parents: string[],
      files: {
        name: string,
        sizeInBytes: number,
        link: string
      }[],
      runtimeInSeconds: number,
      cores: number,
      avgCPU: number,
      readBytes: number,
      writtenBytes: number,
      memoryInBytes: number,
      energy: number,
      avgPower: number,
      priority: number,
      machine: string
    }[]
  }
};

function formatBytes(bytes: number, unit: string) {
  const units: { [ key: string ]: number } = {
    "B": 1,
    "KB": 1024,
    "MB": 1024 **2,
    "GB": 1024 **3,
    "TB": 1024 **4
  };

  if (unit in units) {
    return (bytes / units[unit]).toFixed(2);
  } else {
    throw new Error("Invalid Unit provided to function: " + unit + " needs to be changed.");
  }
}

function formatWork(work: number, unit: string) {
  const unitsInSeconds:{[key: string]: number} = {
    'sec': 1,
    'min': 60,
    'hr': 3600,
    'day(s)':86400
  }

  if(unit in unitsInSeconds) {
    return (work / unitsInSeconds[unit]).toFixed(2);
  } else {
    throw new Error("Invalid unit provided to function: " + unit + " needs to be changed.")
  }
}

export function MetricsTable({
  data
} : {
  data: Metrics[]
}) {
  // TODO Replace these temporary filtering values with a way to sort based on ByteUnit and WorkUnit
  const testByteUnit = 'MB';
  const testWorkUnit = 'min';

  const [opened, { open, close }] = useDisclosure(false);
  
// Columns to be used in the table.
  const columns = useMemo<MRT_ColumnDef<Metrics>[]>(
    () => [
      {
        id: 'workflow',
        header: 'Workflow',
        columns: [
          {
            accessorKey: 'id',
            header: 'id   ',
            size: 50,
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            enableHiding: false,
          },
          {
            accessorKey: 'githubRepo',
            header: 'Github Repository',
            size: 50,
            enableClickToCopy: true,
            filterVariant: 'multi-select',
            enableHiding: false,
          },

        ],
      },
      {
        id: 'metrics',
        header: 'Metrics',
        columns: [
          {
            accessorKey: 'numTasks',
            header: 'Number of Tasks',
            size: 40,
            columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
            filterFn: 'between',
          },
          {
            accessorKey: 'numFiles',
            header: 'Number of Files',
            size: 40,
            columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
            filterFn: 'between',
          },
          {
            accessorFn: (row) => {return formatBytes(row.totalBytesRead, testByteUnit)},
            id: 'totalBytesRead',
            header: 'Total Bytes Read',
            size: 50,
            columnFilterModeOptions: ['fuzzy', 'contains', 'between', 'betweenInclusive'],
            Cell: ({ cell }) =>(
              <Box>
                {cell.getValue<number>() + " " + testByteUnit}
              </Box>
            )
          },
          {
            accessorFn: (row) => {return formatBytes(row.totalBytesWritten, testByteUnit)},
            id: 'totalBytesWritten',
            header: 'Total Bytes Written',
            size: 50,
            columnFilterModeOptions: ['fuzzy', 'contains', 'between', 'betweenInclusive'],
            Cell: ({ cell }) =>(
              <Box>
                {cell.getValue<number>() + " " + testByteUnit}
              </Box>
            )
          },
          {
            accessorFn: (row) => {return formatWork(row.work, testWorkUnit)},
            id: 'work',
            header: 'Total Work',
            size: 30,
            columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith',],
            Cell: ({ cell }) =>(
              <Box>
                {cell.getValue<number>() + " " + testWorkUnit}
              </Box>
            )
          },
          {
            accessorKey: 'depth',
            header: 'Depth of Workflow',
            size: 30,
            columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
            filterFn: 'between',
          },
          {
            accessorKey: 'minWidth',
            header: 'Minimum Width',
            size: 30,
            columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
            filterFn: 'between',
          },
          {
            accessorKey: 'maxWidth',
            header: 'Maximum Width',
            size: 30,
            columnFilterModeOptions: [ 'fuzzy', 'between', 'greaterThan', 'lessThan', 'betweenInclusive', 'greaterThanOrEqualTo', 'lessThanOrEqualTo'],
            filterFn: 'between',
          },
        ],
      },
    ],
    [],
  );

  const faIcons: Partial<MRT_Icons> = {
    IconDots: () => <IconGraph className={cx(classes.icon, classes.light)} stroke={1.5}/>
  }

  const table = useMantineReactTable({
    columns,
    data,
    icons: faIcons,
    enableColumnFilterModes: true,
    enableColumnDragging: false,
    enableFacetedValues:true,
    enableGrouping: true,
    enablePinning: true,
    enableRowActions: true,
    enableRowSelection: true,
    initialState: { 
      showGlobalFilter: true,
      columnVisibility: {
        id: true,
        githubRepo: true,
        numTasks: true,
        numFiles: true,
        totalBytesRead: false,
        totalBytesWritten: false,
        work: false,
        depth: false,
        minWidth: false,
        maxWidth: false,
      },
      pagination: { pageIndex: 0, pageSize: 10 }
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
      radius: 'xl',
      size: 'lg',
    },
    mantineSearchTextInputProps: {
      placeholder: 'Search Workflows',
    },
    renderRowActionMenuItems: ({ row }) => (
        <div onClick={open}>
          <Modal opened={opened} onClose={close} title="WfMetric Visualization" size="70%">{row.id}</Modal>
        </div>
    ), 
    renderTopToolbar: ({ table }) => {
      return (
        <Flex p="md" justify="space-between">
          <Flex>
            <Download table={table} />
          </Flex>
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table}/>
            <MRT_GlobalFilterTextInput table={table} />
          </Flex>
        </Flex>
      );
    }
  });

  return (
  <MantineReactTable table={table} />
  );
};
