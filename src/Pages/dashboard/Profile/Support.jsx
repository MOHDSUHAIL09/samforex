import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import CustomTable from '../../../Componenets/ui/customtable/CustomTable';
import Pagination from '../../../Componenets/ui/pagination/Pagination';
import toast from 'react-hot-toast';

const Support = () => {
  const navigate = useNavigate();
  const { user, userData, refreshData } = useUser();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ subject: '', ticketType: '', messege: '' });
  const [submitting, setSubmitting] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const pageSize = 10;

  const getRegNo = () => userData?.regno || user?.Regno || user?.regno || sessionStorage.getItem('regno') || '1';
  
  const getLoginId = () => {
    if (userData?.me) return userData.me;
    if (user?.loginid) return user.loginid;
    const stored = sessionStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.me) return parsed.me;
        if (parsed.loginid) return parsed.loginid;
      } catch {}
    }
    return 'india';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
      });
    } catch { return dateString; }
  };

  // ✅ Fetch Tickets
  const fetchTickets = async (page = 1) => {
    const regNo = getRegNo();
    setLoading(true);
    try {
      const response = await apiClient.get('/Dashboard/TicketList', {
        params: { 
          PageIndex: page, 
          PageSize: pageSize, 
          RegNo: regNo,
          PaymentMode: activeFilter
        }
      });
      
      
      const data = response.data;
      
      if (data?.result === "true" || data?.result === true) {
        const responseData = data.response;
        const ticketData = responseData?.data || [];
        const recordCount = responseData?.recordCount || 0;
        
        
        const formatted = ticketData.map(item => ({
          id: item.MsgId,
          ticketId: `FX${item.MsgId}`,
          date: formatDate(item.MsgDate),
          type: item.MsgType || 'N/A',
          subject: item.MsgSubject || 'VIEW',
          status: item.status || 'Pending',
          message: item.Message || item.Msg || 'No message provided'
        }));
        
        setTickets(formatted);
        setTotalRecords(recordCount);
      } else {
        setTickets([]);
        setTotalRecords(0);
        toast.error(data?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tickets');
      setTickets([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(pageIndex);
  }, [pageIndex, activeFilter]);

  // ✅ Create Ticket
  const createTicket = async (ticketData) => {
    const loginId = getLoginId();
    const regNo = getRegNo();
    setSubmitting(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('From', regNo);
      formDataPayload.append('Subject', ticketData.subject);
      
      let messageType = ticketData.ticketType;
      if (messageType === 'withdrawal') messageType = 'withdraw';
      formDataPayload.append('MessageType', messageType);
      formDataPayload.append('LoginId', loginId);
      formDataPayload.append('Message', ticketData.messege || '');
      if (selectedImage) formDataPayload.append('TicketImgage', selectedImage);

      const response = await apiClient.post('/Dashboard/CreateTicket', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      
      if (response.data?.result === "true" || response.data?.result === true) {
        const responseData = response.data.response;
        if (responseData?.success) {
          toast.success(responseData?.message || 'Ticket created successfully!');
          await fetchTickets(pageIndex);
          if (refreshData) refreshData();
          setShowModal(false);
          setFormData({ subject: '', ticketType: '', messege: '' });
          setSelectedImage(null);
        } else {
          toast.error(responseData?.message || 'Failed to create ticket');
        }
      } else {
        toast.error(response.data?.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('❌ Create Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ticketType) return toast.error('Please select ticket type');
    if (!formData.subject.trim()) return toast.error('Please enter subject');
    createTicket(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      toast.success(`Image selected: ${e.target.files[0].name}`);
    }
  };

  const handleViewTicket = (ticket) => {
    navigate(`/dashboard/supporthelp/${ticket.id}`, { state: { ticket } });
  };

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const getSerialNo = (index) => {
    return (pageIndex - 1) * pageSize + index + 1;
  };

  const getTicketTypeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'withdraw':
      case 'withdrawal': return 'bg-danger';
      case 'income': return 'bg-success';
      case 'deposit': return 'bg-primary';
      case 'purchase_bot': return 'bg-warning';
      case 'profile': return 'bg-info';
      case 'not w': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="Table-container" style={{ 
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
    }}>
      {/* ✅ HEADER - Like Dashboard */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="mb-0 text-dark" style={{ fontWeight: '600' }}>
             Ticket List
          </h3>
          {totalRecords > 0 && (
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
              Total Tickets: {totalRecords}
            </p>
          )}
        </div>
        <button 
          className="btn btn-primary rounded-pill px-4 py-2"
          style={{
            background: '#5D87FF',
            border: 'none',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(93, 135, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setShowModal(true)}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <i className="ti ti-plus me-2"></i>Create New Ticket
        </button>
      </div>

      {/* ✅ TABLE - Like Dashboard Style */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <CustomTable 
            columns={["S.NO.", "DATE", "TICKET ID", "TICKET TYPE", "SUBJECT", "STATUS"]}
            loading={loading}
            emptyMessage="📭 No tickets found. Create your first ticket!"
          >
            {tickets.map((ticket, index) => (
              <tr key={ticket.id} style={{ transition: 'all 0.3s ease' }}>
                <td className="text-center">
                  <span className="sr-no-circle">
                    {String(getSerialNo(index)).padStart(2, '0')}
                  </span>
                </td>
                <td style={{ color: "#6b7280", fontSize: "13px" }}>
                  {ticket.date}
                </td>
                <td>
                  <span className="fw-semibold" style={{ color: '#5D87FF' }}>
                    {ticket.ticketId}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getTicketTypeClass(ticket.type)} px-3 py-2 rounded-pill`}>
                    {ticket.type}
                  </span>
                </td>
                <td>
                  <span className="text-truncate d-inline-block" style={{ maxWidth: '200px', color: '#333' }}>
                    {ticket.subject}
                  </span>
                </td>
                <td>
                  <span className={`badge ${ticket.status === 'Pending' ? 'bg-warning' : 'bg-success'} px-3 py-2 rounded-pill`}>
                    {ticket.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </CustomTable>
        </div>
      </div>

      {/* ✅ PAGINATION - Like Dashboard */}
      <div className="mt-4">
        <Pagination 
          currentPage={pageIndex}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPageIndex}
        />
      </div>

{/* ✅ MODAL - Premium Styled Like Dashboard */}
{showModal && (
  <div 
    className="modal-overlay"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}
    onClick={() => setShowModal(false)}
  >
    <div 
      className="modal-content"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.4s ease-out',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ✅ Decorative Top Bar */}
      <div style={{
        height: '6px',
        background: 'linear-gradient(90deg, #5D87FF, #696cff, #8B5CF6)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px'
      }} />

      {/* Modal Header */}
      <div style={{
        padding: '24px 28px 16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div>
          <h4 style={{
            color: '#1a1a2e',
            fontWeight: '700',
            margin: 0,
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #5D87FF, #696cff)',
              color: '#fff',
              fontSize: '18px'
            }}>
              <i className="ti ti-ticket"></i>
            </span>
            Create New Ticket
          </h4>
        
        </div>
        <button
          onClick={() => setShowModal(false)}
          style={{
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            marginTop: '-4px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#fee2e2';
            e.target.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f1f5f9';
            e.target.style.color = '#64748b';
          }}
        >
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit}>
        <div style={{ 
          padding: '24px 28px', 
          background: '#fafcff',
        }}>
          
          {/* Ticket Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <i className="ti ti-category me-1" style={{ color: '#5D87FF' }}></i>
              Ticket Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              name="ticketType" 
              value={formData.ticketType} 
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'all 0.3s ease',
                color: '#1e293b',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#5D87FF';
                e.target.style.boxShadow = '0 0 0 4px rgba(93, 135, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            >
              <option value="">-- Select Message Type --</option>
              <option value="income">💰 Income</option>
              <option value="withdrawal">💸 Withdrawal</option>
              <option value="deposit">💳 Deposit</option>
              <option value="purchase_bot">🤖 Purchase BOT</option>
              <option value="profile">👤 Profile</option>
              <option value="other">📝 Other</option>
            </select>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <i className="ti ti-edit me-1" style={{ color: '#5D87FF' }}></i>
              Subject <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief summary of your issue"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#5D87FF';
                e.target.style.boxShadow = '0 0 0 4px rgba(93, 135, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <i className="ti ti-message me-1" style={{ color: '#5D87FF' }}></i>
              Message <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="messege"
              value={formData.messege}
              onChange={handleInputChange}
              placeholder="Describe your issue in detail..."
              rows="5"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                minHeight: '120px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#5D87FF';
                e.target.style.boxShadow = '0 0 0 4px rgba(93, 135, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {/* Attachment */}
          <div style={{ marginBottom: '4px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <i className="ti ti-paperclip me-1" style={{ color: '#5D87FF' }}></i>
              Attachment (Optional)
            </label>
            <div 
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '14px',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={() => document.getElementById('file-upload-support').click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5D87FF';
                e.currentTarget.style.backgroundColor = '#f0f4ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#5D87FF';
                e.currentTarget.style.backgroundColor = '#e8edff';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                id="file-upload-support"
                style={{ display: 'none' }}
              />
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5D87FF15, #696cff15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <i className="ti ti-cloud-upload" style={{ fontSize: '32px', color: '#5D87FF' }}></i>
              </div>
              <p style={{ margin: '0', fontWeight: '500', color: '#1e293b', fontSize: '15px' }}>
                Click to upload or drag & drop
              </p>
              <small style={{ color: '#94a3b8', fontSize: '13px' }}>
                PNG, JPG, GIF up to 5MB
              </small>
            </div>
            
            {selectedImage && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f1f5f9',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #5D87FF, #696cff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '16px'
                  }}>
                    <i className="ti ti-file"></i>
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                      {selectedImage.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {(selectedImage.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <i className="ti ti-trash"></i> Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px'
        }}>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            style={{
              padding: '10px 28px',
              borderRadius: '50px',
              border: '2px solid #e2e8f0',
              backgroundColor: 'transparent',
              color: '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 32px',
              borderRadius: '50px',
              border: 'none',
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #5D87FF, #696cff)',
              color: '#ffffff',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: submitting ? 'none' : '0 4px 16px rgba(93, 135, 255, 0.35)'
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(93, 135, 255, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(93, 135, 255, 0.35)';
              }
            }}
          >
            {submitting ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                Creating...
              </>
            ) : (
              <>
                <i className="ti ti-send"></i>
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* ✅ Animations */}
<style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>

    </div>
  );
};

export default Support;