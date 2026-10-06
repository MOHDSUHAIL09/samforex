import React from 'react';

const CustomTable = ({ 
  columns, 
  children, 
  loading = false, 
  emptyMessage = "No data found" 
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="py-3 px-4 fw-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                <div className="d-flex justify-content-center align-items-center">
                  <div className="spinner-border text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Loading...</span>
                </div>
              </td>
            </tr>            
          
          ) : (
            children
          )}
          {!loading && !children && (
            <tr>
              <td colSpan={columns.length} className="text-center py-5 text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;