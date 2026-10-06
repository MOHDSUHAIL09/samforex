// QRModal.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MdInfo } from "react-icons/md";
import { useUser } from '../../context/UserContext';

const QRModal = ({ isOpen, onClose }) => {
    const { userData } = useUser();
    const [referralLink, setReferralLink] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const mobileRegex = /android|iphone|ipad|ipod|blackberry|windows phone/i;
            return mobileRegex.test(userAgent.toLowerCase());
        };
        setIsMobile(checkMobile());
    }, []);

    useEffect(() => {
        if (isOpen && userData) {
            generateReferralLink();
        }
    }, [isOpen, userData]);

    const generateReferralLink = () => {
        try {
            const loginid = userData?.loginid;
            const baseUrl = 'https://apxmindai.com';
            const link = `${baseUrl}/signup?ref=${loginid}`;
            setReferralLink(link);
        } catch (error) {
            console.error("Error generating referral link:", error);
            setReferralLink('https://apxmindai.com/signup');
        }
    };

    // COPY FUNCTION - Only copy, no share logic
    const copyReferralLink = async () => {
        
        try {
            // Try modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(referralLink);
                setCopySuccess('✅ Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
                return;
            }
        } catch (error) {
            console.warn("⚠️ Clipboard API failed:", error);
        }

        // Fallback method
        try {
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            textArea.setAttribute('readonly', '');
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                setCopySuccess('✅ Copied!');
            } else {
                setCopySuccess('Copy failed');
                alert(`Please copy manually:\n${referralLink}`);
            }
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (error) {
            console.error("Copy failed:", error);
            setCopySuccess('Copy failed');
            alert(`Please copy manually:\n${referralLink}`);
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    // SHARE FUNCTION - Only share, NO copy unless user confirms
    const handleShare = async () => {

        // If share is not available, fallback to copy
        if (!navigator.share) {
            await copyReferralLink();
            return;
        }

        const shareData = {
            title: 'Join Apxmind AI',
            text: `Join Apxmind AI using my referral link and start earning! `,
            url: referralLink,
        };

        try {
            await navigator.share(shareData);
            setCopySuccess('✅ Shared successfully!');
            setTimeout(() => setCopySuccess(''), 2000);
            
        } catch (error) {
            
            // User cancelled - Don't copy automatically!
            if (error.name === 'AbortError') {
                setCopySuccess('⏹️ Share cancelled');
                setTimeout(() => setCopySuccess(''), 2000);
                return;
            }
            
            // Other errors - Ask user if they want to copy
            console.error("Share failed with error:", error.message);
            
            // DON'T auto-copy - Ask user instead
            const shouldCopy = window.confirm(
                'Share failed. Would you like to copy the link instead?'
            );
            
            if (shouldCopy) {
                await copyReferralLink();
            } else {
                setCopySuccess('Share failed');
                setTimeout(() => setCopySuccess(''), 2000);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                zIndex: 1050,
                animation: "fadeIn 0.3s ease-out",
            }}
            onClick={onClose}
        >
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-100px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    .modal-slide-down {
                        animation: slideDown 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
                    }
                    
                    /* Mobile touch improvements */
                    .btn-share, .btn-copy {
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        min-height: 44px;
                    }
                    
                    .btn-share:active, .btn-copy:active {
                        transform: scale(0.96);
                    }
                `}
            </style>

            <div
                className="modal-slide-down"
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    maxWidth: "400px",
                    width: "90%",
                    padding: "20px",
                    position: "relative",
                    marginTop: "80px",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "#f3f4f6",
                        border: "none",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        fontSize: "16px",
                        cursor: "pointer",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                    }}
                >
                    ✕
                </button>

                {/* Modal Content */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "#f0fdf4",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "auto",
                            marginRight: "auto",
                            marginBottom: "12px",
                        }}
                    >
                        <MdInfo size={22} color="#04832f" />
                    </div>

                    <h3 style={{ marginBottom: "4px", color: "#2A3547", fontSize: "18px", fontWeight: "600" }}>
                        Invite Your Friends
                    </h3>
                    <p style={{ color: "#7C8FAC", marginBottom: "16px", fontSize: "12px" }}>
                        Share this QR code or link with your friends
                    </p>

                    {/* QR Code */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "16px",
                            padding: "12px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                        }}
                    >
                        {referralLink ? (
                            <QRCodeSVG
                                value={referralLink}
                                size={160}
                                bgColor={"#ffffff"}
                                fgColor={"#04832f"}
                                level={"H"}
                                includeMargin={true}
                            />
                        ) : (
                            <div style={{ 
                                width: "160px", 
                                height: "160px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                backgroundColor: "#f0f0f0"
                            }}>
                                <p style={{ color: "#999", fontSize: "12px" }}>Loading...</p>
                            </div>
                        )}
                    </div>

                    {/* Link Input */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            onClick={() => {
                                // Tap on input to copy (mobile friendly)
                                if (isMobile) {
                                    copyReferralLink();
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "6px",
                                fontSize: isMobile ? "14px" : "11px",
                                backgroundColor: "#f8f9fa",
                                color: "#333",
                                wordBreak: "break-all",
                                WebkitUserSelect: "text",
                                userSelect: "text",
                            }}
                        />
                    </div>

                    {/* Copy Success Message */}
                    {copySuccess && (
                        <div style={{ 
                            marginBottom: "10px",
                            color: copySuccess.includes('❌') || copySuccess.includes('⏹️') ? '#dc3545' : '#28a745',
                            fontSize: "13px",
                            fontWeight: "600",
                            padding: "8px",
                            backgroundColor: copySuccess.includes('❌') || copySuccess.includes('⏹️') ? '#f8d7da' : '#d4edda',
                            borderRadius: "6px",
                        }}>
                            {copySuccess}
                        </div>
                    )}

                    {/* IMPROVED Buttons */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                        <button
                            onClick={handleShare}
                            className="btn-share"
                            style={{
                                flex: 1,
                                backgroundColor: "#04832f",
                                color: "white",
                                border: "none",
                                padding: "12px 10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: isMobile ? "16px" : "14px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                                touchAction: "manipulation",
                                WebkitTapHighlightColor: "transparent",
                                minHeight: "44px",
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#036b26"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#04832f"}
                            onTouchStart={(e) => e.currentTarget.style.backgroundColor = "#036b26"}
                            onTouchEnd={(e) => e.currentTarget.style.backgroundColor = "#04832f"}
                        >
                             Share
                        </button>
                        <button
                            onClick={copyReferralLink}
                            className="btn-copy"
                            style={{
                                flex: 1,
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                padding: "12px 10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: isMobile ? "16px" : "14px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                                touchAction: "manipulation",
                                WebkitTapHighlightColor: "transparent",
                                minHeight: "44px",
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                            onTouchStart={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
                            onTouchEnd={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        >
                             Copy Link
                        </button>
                    </div>

                    {/* Instruction Text */}
                    <p style={{ fontSize: "10px", color: "#7C8FAC", margin: 0 }}>
                        {isMobile ? "Tap link or use buttons above" : "Scan QR code or share link to invite friends"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRModal;