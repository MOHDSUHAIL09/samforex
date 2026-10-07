import { useState, useEffect } from 'react';
import '../../assets/css/bootstrap.min.css'
import '../../assets/css/style.min.css'

import logo from "../../assets/images/logo/logo-apex.png";
import favLogo from "../../assets/images/logo/logo-apex.png";

import sun from "../../assets/images01/sun.png";
import star from "../../assets/images01/star.png";
import whyTrade from "../../assets/images01/why_trade.png";
import tradeVector from "../../assets/images01/trade_vector.png";

import buttonImg from "../../assets/images01/button.png";

import coinImg from "../../assets/images01/coin.png";
import star2Img from "../../assets/images01/star2.png";
import coinVectorImg from "../../assets/images01/coin_vector.png";
import tradeOnImg from "../../assets/images01/trade_on.png";

import starImg from "../../assets/images01/star.png";
import vector2Img from "../../assets/images01/vector2.png";
import sunImg from "../../assets/images01/sun.png";
import blogNewsImg from "../../assets/images01/blog_news.png";
import blogNews2Img from "../../assets/images01/blog_news2.png";
import blogNews3Img from "../../assets/images01/blog_news3.png";

import vectorImg from "../../assets/images01/vector.png";
import vector4Img from "../../assets/images01/vector4.png";
import starFocusImg from "../../assets/images01/star_focus.png";

// import heroimg from '../../assets/images01/icon/hero.png'
// import heroBgVectorImg from "../../assets/images01/hero_bg_vector.png";

import vector9Img from "../../assets/images01/vector9.png";
import vectorRocket1Img from "../../assets/images01/vector_rocket1.png";

import vector20Img from "../../assets/images01/vector20.png";
import faqImg from "../../assets/images01/faq.png";


import heroback from '../../assets/images01/icon/heroback.png'
import herobackmobile from '../../assets/images01/icon/herobackmobile.jpg'
import star01 from '../../assets/images01/circle_star2.png'

import { Link } from 'react-router-dom';
import Marquee from './Marquee';

const LandingPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    { q: "What is trading?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "How can I get started with trading?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "How can I stay updated on market news and trends?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "What are the different types of trading?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "Is trading suitable for everyone?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "What is fundamental analysis?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
    { q: "What are the risks associated with trading?", a: "Trading involves buying and selling financial instruments like stocks advantage of price fluctuations in these assets." },
  ];

  // ================= NAV ITEMS =================
  const navItems = [
    { label: "Home", id: "home" },



    { label: "Markets", id: "markets" },
    { label: "Trade On Our", id: "trade-on-our" },
    { label: "Traders", id: "traders" },
    { label: "Faq", id: "faq" },
  ];

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setIsActive(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Header fixed animation (jQuery ko React me convert kiya)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobile detect
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 991);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDropdownToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ✅ Smooth scroll to section
  const handleNavClick = (sectionId) => {
    if (isMobile) setMenuOpen(false);
    setOpenDropdown(null);

    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = isMobile ? 70 : 90;
      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // ================= STYLES =================
  const headerStyle = {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    width: "100%",
    background: "#000",
    padding: isMobile ? "12px 16px" : "10px",
    transition: "all 0.4s ease",
  };

const sectionStyle = {
  backgroundImage: `url(${isMobile ? herobackmobile : heroback})`,  // ✅ mobile/desktop switch
  backgroundColor: "#141414",
  backgroundRepeat: "no-repeat",
  backgroundPosition: isMobile ? "center center" : "left center",  // ✅ mobile pe center
  backgroundSize: "cover",
  height: isMobile ? "auto" : "87vh",        // ✅ mobile pe auto height
  minHeight: isMobile ? "100vh" : "87vh",     // ✅ mobile pe full screen
  paddingTop: isMobile ? "20px" : "0",       // ✅ mobile pe header ke neeche space
  paddingBottom: isMobile ? "60px" : "0",     // ✅ mobile pe bottom space
};

  return (
    <>
      <Marquee/>
      {/* Scroll To Top Start */}
      <button
        className={`scrollToTop d-none d-md-flex d-center rounded ${isActive ? "active" : ""}`}
        aria-label="scroll Bar Button"
        onClick={scrollToTop}
        style={{background: "rgb(245, 192, 109)"}}
      >
        <i className="mat-icon fs-four nb4-color ti ti-arrow-up"></i>
      </button>
      {/* Scroll To Top End */}

      {/* header-section start */}
      <header
        className={`header-section a2-bg header-menu w-100 ${scrolled ? "animated fadeInDown header-fixed" : ""}`}
        style={headerStyle}
      >
        <div className=" d-center" style={{ width: "100%", padding: isMobile ? 0 : undefined }}>
          <nav
            className="navbar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: isMobile ? "12px 16px" : "12px 24px",
              flexWrap: "nowrap",
              gap: "10px",
              position: "relative",
            }}
          >
            {/* 1️⃣ LEFT: LOGO */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <a
                href="#home"
                onClick={(e) => { e.preventDefault(); handleNavClick("home"); }}
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                <img
                  src={isMobile ? favLogo : logo}
                  alt="logo"
                  style={{ maxWidth: isMobile ? "100px" : "180px" }}
                />
              </a>
            </div>

            {/* 2️⃣ MENU */}
            <div
              style={{
                position: isMobile ? "absolute" : "static",
                top: isMobile ? "100%" : "auto",
                left: isMobile ? "-16px" : "auto",
                right: isMobile ? "-16px" : "auto",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "flex-start" : "center",
                alignItems: isMobile ? "flex-start" : "center",
                flex: isMobile ? "none" : 1,
                width: isMobile ? "calc(100% + 32px)" : "auto",
                background: isMobile ? "#0a0a0a" : "transparent",
                borderRadius: 0,
                overflow: "hidden",
                maxHeight: isMobile ? (menuOpen ? "80vh" : "0px") : "none",
                opacity: isMobile ? (menuOpen ? 1 : 0) : 1,
                transform: isMobile
                  ? menuOpen
                    ? "translateY(0)"
                    : "translateY(-20px)"
                  : "none",
                padding: isMobile ? (menuOpen ? "20px 24px" : "0px 24px") : 0,
                zIndex: 1000,
                transition: "max-height 0.5s ease, opacity 0.4s ease, transform 0.4s ease, padding 0.4s ease",
              }}
            >
              <ul
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? "16px" : "28px",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  alignItems: isMobile ? "flex-start" : "center",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {navItems.map((item) => (
                  <li key={item.label} style={{ listStyle: "none", width: isMobile ? "100%" : "auto" }}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        padding: "8px 0",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        width: isMobile ? "100%" : "auto",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Mobile me Login/SignUp */}
              {isMobile && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid #333",
                  }}
                >
                  <Link to="/login" style={{ textDecoration: "none" }}>
                                        <div style={{ background: "#f5c06d", color: "#000", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                      Login <i className="ti ti-arrow-right"></i>
                    </div>
                  </Link>

                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <div style={{ background: "#f5c06d", color: "#000", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                      Sign Up <i className="ti ti-arrow-right"></i>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 3️⃣ RIGHT: LOGIN / SIGNUP — Desktop */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <div style={{ color: "#f5c06d", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Login <i className="ti ti-arrow-right"></i>
                  </div>
                </Link>

                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <div style={{ background: "#f5c06d", color: "#000", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Sign Up <i className="ti ti-arrow-right"></i>
                  </div>
                </Link>
              </div>
            )}

            {/* 4️⃣ Mobile Toggle */}
            {isMobile && (
              <button
                type="button"
                aria-label="Navbar Toggler"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "36px",
                  height: "36px",
                  position: "relative",
                  flexShrink: 0,
                  marginLeft: "auto",
                  
                }}
              >
                <span style={{ display: "block", width: "24px", height: "2px", background: "#ecb074", borderRadius: "2px", position: "absolute", transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)", transform: menuOpen ? "rotate(45deg)" : "translateY(-8px)" }}></span>
                <span style={{ display: "block", width: "24px", height: "2px", background: "#ecb074", borderRadius: "2px", position: "absolute", transition: "all 0.3s ease", opacity: menuOpen ? 0 : 1, transform: menuOpen ? "translateX(20px)" : "translateY(0)" }}></span>
                <span style={{ display: "block", width: "24px", height: "2px", background: "#ecb074", borderRadius: "2px", position: "absolute", transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)", transform: menuOpen ? "rotate(-45deg)" : "translateY(8px)" }}></span>
              </button>
            )}
          </nav>
        </div>
      </header>
      {/* header-section end */}


{/* hero section start */}
<section
  id="home"
  className="hero-section--secondary position-relative z-0"
  style={sectionStyle}
>
  <div
    className="container pt-5 pt-lg-20 mt-5 mt-lg-20"
    style={{
      opacity: 0.95,
      paddingLeft: isMobile ? "20px" : "20px",
      paddingRight: isMobile ? "20px" : "20px",
    }}
  >
    <div className="row align-items-center gy-5 gy-lg-0">
      <div className="col-12 col-lg-6 col-xxl-7">
        <div className="hero-content">

          {/* Sub heading */}
          <div
            className="banner_content--sub text--base fw-medium right-reveal"
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "16px",
              color: "rgb(245, 192, 109)",
              fontSize: isMobile ? "14px" : "18px",   // ✅ mobile pe chhota
            }}
          >
            Invest Smart, Trade Smarter
          </div>

          {/* Main heading */}
          <h1
            className="right-reveal text-white"
            style={{
              marginBottom: "20px",
              lineHeight: "1.2",
              fontSize: isMobile ? "32px" : "clamp(28px, 5vw, 56px)",  // ✅ mobile pe fix
            }}
          >
           TRADE GLOBAL MARKETS
            <span style={{ color: "rgb(245, 192, 109)" }}>
              WITH SAMFOREX
            </span>
          </h1>

          {/* Paragraph */}
          <p
            className="fs-18 fw-medium right-reveal"
            style={{
              color: "#fff",                          // ✅ mobile pe white better
              opacity: 0.9,
              marginBottom: "28px",
              fontSize: isMobile ? "14px" : "clamp(14px, 2vw, 18px)",
              maxWidth: isMobile ? "100%" : "600px",
            }}
          >
            Whether you're just starting or you're a seasoned trader, <br />
            our platform offers comprehensive secure.
          </p>

          {/* Button */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <Link to="/login">
              <div
                className="cmn-btn secondary-alt fs-five nb4-xxl-bg"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgb(245, 192, 109)",
                  color: "#000",
                  padding: isMobile ? "10px 20px" : "12px 28px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  textDecoration: "none",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                Start Trading <i className="ti ti-trending-up"></i>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  </div>
</section>
{/* hero section end */}



        {/* Why Trade start */}
        <section className="why-trade s1-bg alt-color position-relative z-0" style={{marginTop: "1px"}}>
          <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1">
            <img src={sun} alt="vector" className="position-absolute push_animat" />
            <img src={star} alt="vector" className="position-absolute d-xxxl-flex previewSkew" />
          </div>
          <div className="container">
            <div className="row gy-3 gy-lg-0 justify-content-center">
              <div className="col-sm-7 col-lg-6 col-xxl-5 order-2 order-lg-0">
                <div className="why-trade__thumbs h-100 d-flex align-items-end ps-20 ps-sm-5 ps-lg-0">
                  <img src={whyTrade} alt="Imgae" />
                </div>
              </div>
              <div className="col-lg-6 col-xxl-7">
                <div className="row pt-120 pb-120">
                  <div className="col-xxl-6 offset-xxl-2">
                    <div className="why-trade__part">
                      <span className="heading fs-five">Why Trade With</span>
                      <h3 className="mb-3 mt-5">Trade Genius</h3>
                      <p>Trading is the art and science of buying and selling financial instruments, such as stocks bonds currencies. </p>
                      <a href="about.html" className="cmn-btn link secondary-link fs-six-up gap-2 gap-lg-3 align-items-center mt-5"> Learn more <i className="ti ti-arrow-narrow-right fs-four"></i></a>
                    </div>
                  </div>
                  <div className="col-xxl-12 mt-7 mt-md-8 mt-xxl-3">
                    <div className="why-trade__part d-flex align-items-center">
                      <div className="vector d-none d-xxl-flex px-xxl-15">
                        <img src={tradeVector} alt="Image" className="max-xxl-un" />
                      </div>
                      <div className="content">
                        <h3 className="mb-3">Trade Apex</h3>
                        <p>Trading is the art and science of buying and selling financial instruments, suc stocks, bonds, currencies commodities, and cryptocurrencies, with the aim of making a profit. It's a dynamic and multifaceted professionals from around the world.</p>
                        <a href="about.html" className="cmn-btn link secondary-link fs-six-up gap-2 gap-lg-3 align-items-center mt-5"> Learn more <i className="ti ti-arrow-narrow-right fs-four"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* provide-world start */}
        <section id="traders" className="provide-world bg nb4-bg pt-120 pb-120 position-relative z-0">
          <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1 d-none d-md-flex">
            <img src={buttonImg} alt="vector" className="position-absolute pt-6 pt-xl-15 previewShapeRevX mt-5" style={{width: "150px"}} />
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xxl-7">
                <div className="heading__content mb-10 mb-lg-15 text-center">
                  <span className="heading p1-color fs-five mb-5">We Provide World's</span>
                  <h3 className="mb-5 mb-lg-6 text-white">Join a club of more than <span className="s1-color">480,000</span> traders</h3>
                  <p className="fs-six-up mx-ch mx-auto">Trading is the art and science of buying and selling financial instruments, such as stocks bonds currencies commodities</p>
                </div>
              </div>
            </div>
            <div className="row gy-6 gy-xxl-0">
              <div className="col-md-6 col-xxl-4">
                <div className="provide-world__card01 nb3-bg text-center cus-rounded-1 py-5 py-lg-10 px-4 px-lg-9">
                  <span className="provide-card__icon d-center nb4-bg p-4 rounded-circle mx-auto"><i className="ti ti-award-filled fs-three p1-color"></i></span>
                  <h4 className="mt-5 mb-5 text-white">Best Reputation</h4>
                  <p>transformed the trading landscape. Online trading platforms and mobile apps have made it easier than ever for individuals</p>
                </div>
              </div>
              <div className="col-md-6 col-xxl-4">
                <div className="provide-world__card01 nb3-bg text-center cus-rounded-1 py-5 py-lg-10 px-4 px-lg-9">
                  <span className="provide-card__icon d-center nb4-bg p-4 rounded-circle mx-auto"><i className="ti ti-users fs-three p1-color"></i></span>
                  <h4 className="mt-5 mb-5 text-white">480,000+ Clients</h4>
                  <p>One of the fundamental principles of trading is risk management. Successful traders carefully manage their capital,</p>
                </div>
              </div>
              <div className="col-md-6 col-xxl-4">
                <div className="provide-world__card01 nb3-bg text-center cus-rounded-1 py-5 py-lg-10 px-4 px-lg-9">
                  <span className="provide-card__icon d-center nb4-bg p-4 rounded-circle mx-auto"><i className="ti ti-shield-check-filled fs-three p1-color"></i></span>
                  <h4 className="mt-5 mb-5 text-white">Trusted and Secure</h4>
                  <p>Trading is not without its challenges, as markets can be highly volatile and unpredictable. It requires discipline</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* provide-world start (heat map) */}
        <section id="markets" className="provide-world pt-120 pb-120 position-relative z-0">
          <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1">
            <img src={vectorImg} alt="vector" className="position-absolute top-0 pt-120 ms-20 ps-xxl-20 jello d-none d-xl-flex"style={{width: '160px'}} />
            <img src={vector9Img} alt="vector" className="position-absolute rotate top-0 end-0 p-20 mt-5 me-7 d-none d-xxxl-flex" />
            <img src={vectorRocket1Img} alt="vector" className="position-absolute bottom-0 start-0 d-none d-xxxl-flex pb-120 mb-10 ms-20 fadeInTopRight" />
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xxl-7">
                <div className="heading__content mb-10 mb-lg-15 text-center">
                  <h3 className="mb-5 mb-lg-6 text-white">Low spreads on more than 150 instruments </h3>
                </div>
              </div>
            </div>
            <div className="row gy-6 gy-xxl-0">
              <div className="col-12">
                <iframe
                  scrolling="no"
                  allowTransparency="true"
                  frameBorder="0"
                  src="https://www.tradingview-widget.com/embed-widget/forex-heat-map/?locale=in#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A400%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%2C%22CNY%22%5D%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22dark%22%2C%22utm_source%22%3A%22shiningstarmarkets.com%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22forex-heat-map%22%2C%22page-uri%22%3A%22shiningstarmarkets.com%2F%22%7D"
                  title="forex heat-map TradingView widget"
                  lang="en"
                  className="custom-tradingview-widget"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Trade On start */}
        <section id="trade-on-our" className="trade_on a2-bg pt-120 pb-120 position-relative z-0">
          <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1">
            <img src={coinImg} alt="vector" className="position-absolute d-none d-md-flex previewShapeRevX" />
            <img src={star2Img} alt="vector" className="position-absolute d-none d-xl-flex push_animat" />
            <img src={coinVectorImg} alt="vector" className="position-absolute d-none d-xxxl-flex bottom-0 end-0 previewShapeRevX opacity-50" />
          </div>
          <div className="container">
            <div className="row gy-10 gy-xxl-0 justify-content-center justify-content-xxl-between align-items-center">
              <div className="col-lg-6 col-xxl-5">
                <div className="trade_on__content">
                  <span className="heading s1-color fs-five mb-5">Trade On Our</span>
                  <h3 className="mb-4 mb-lg-5 text-white">World Class Platform</h3>
                  <p className="fs-six mx-ch">Trading in financial markets involves a wide range of strategies that traders employ to make informed decisions. From trading to swing trading and long-term investing, each strategy has its own set of principles and risk factors.</p>
                  <ul className="d-flex gap-4 flex-column mt-6">
                    <li className="d-flex align-items-center gap-3 fs-six-up"><i className="ti ti-circle-check s1-color fs-four"></i>Charts trading</li>
                    <li className="d-flex align-items-center gap-3 fs-six-up"><i className="ti ti-circle-check s1-color fs-four"></i>Understanding Trading Strategies </li>
                    <li className="d-flex align-items-center gap-3 fs-six-up"><i className="ti ti-circle-check s1-color fs-four"></i>Risk Management in Trading </li>
                    <li className="d-flex align-items-center gap-3 fs-six-up"><i className="ti ti-circle-check s1-color fs-four"></i>Technical vs. Fundamental Analysis </li>
                  </ul>
                  <a href="signup.html" className="cmn-btn secondary-alt fs-six-up nb4-xxl-bg gap-2 gap-lg-3 align-items-center py-2 px-5 py-lg-3 px-lg-6 mt-7 mt-xxl-8">Sign up Now <i className="ti ti-arrow-right fs-four"></i></a>
                </div>
              </div>
              <div className="col-md-8 col-lg-6">
                <div className="trade_on__thumbs d-flex justify-content-end">
                  <img src={tradeOnImg} alt="Imgae" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* blog_news start */}
        <section className="blog_news pt-120 pb-120 position-relative z-0">
          <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1">
            <img src={starImg} alt="vector" className="position-absolute" />
            <img src={vector2Img} alt="vector" className="position-absolute bottom-0 start-0" />
            <img src={sunImg} alt="vector" className="position-absolute" />
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="heading__content d-flex row-gap-7 gap-20 flex-wrap justify-content-between align-items-center mb-10 mb-lg-15">
                <div className="heading__part">
                  <span className="heading s1-color fs-five mb-5">Blog</span>
                  <h3 className='text-white'>News &amp; Analysis</h3>
                </div>
                <a href="#" className="cmn-btn link fs-six-up gap-2 gap-lg-3 align-items-center"> See All <i className="ti ti-arrow-right fs-four"></i></a>
              </div>
            </div>
            <div className="row gy-6">
              {/* Card 1 */}
              <div className="col-md-6 col-xxl-4">
                <div className="blog_news__card0 nb3-bg cus-rounded-1 overflow-hidden">
                  <div className="blog_news__thumbs position-relative">
                    <img src={blogNewsImg} alt="Image" className="w-100" />
                    <a href="#" className="border border-color second nw1-color fs-seven rounded-3 position-absolute top-0 end-0 py-1 px-3 mt-5 me-5" style={{color: 'rgb(245, 192, 109)'}}>News</a>
                  </div>
                  <div className="blog_news__content py-6 py-lg-7 py-xxl-8 px-4 px-lg-5 px-xxl-6">
                    <a href="blog-details.html"><h5 className="mb-4 mb-lg-5 text-white">Trading Psychology: Mastering Your Mind for Profit</h5></a>
                    <div className="fs-seven fw_500 d-flex row-gap-0 flex-wrap gap-3 mb-4 mb-lg-5">August 17,2023 <span>|</span> Written by jason Turner</div>
                    <p>Trading in financial markets involves a wide employ to make informed decisions.</p>
                    <a href="#" className="link fs-five fw-semibold d-flex gap-2 gap-lg-3 align-items-center mt-6 mt-lg-8" style={{color: 'rgb(245, 192, 109)'}}> Continue Reading <i className="ti ti-arrow-right"></i></a>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-md-6 col-xxl-4">
                <div className="blog_news__card0 nb3-bg cus-rounded-1 overflow-hidden">
                  <div className="blog_news__thumbs position-relative">
                    <img src={blogNews2Img} alt="Image" className="w-100" />
                    <a href="#" className="border border-color second nw1-color fs-seven rounded-3 position-absolute top-0 end-0 py-1 px-3 mt-5 me-5" style={{color: 'rgb(245, 192, 109)'}}>Features</a>
                  </div>
                  <div className="blog_news__content py-6 py-lg-7 py-xxl-8 px-4 px-lg-5 px-xxl-6">
                    <a href="#"><h5 className="mb-4 mb-lg-5 text-white">Trading Pitfalls Common Mistakes and How to Avoid Them...</h5></a>
                    <div className="fs-seven fw_500 d-flex flex-wrap row-gap-0 gap-3 mb-4 mb-lg-5">August 17,2023 <span>|</span> Written by jason Turner</div>
                    <p>Trading in financial markets involves a wide employ to make informed decisions.</p>
                    <a href="#" className="link fs-five fw-semibold d-flex gap-2 gap-lg-3 align-items-center mt-6 mt-lg-8" style={{color: 'rgb(245, 192, 109)'}}> Continue Reading <i className="ti ti-arrow-right"></i></a>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-md-6 col-xxl-4">
                <div className="blog_news__card0 nb3-bg cus-rounded-1 overflow-hidden">
                  <div className="blog_news__thumbs position-relative">
                    <img src={blogNews3Img} alt="Image" className="w-100" />
                    <a href="#" className="border border-color second nw1-color fs-seven rounded-3 position-absolute top-0 end-0 py-1 px-3 mt-5 me-5" style={{color: 'rgb(245, 192, 109)'}}>News</a>
                  </div>
                  <div className="blog_news__content py-6 py-lg-7 py-xxl-8 px-4 px-lg-5 px-xxl-6">
                    <a href="#"><h5 className="mb-4 mb-lg-5 text-white">Trading Platforms: Tools for Success in Financial Markets</h5></a>
                    <div className="fs-seven fw_500 d-flex flex-wrap row-gap-0 gap-3 mb-4 mb-lg-5">August 17,2023 <span>|</span> Written by jason Turner</div>
                    <p>Trading in financial markets involves a wide employ to make informed decisions.</p>
                    <a href="#" className="link fs-five fw-semibold d-flex gap-2 gap-lg-3 align-items-center mt-6 mt-lg-8" style={{color: 'rgb(245, 192, 109)'}}> Continue Reading <i className="ti ti-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section Starts */}
        <section id="faq" className="faq a2-bg pb-120 pt-120 position-relative z-0">
          <div className="animation vector position-absolute top-0 left-0 w-100 h-100 z-n1">
            <img src={buttonImg} alt="vector" className="position-absolute pt-6 pt-xl-15 previewShapeRevX d-none d-md-flex" />
            <img src={star2Img} alt="vector" className="position-absolute push_animat end-0 top-0 mt-20 pt-5 me-xl-20 pe-5 d-none d-md-flex" />
            <img src={vector20Img} alt="vector" className="position-absolute bottom-0 start-0 ps-8 pb-10 d-none d-xxxl-flex" />
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xxl-7">
                <div className="heading__content mb-10 mb-lg-15 text-center">
                  <span className="heading fs-five mb-5" style={{color: 'rgb(245, 192, 109)'}}> Faq's</span>
                  <h3 className='text-white'>Frequently Asked Question</h3>
                </div>
              </div>
            </div>
            <div className="row gy-10 justify-content-center align-items-center">
              <div className="col-md-12 col-lg-7 col-xxl-6">
                <div className="faq__part">
                  <div className="accordion-section d-grid gap-6">
                    {faqData.map((faq, index) => (
                      <div key={index} className={` accordion-single cus-rounded-1 nb3-bg box-shadow py-3 py-md-4 px-4 px-md-5 ${activeIndex === index ? "active" : ""}`}>
                        <h5 className="header-area">
                          <button className="text-white accordion-btn transition fw-semibold text-start d-flex position-relative w-100" type="button" onClick={() => toggleAccordion(index)}>
                            {faq.q}
                          </button>
                        </h5>
                        {activeIndex === index && (
                          <div className="content-area">
                            <div className="content-body pt-5"><p>{faq.a}</p></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-9 col-sm-8 col-lg-5 col-xxl-6">
                <div className="faq_thumbs d-flex justify-content-center justify-content-xl-end">
                  <img src={faqImg} alt="image" />
                </div>
              </div>
            </div>
          </div>
        </section>
  

      {/* Footer Section Starts */}
      <footer className="footer a2-bg position-relative pt-15 pt-lg-0 z-0">
        <div className="animation position-absolute top-0 left-0 w-100 h-100 z-n1 d-none d-xxxl-flex">
          <img src={vectorImg} alt="vector" className="position-absolute jello" />
          <img src={vector4Img} alt="vector" className="position-absolute bottom-0 end-0" />
        </div>
        <div className="container">
          <div className="start-earning nb3-bg cus-rounded-2 d-flex align-items-center p-4 p-sm-6 p-md-10 p-lg-15 p-xl-20 pe-lg-6 pe-xl-16 overflow-hidden position-relative">
            <div className="vector_effect position-absolute d-center justify-content-end end-0 d-flex gap-20">
              <img src={star2Img} alt="vector" className="d-none d-xxl-flex push_animat" />
              <img src={star01} alt="vector" className="d-none d-sm-flex rotate time_dur ms-auto ms-lg-0 me-md-5" />
            </div>
            <div className="row gy-6 w-100 text-center text-sm-start align-items-center justify-content-sm-between">
              <div className="col-sm-8 text-white">
                <h2 className='text-white'>Start earning with only $20</h2>
                <p className="fs-six-up fw_500 mt-5">Try our super easy portal for free</p>
              </div>
              <div className="col-sm-4 text-sm-end">
                <Link to="/signup">
                <div className="cmn-btn secondary-alt ms-auto fs-five nb4-xxl-bg gap-2 align-items-center py-2 px-4 py-lg-3 px-lg-5">Register <i className="ti ti-arrow-right fs-four"></i></div>
                </Link>
              </div>
            </div>
          </div>

          <div className="row gy-8 gy-sm-12 gy-lg-0 pt-120 pb-120">
            <div className="col-6 col-lg-3">
              <div className="footer__part">
                <h4 className="mb-6 mb-lg-8 text-white ">Quick Link</h4>
                <ul className="footer_list d-flex flex-column gap-2 gap-sm-3 gap-md-4">
                  <li><a className="n2-color" href="legal-docs.html">Home</a></li>
                  <li><div id="markets" className="n2-color d-flex align-items-center"> markets</div></li>
                  <li><a className="n2-color" href="education.html">Traders</a></li>
                  <li><a className="n2-color" href="support.html">Trade On Our</a></li>
                </ul>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="footer__part">
                <h4 className="mb-6 mb-lg-8 text-white">Trade On Our</h4>
                <ul className="footer_list d-flex flex-column gap-2 gap-sm-3 gap-md-4">
                  <li><a className="n2-color" href="about.html">About</a></li>
                  <li><a className="n2-color" href="blog.html">Blog</a></li>
                  <li><a className="n2-color" href="careers.html">Carreers</a></li>
                </ul>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="footer__part">
                <h4 className="mb-6 mb-lg-8 text-white">Legal</h4>
                <ul className="footer_list d-flex flex-column gap-2 gap-sm-3 gap-md-4">
                  <li><a className="n2-color" href="terms-conditions.html">Terms &amp; Conditions</a></li>
                  <li><a className="n2-color" href="privacy-policy.html">Privacy &amp; Policy</a></li>
                  <li><a className="n2-color" href="contact.html">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="footer__part">
                <h4 className="mb-6 mb-lg-8 text-white">Contact Us</h4>
                <div className="d-flex flex-column gap-2 gap-sm-3 gap-md-4">
                  <a href="mailto:support@.com">support@abc.com</a>
                  <a href="tel:+123456789">+0123 456 789</a>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 border-top border-color opac-20 py-7 py-xxl-8">
              <div className="footer__copyright d-center gap-15 flex-wrap justify-content-md-between">
                <p className="fs-six order-2 order-md-0 text-center text-md-start">
                  Copyright ©<span className="currentYear">2026</span> Sameforex <span>|</span> Designed By <a href="#" className="p1-color0" style={{color: "rgb(245, 192, 109)"}}> Samforex</a>
                </p>
                <ul className="social-area d-center gap-2 gap-md-3">
                  <li><a className="d-center cus-rounded-1 fs-four" href="#"><i className="ti ti-brand-facebook"></i></a></li>
                  <li><a className="d-center cus-rounded-1 fs-four" href="#"><i className="ti ti-brand-twitch"></i></a></li>
                  <li><a className="d-center cus-rounded-1 fs-four" href="#"><i className="ti ti-brand-instagram"></i></a></li>
                  <li><a className="d-center cus-rounded-1 fs-four" href="#"><i className="ti ti-brand-discord-filled"></i></a></li>
                  <li><a className="d-center cus-rounded-1 fs-four" href="#"><i className="ti ti-brand-youtube"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;