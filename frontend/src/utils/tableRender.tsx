import React from 'react';
import type { TableCellContent, TableRow } from '@/types/branch';

export function getColspan(cell: TableCellContent): number {
  return cell.type === 'covered' ? 1 : (cell.colspan ?? 1);
}

export function getRowspan(cell: TableCellContent): number {
  return cell.type === 'covered' ? 1 : (cell.rowspan ?? 1);
}

export function renderTableBody(
  rows: TableRow[],
  numCols: number,
  cellRender: (cell: TableCellContent) => React.ReactNode,
  tdClassName: string
): React.ReactNode[] {
  return rows.map((row, rowIdx) => {
    const tds: React.ReactNode[] = [];
    let colIndex = 0;
    row.cells.forEach((cell, cellIdx) => {
      if (colIndex >= numCols) return;
      if (cell.type === 'covered') {
        colIndex += 1;
        return;
      }
      const C = getColspan(cell);
      const R = getRowspan(cell);
      tds.push(
        <td
          key={cellIdx}
          className={tdClassName}
          colSpan={C > 1 ? C : undefined}
          rowSpan={R > 1 ? R : undefined}
        >
          {cellRender(cell)}
        </td>
      );
      colIndex += C;
    });
    return <tr key={row.id || rowIdx}>{tds}</tr>;
  });
}
