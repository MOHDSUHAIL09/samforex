import  { useState, useEffect } from 'react';
import CustomTable from '../../Componenets/ui/customtable/CustomTable';
import Pagination from '../../Componenets/ui/pagination/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../api/apiClient';

const DownlineTeam = () => {
  const [loading, setLoading] = useState(false);
  const [downlineData, setDownlineData] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [totalBusiness, setTotalBusiness] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [findlvl, setFindlvl] = useState(1);
  const [levelOptions] = useState([...Array(10).keys()].map(i => i + 1));
  const [pageSize] = useState(10); 

  // Get regno from sessionStorage
  const regno = sessionStorage.getItem('Regno');

  // Table Columns
  const columns = [
    "S.No.",
    "Downline Info",
    "Sponsor",
    "Invested Amount",
    "Status",
  ];

  // Format Amount
  const formatAmount = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Get Status Badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="badge bg-success"> Active</span>;
      case 'inactive':
        return <span className="badge bg-danger"> Inactive</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
    }
  };

  // ✅ Fetch Downline Team Data - FIXED
  const fetchDownlineTeam = async () => {
    if (!regno) {
      toast.error('Registration number not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ✅ FIX: Remove leading space and use proper axios POST
      const response = await apiClient.post(
        '/Dashboard/DownLineTeam',
        {
          mregno: parseInt(regno),
          findlvl: findlvl,
          pageIndex: currentPage,
          pageSize: pageSize
        },
     
      );

      // ✅ FIX: Axios automatically parses JSON, so response.data is the parsed object
      const data = response.data;

      if (data.result === "true" || data.result === true) {
        const teamData = data.response?.data || [];
        const totalCount = data.response?.recordCount || teamData.length;
        const totalBiz = data.response?.totalBusiness || 0;
        
        setDownlineData(teamData);
        setRecordCount(totalCount);
        setTotalBusiness(totalBiz);
      } else {
        toast.error(data.message || 'Failed to fetch downline team');
        setDownlineData([]);
        setRecordCount(0);
        setTotalBusiness(0);
      }
    } catch (error) {
      console.error(" Error fetching downline team:", error);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Something went wrong';
      toast.error(errorMessage);
      
      setDownlineData([]);
      setRecordCount(0);
      setTotalBusiness(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownlineTeam();
  }, [currentPage, findlvl, pageSize]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle level change
  const handleLevelChange = (e) => {
    setFindlvl(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(recordCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (  
    <>
      <ToastContainer position="top-right" />
      <div className="Table-container container-fluid p-3">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h4 className="fw-bold" style={{ color: "#2A3547" }}>Downline Team</h4>
          </div>
        </div>

        {/* Filters + Summary Cards */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              {/* Level Filter */}
              <div className="col-md-3">
                <label className="form-label fw-semibold mb-1">Select Level</label>
                <select 
                  className="form-select form-select-sm"
                  value={findlvl} 
                  onChange={handleLevelChange}
                >
                  {levelOptions.map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
              
              {/* Summary Cards */}
              <div className="col-md-9">
                <div className="d-flex gap-3 justify-content-end flex-wrap">
                  <div className="bg-primary-subtle rounded-3 p-3 text-center0" style={{ minWidth: "130px" }}>
                    <span className="text-muted" style={{ fontSize: "12px" }}>Total Members</span>
                    <h5 className="fw-bold mb-0 text-primary">{recordCount}</h5>
                  </div>
                  <div className="bg-success-subtle rounded-3 p-3 text-center" style={{ minWidth: "150px" }}>
                    <span className="text-muted" style={{ fontSize: "12px" }}>Team Business</span>
                    <h5 className="fw-bold mb-0 text-success">{formatAmount(totalBusiness)}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <CustomTable 
          columns={columns} 
          loading={loading}
          emptyMessage="No downline members found"
        >
          {downlineData.map((item, index) => (
            <tr key={item.regno || index}>
              <td className="py-3 px-3 text-center">
                <div className="sr-no-circle">
                  {startIndex + index + 1}
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <div>
                    <span className="fw-semibold d-block">{item.Name || '-'}</span>
                    <span className="small" style={{fontSize: "15px"}}>{item.loginid || '-'}</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{item.Sponsor || '-'}</span>
                  {/* <span className="text-muted small">{item.introName || '-'}</span> */}
                </div>
              </td>
              <td className="py-3 px-3">
                <div className="d-flex flex-column">
                  <span className="fw-bold " style={{color: "green"}}>{formatAmount(item.kitPrice || item.Stake)}</span>             
                </div>
              </td>
              <td className="py-3 px-3">
                {getStatusBadge(item.status)}
              </td>
            </tr>
          ))}
        </CustomTable>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={recordCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <style jsx>{`
      
        .badge {
          padding: 6px 12px;
          font-weight: 500;
          border-radius: 5px;
        }
        .bg-success {
          background-color: #10b981 !important;
          color: white;
        }
        .bg-danger {
          background-color: #ef4444 !important;
          color: white;
        }
        .bg-secondary {
          background-color: #6b7280 !important;
          color: white;
        }
        .bg-primary-subtle {
          background-color: #dbeafe;
        }
        .bg-success-subtle {
          background-color: #d1fae5;
        }
      `}</style>
    </>
  );
};

export default DownlineTeam;