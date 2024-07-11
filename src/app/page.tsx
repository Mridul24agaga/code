'use client';

import Sidebar from "./_components/Sidebar";
import ChatArea from "./_components/ChatArea";


const Page = () => {
  return <div className="h-screen flex">

    <div className="hidden lg:flex">
      <Sidebar />
    </div>

    <ChatArea />

  </div>;
};

export default Page;
