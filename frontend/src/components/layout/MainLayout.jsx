import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
