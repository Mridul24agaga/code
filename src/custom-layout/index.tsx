"use client";
import { saveAndGetCurrentUser } from "@/actions/users";
import usersGlobalStore from "@/store/users-store";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";


function CustomLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  if (pathname.includes("/sign-in") || pathname.includes("/sign-up")) {
    return <>{children}</>;
  }

  const { setLoggedInUserData, loggedInUserData }: any = usersGlobalStore();

  const [loading, setLoading] = useState(false);

  const getLoggedInUser = async () => {

    try {

      setLoading(true);

      const response: any = await saveAndGetCurrentUser();

      if (response.success) {

        setLoggedInUserData(response.data);

      } else {

        message.error("Something went wrong! Please try again after sometime!");

      }
    } catch (error) {
      
      message.error("Something went wrong! Please try again after sometime!");

    } finally {

      setLoading(false);

    }
  };
  

  useEffect(() => {
    getLoggedInUser();
  }, []);
  

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center bg-chatareacolor">
        
        <Spin className="sidebar-spinner" size="large" />

      </div>
    );
  }

  if (!loggedInUserData) return null;

  return <div>{children}</div>;
}

export default CustomLayout;