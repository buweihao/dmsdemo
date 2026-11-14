import React from 'react';
import { buildStatusMatrixRows } from '../../utils/emsState';

interface StatusMatrixProps {
  items: readonly string[];
  columns?: number;
}

export const StatusMatrix: React.FC<StatusMatrixProps> = ({ items, columns = 4 }) => {
  const rows = buildStatusMatrixRows(items, columns);

  return (
    <div className="table-scroll">
      <table className="status-matrix">
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={`status-row-${rowIdx}`}>
              {row.map((cell, colIdx) => {
                if (!cell) {
                  return (
                    <React.Fragment key={`empty-${rowIdx}-${colIdx}`}>
                      <td className="status-cell" />
                      <td />
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={`${cell.name}-${colIdx}`}>
                    <td className="status-cell">
                      <span
                        className={`status-lamp${cell.isWarn ? ' warn' : ''}`}
                        title={cell.isWarn ? '告警' : '正常'}
                      />
                    </td>
                    <td>{cell.name}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
