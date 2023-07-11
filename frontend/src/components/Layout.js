import React from "react";

const Layout = ({ children, loading }) => {
  console.log(`RV: ${React.version}`);

  return [
    <div className="content">
      { children }
    </div>,

    <a href="#" className="back-to-top"><i className="icofont-simple-up"/></a>,
    loading && <div id="preloader"/>
  ]
}

export default Layout;