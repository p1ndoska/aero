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
  const rowspanRemaining: number[] = Array(numCols).fill(0);
  return rows.map((row, rowIdx) => {
    let colIndex = 0;
    let cellIndex = 0;
    const tds: React.ReactNode[] = [];
    while (colIndex < numCols) {
      if (rowspanRemaining[colIndex] > 0) {
        rowspanRemaining[colIndex]--;
        colIndex++;
        continue;
      }
      const cell = row.cells[cellIndex];
      if (!cell) break;
      cellIndex++;
      if (cell.type === 'covered') {
        colIndex++;
        continue;
      }
      const C = getColspan(cell);
      const R = getRowspan(cell);
      tds.push(
        <td key={colIndex} className={tdClassName} colSpan={C > 1 ? C : undefined} rowSpan={R > 1 ? R : undefined}>
          {cellRender(cell)}
        </td>
      );
      for (let j = colIndex; j < colIndex + C; j++) rowspanRemaining[j] = R - 1;
      colIndex += C;
    }
    return <tr key={row.id || rowIdx}>{tds}</tr>;
  });
}
